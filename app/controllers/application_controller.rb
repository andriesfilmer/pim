class ApplicationController < ActionController::Base
  # load_defaults is off, so CSRF checking is not enabled by default. Turn it
  # on explicitly. Raises on a missing/invalid token instead of silently
  # nulling the session. form_with and csrf_meta_tags already emit the token;
  # JS POSTs (offline_data) send it via the X-CSRF-Token header.
  protect_from_forgery with: :exception

  before_action :authenticate_user!, except: %i[about welcome]

  private

  # Strip path separators and null bytes to prevent directory traversal.
  def sanitize_filename(name)
    File.basename(name.to_s).gsub(/[\x00\/\\]/, '')
  end
end
