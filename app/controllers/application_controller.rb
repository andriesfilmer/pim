class ApplicationController < ActionController::Base
  before_action :authenticate_user!, except: %i[about welcome]

  private

  # Strip path separators and null bytes to prevent directory traversal.
  def sanitize_filename(name)
    File.basename(name.to_s).gsub(/[\x00\/\\]/, '')
  end
end
