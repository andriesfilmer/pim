class PostversionsController < ApplicationController

  def index
    @postversions = Postversion.where(org_id: params[:org_id]).order("id desc")
  end

  def show

    @post = Postversion.find(params[:id])
    @post.updated_at = @post.created_at

    render "posts/show"
  end

  def restore
    @postversion = Postversion.find(params[:version_id])
    @post = Post.find(@postversion.org_id)
    @post.id = @postversion.org_id
    @post.update(@postversion.attributes.except("org_id","id"))
    redirect_to post_path(@post), notice: "Post restored"
  end

  def compare
    @first_id = params[:ids].split(',').first
    @second_id = params[:ids].split(',').second

    @first = Postversion.find(@first_id).pretty_inspect
    @second = Postversion.find(@second_id).pretty_inspect
  end

end
