require 'bcrypt'
require 'yaml'

class User
  include BCrypt
  attr_reader :name

  def initialize(username)
    @name = username.capitalize
  end

  def self.authenticate(params = {})
    @@credentials ||= YAML.load_file(File.join(__dir__, '../credentials.yml'))

    username = params[:username].downcase

    admin_pw_hash = Password.new(@@credentials['admin_password_hash'])
    friend_pw_hash = Password.new(@@credentials['friend_password_hash'])    

    admin = @@credentials['admin_username'] == username && admin_pw_hash == params[:password]
    friend = @@credentials['friend_username'] == username && friend_pw_hash == params[:password]

    User.new(username) if admin || friend
  end
end
