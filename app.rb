require 'sinatra/base'
require 'json'
require 'mini_magick'
require 'byebug'
require 'zip'
require 'sys/filesystem'

require_relative 'lib/authentication'
require_relative 'lib/user'

class App < Sinatra::Base
  use Rack::Session::Pool, expire_after: 30 * 60 # Expire sessions after 30 minutes of inactivity
  helpers Authentication

  before do
    pass if %w[login].include? request.path_info.split('/')[1]
    authenticate!
  end

  get '/login' do
    haml :login
  end

  post '/login' do
    if user = User.authenticate(params)
      session[:user] = user
      redirect_to_original_request
    else
      redirect '/login'
    end
  end

  get '/' do
    clean_zips(3 * 60 * 60) # remove all zip files older than 3 hours
    @disk_space = disk_space
    @galleries = galleries
    haml :index
  end

  get '/galleries' do
    halt 200, galleries.to_json
  end

  get '/get_galleries' do
    halt 200, galleries(params[:password]).to_json
  end

  post '/delete_gallery' do
    if admin?
      FileUtils.rm_r(("./public/images/#{params[:folder]}"))
      status 200
    end
  end

  post '/save_image' do
    filename = params[:file][:filename]
    file = params[:file][:tempfile]
    folder = params[:folder]

    if file_valid?(file)
      make_dir_if_not_exists(folder)
      save_and_resize(folder, file, filename, 3000)
      status 200
    else
      status 415
    end
  end

  post '/create_gallery' do
    password = params[:password]
    name = params[:name]
    password == '' ? folder = name : folder = "#{name}___#{password}"
    make_dir_if_not_exists(folder)
    halt 200, galleries(params[:password]).to_json
  end

  get '/zip' do
    dir = "./public/images/#{params[:folder]}"
    folder_without_pw = params[:folder].split('___')[0]
    timestamp_suffix = Time.now.strftime('%Y%m%d%H%M%S')

    zipfile = "./public/images/#{folder_without_pw}_#{timestamp_suffix}.zip"

    images = Dir.glob("#{dir}/*").map do |image|
      image unless image.include?('thumbnails')
    end.compact

    Zip::File.open(zipfile, Zip::File::CREATE) do |zipfile|
      images.each do |image|
        zipfile.add(File.basename(image), image)
      end
    end

    download_link = zipfile.gsub('./public/', '')
    halt 200, download_link
  end

  private

  def admin?
    session[:user].name == 'Admin'
  end

  def make_dir_if_not_exists(folder)
    unless Dir.exist?("./public/images/#{folder}")
      Dir.mkdir("./public/images/#{folder}")
      Dir.mkdir("./public/images/#{folder}/thumbnails")
    end
  end

  def file_valid?(file)
    accepted_formats = ['.jpg', '.jpeg', '.JPG', '.png', '.PNG', '.gif']
    file.size < 15_000_000 && accepted_formats.include?(File.extname(file))
  end

  def save_and_resize(folder, file, filename, px)
    path = "./public/images/#{folder}/#{filename}"

    unless File.file?(path)
      File.open(path, 'wb') { |f| f.write(file.read) }

      thumbnail = MiniMagick::Image.open(path)
      thumbnail.resize '200x200'
      thumbnail.write "./public/images/#{folder}/thumbnails/#{filename}"

      image = MiniMagick::Image.new(path)
      if image[:width] > px || image[:height] > px
        image.resize "#{px}x#{px}"
      end
    end
  end

  def galleries(password = '')
    Dir['public/images/*'].map do |dir|
      next if File.file?(dir)
      next unless visible?(dir, password)

      folder = dir.gsub('public/images/', '')
      images = images_in(dir)
      name = folder.split('___')[0]
      last_changed_at = File.ctime(dir).to_s
      [name, images, last_changed_at, folder]
    end.compact.sort_by {|obj| obj[2]}.reverse!
  end

  def images_in(dir)
    images = []
    Dir.glob("#{dir}/*").each do |image|
      next if File.directory?(image)
      filename = File.basename(image)
      full_image = image.gsub('public/', '')
      thumbnail = "#{dir}/thumbnails/#{filename}".gsub('public/', '')
      images << [full_image, thumbnail]
    end
    images.sort_by {|obj| obj[0]}
  end

  def visible?(dir, password)
    # galleries are hidden when '___' appears in name
    # Right part of the name is the search string to unlock
    !dir.include?('___') || admin? || password == dir.split('___')[1]
  end

  def file_age(f)
    Time.now - File.ctime(f)
  end

  def clean_zips(seconds)
    Dir.glob('public/images/*.zip').each do |f|
      File.delete(f) if file_age(f) > seconds
    end
  end

  def disk_space
    stat = Sys::Filesystem.stat('/')
    gigabytes = (
      stat.block_size.to_f * stat.blocks_available /
        1024 / 1024 / 1024
      ).round(2)
  end
end
