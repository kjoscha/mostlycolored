require 'sinatra'
require 'json'
require 'mini_magick'

use Rack::Auth::Basic, "Restricted Area" do |username, password|
  [username, password] == ['admin', 'admin']  
end

get '/' do
  @galleries = gallery_dir
  haml :index
end

get '/galleries' do
  halt 200, gallery_dir.to_json
end

post '/save_image' do
  filename = params[:file][:filename]
  file = params[:file][:tempfile]
  folder = params[:folder]

  accepted_formats = ['.jpg', '.jpeg', '.JPG', '.png', '.PNG', '.gif']
  unless file.size < 8_000_000 && accepted_formats.include?(File.extname(file))
    return status 415
  end

  unless Dir.exist?("./public/images/#{folder}")
    Dir.mkdir("./public/images/#{folder}")
  end

  path = "./public/images/#{folder}/#{filename}"

  File.open(path, 'wb') do |f|
    f.write(file.read)
  end

  image = MiniMagick::Image.new(path)
  image.resize '1600x1600'

  status 200
end

post '/create_gallery' do
  name = params[:name]
  Dir.mkdir("./public/images/#{name}")
  halt 200, gallery_dir.to_json
end

private

def gallery_dir
  Dir['public/images/*'].map do |dir|
    folder = dir.gsub('public/images/', '')
    images = Dir.glob("#{dir}/*").map { |image| image.gsub('public/', '') }
    last_changed_at = File.ctime(dir).to_s

    [folder, images, last_changed_at]
  end.sort_by {|obj| obj[2]}
end
