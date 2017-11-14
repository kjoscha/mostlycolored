require 'sinatra'
require 'json'
require 'mini_magick'
require 'byebug'
# require 'fileutils'

use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']  
end

get '/' do
  @galleries = galleries
  haml :index
end

get '/galleries' do
  halt 200, galleries.to_json
end

get '/get_galleries' do
  halt 200, galleries(params[:password]).to_json
end

post '/save_image' do
  filename = params[:file][:filename]
  file = params[:file][:tempfile]
  folder = params[:folder]

  validate_file(file)
  make_dir_if_not_exists(folder)
  save_and_resize(folder, file, filename)

  status 200
end

post '/create_gallery' do
  password = params[:password]
  name = params[:name]
  password == '' ? folder = name : folder = "#{name}___#{password}"
  make_dir_if_not_exists(folder)
  halt 200, galleries(params[:password]).to_json
end

private

def make_dir_if_not_exists(folder)
  unless Dir.exist?("./public/images/#{folder}")
    Dir.mkdir("./public/images/#{folder}")
    Dir.mkdir("./public/images/#{folder}/thumbnails")    
  end
end

def validate_file(file)
  accepted_formats = ['.jpg', '.jpeg', '.JPG', '.png', '.PNG', '.gif']
  unless file.size < 8_000_000 && accepted_formats.include?(File.extname(file))
    return status 415
  end
end

def save_and_resize(folder, file, filename)
  path = "./public/images/#{folder}/#{filename}"
  
  File.open(path, 'wb') { |f| f.write(file.read) }

  thumbnail = MiniMagick::Image.open(path)
  thumbnail.resize '200x200'
  thumbnail.write "./public/images/#{folder}/thumbnails/#{filename}"

  image = MiniMagick::Image.new(path)
  image.resize '1600x1600'
end

def galleries(password = '')
  Dir['public/images/*'].map do |dir|
    folder = dir.gsub('public/images/', '')
    if visible?(dir, password)
      images = []
      Dir.glob("#{dir}/*").each do |image|
        next if image.include?('thumbnails')
        filename = File.basename(image)
        full_image = image.gsub('public/', '')
        thumbnail = "#{dir}/thumbnails/#{filename}".gsub('public/', '')
        images << [full_image, thumbnail]
      end
    else
      images = 'locked'
    end

    name = folder.split('___')[0]
    last_changed_at = File.ctime(dir).to_s
    [name, images, last_changed_at, folder]
  end.compact.sort_by {|obj| obj[2]}
end

def visible?(dir, password)
  # galleries are hidden when '___' appears in name
  # Right part of the name is the search string to unlock
  !dir.include?('___') || password == dir.split('___')[1]
end
