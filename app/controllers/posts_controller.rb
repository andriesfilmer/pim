class PostsController < ApplicationController

  before_action :set_post, only: %i[ show edit update destroy ]

  def index
    @posts = Post.where(user_id: current_user.id).order("id desc").limit 10
  end

  def new
    @post = Post.new
  end

  def edit
    path = "#{Rails.root}/public/uploads/posts/#{@post.id}"
    FileUtils.mkdir_p(path) unless Dir.exists?(path)
    @files = Dir.children(path)
  end

  def create
    @post = Post.new(post_params)
    @post.user_id = current_user.id

    respond_to do |format|
      if @post.save
        format.html { redirect_to post_url(@post), notice: "Post was successfully created." }
        format.json { render :show, status: :created, location: @post }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @post.errors, status: :unprocessable_entity }
      end
    end

    # Create a copy for versions management.
    add_version(@post)

  end

  def update
    respond_to do |format|
      if @post.update(post_params)
        format.html { redirect_to post_url(@post), notice: "Post was successfully updated." }
        format.json { render :show, status: :ok, location: @post }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @post.errors, status: :unprocessable_entity }
      end
    end

    # Create a copy for versions management.
    add_version(@post)

    uploaded_file = params[:post][:picture]
    if uploaded_file.present?
      path = "#{Rails.root}/public/uploads/posts/#{@post.id}"
      FileUtils.mkdir_p(path) unless Dir.exists?(path)
      File.open(Rails.root.join('public', 'uploads','posts', @post.id.to_s, uploaded_file.original_filename), 'wb') do |file|
        file.write(uploaded_file.read)
       end
    end

  end

  def destroy
    @post.destroy
    respond_to do |format|
      format.html { redirect_to posts_url, notice: "Post was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  def search
    if params.dig(:post_search).present?
      search = "%#{params[:post_search]}%"
      @posts = Post.where("title LIKE ? OR content LIKE ? OR tags LIKE ?", search, search, search)
                   .order(updated_at: :desc)
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
    @postversion = Postversion.new(post_params.except("id","created_at","updated_at","picture"))
    @postversion.org_id = post.id
    @postversion.user_id = post.user_id
    @postversion.save
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_post
    @post = Post.where(user_id: current_user.id).where(id: params[:id]).take
  end

  # Only allow a list of trusted parameters through.
  def post_params
    params.require(:post).permit(:title, :content, :picture, :category, :tags)
  end

end
