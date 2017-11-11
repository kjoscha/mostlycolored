require 'sinatra'
require 'json'
require 'mini_magick'

use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']  
end

get '/' do
  @galleries = galleries
  haml :index
end

get '/:search_string' do
  @galleries = galleries(params[:search_string])
  haml :index
end


get '/galleries' do
  halt 200, galleries.to_json
end

post '/save_image' do
  filename = params[:file][:filename]
  file = params[:file][:tempfile]
  folder = params[:folder]

  validate_file(file)
  make_dir_if_not_exists(folder)
  save_and_resize(folder, filename)

  status 200
end

post '/create_gallery' do
  name = params[:name]
  Dir.mkdir("./public/images/#{name}")
  halt 200, galleries.to_json
end

private

def make_dir_if_not_exists(folder)
  unless Dir.exist?("./public/images/#{folder}")
    Dir.mkdir("./public/images/#{folder}")
  end
end

def validate_file(file)
  accepted_formats = ['.jpg', '.jpeg', '.JPG', '.png', '.PNG', '.gif']
  unless file.size < 8_000_000 && accepted_formats.include?(File.extname(file))
    return status 415
  end
end

def save_and_resize(folder, filename)
  path = "./public/images/#{folder}/#{filename}"
  
  File.open(path, 'wb') do |f|
    f.write(file.read)
  end

  image = MiniMagick::Image.new(path)
  image.resize '1600x1600'
end

def galleries(search_string = '')
  Dir['public/images/*'].map do |dir|
    # galleries are hidden when '___' appears in name
    # Right part of the name is the search string to unlock
    next if search_string != dir.split('___')[1] && dir.include?('___')

    folder = dir.gsub('public/images/', '')
    images = Dir.glob("#{dir}/*").map { |image| image.gsub('public/', '') }
    last_changed_at = File.ctime(dir).to_s

    [folder, images, last_changed_at]
  end.compact.sort_by {|obj| obj[2]}
end
