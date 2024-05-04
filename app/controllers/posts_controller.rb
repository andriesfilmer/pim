class PostsController < ApplicationController

  before_action :set_post, only: %i[ show edit update destroy destroy_image]

  def index
    @posts = Post.where(user_id: current_user.id).order("last_read desc").limit 10
  end

  def show
    @post.update_column(:last_read,DateTime.now)
    get_files
  end

  def new
    @post = Post.new
  end

  def edit
    get_files
  end

  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id

    respond_to do |format|
      if @post.save
        format.html { redirect_to post_url(@post), notice: "Post was successfully created." }
      else
        format.turbo_stream {
           render turbo_stream: turbo_stream.replace("postForm", partial: "posts/form", locals: { resource: @post })
        }
      end
    end

    # Create a copy for versions management.
    add_version(@post)

  end

  def update

    uploaded_file = params[:post][:file]
    if uploaded_file.present?
      path = "#{Rails.root}/public/uploads/posts/#{@post.id}"
      FileUtils.mkdir_p(path) unless Dir.exists?(path)
      File.open(Rails.root.join('public', 'uploads','posts', @post.id.to_s, uploaded_file.original_filename), 'wb') do |file|
        file.write(uploaded_file.read)
       end
    end

    respond_to do |format|
      if @post.update(post_params)
        format.turbo_stream {
          get_files
          render turbo_stream: turbo_stream.update("images", partial: "posts/images", locals: { resource: @post })
        } if uploaded_file
        format.html {
          redirect_to post_url(@post), notice: "Post was successfully updated."
        } unless uploaded_file
      else
        format.turbo_stream {
           render turbo_stream: turbo_stream.replace("postForm", partial: "posts/form", locals: { resource: @post })
        }
      end
    end

    # Create a copy for versions management.
    add_version(@post)

  end

  def destroy
    @post.destroy
    respond_to do |format|
      format.html { redirect_to posts_url, notice: "Post was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def destroy_image
    img = "#{Rails.root}/public/uploads/posts/#{@post.id}/#{params[:file]}"
    File.delete(img) if File.exist?(img)
    get_files
    respond_to do |format|
      format.turbo_stream {
         render turbo_stream: turbo_stream.update("images", partial: "posts/images", locals: { resource: @post })
      }
    end
  end

  def search
    if params.dig(:search).length > 2
      search = "%#{params[:search]}%"
      @posts = Post.where("title LIKE ? OR content LIKE ? OR tags LIKE ?", search, search, search)
                   .order(updated_at: :desc).where(user_id: current_user.id)
      cookies[:search] = params[:search]
    else
      @posts = []
    end
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.update("posts", partial: "posts", locals: { posts: @posts })
        ]
      end
    end
  end

  private

  def add_version(post)
    # Create a copy for versions management.
    @post_version = PostVersion.new(post_params.except("id","created_at","updated_at","file"))
    @post_version.org_id = post.id
    @post_version.user_id = post.user_id
    @post_version.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_post
    @post = Post.where(user_id: current_user.id).where(id: params[:id]).take
  end

  def get_files
    path = "#{Rails.root}/public/uploads/posts/#{@post.id}"
    FileUtils.mkdir_p(path) unless Dir.exists?(path)
    @files = Dir.children(path)
  end

  # Only allow a list of trusted parameters through.
  def post_params
    params.require(:post).permit(:title, :notes, :file, :category, :tags)
  end

end
