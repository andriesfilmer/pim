class PostVersionsController < ApplicationController

  def index
    @post_versions = PostVersion.where(org_id: params[:org_id], user_id: current_user.id).order("id desc")
  end

  def show

    @post = PostVersion.where(id: params[:id], user_id: current_user.id).take!
    @post.updated_at = @post.created_at

    render "posts/show"
  end

  def restore
    @post_version = PostVersion.where(id: params[:version_id], user_id: current_user.id).take!
    @post = Post.where(id: @post_version.org_id, user_id: current_user.id).take!
    @post.update(@post_version.attributes.except("org_id", "id", "user_id"))
    redirect_to post_path(@post), notice: "Post restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = PostVersion.where(id: @first_id, user_id: current_user.id).take!.pretty_inspect
    @second = PostVersion.where(id: @second_id, user_id: current_user.id).take!.pretty_inspect
  end

end
