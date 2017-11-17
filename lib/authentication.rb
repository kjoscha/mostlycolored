module Authentication
  def authenticate!
    unless session[:user]
      session[:original_request] = request.path_info
      redirect '/login'
    end
  end

  def redirect_to_original_request
    session[:original_request]
    user = session[:user]
    original_request = session[:original_request]
    session[:original_request] = nil
    redirect original_request
  end
end
