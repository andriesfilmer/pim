class PostVersionsController < ApplicationController

  def index
    @post_versions = PostVersion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @post = PostVersion.find(params[:id])
    @post.updated_at = @post.created_at

    render "posts/show"
  end

  def restore
    @post_version = PostVersion.find(params[:version_id])
    @post = Post.find(@post_version.org_id)
    @post.id = @post_version.org_id
    puts "######## @post_version.inspect #{@post_version.inspect}"
    @post.update(@post_version.attributes.except("org_id","id"))
    redirect_to post_path(@post), notice: "Post restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = PostVersion.find(@first_id).pretty_inspect
    @second = PostVersion.find(@second_id).pretty_inspect
  end

end
