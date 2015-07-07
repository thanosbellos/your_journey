class CommentsController < ApplicationController
  before_filter :authenticate_user!, only: [:create]
  def create
    @trail = Trail.find(params[:trail_id])
    @comment = @trail.comments.build(comment_params)
    @comment.user_id = current_user.id
    if @comment.save
      @new_comment = @trail.comments.new
      respond_to do |format|
        format.html do
          flash[:success] = 'Comment posted.'
          redirect_to user_trail_path(@trail.id , @trail.users.first)
        end
        format.js
      end
    else
      @new_comment = @comment
      respond_to do |format|
        format.html {render @comment}
        format.js  { render 'failed_save'}

      end
    end
  end

  def destroy
    @trail = Trail.find(params[:trail_id])
    @comment = @trail.comments.find(params[:id])
    @comment.destroy
    respond_to do |format|
      format.html {redirect_to usert_trail_path(@trail.id , @trail.users.first)}
      format.js

    end
  end

  private
  def comment_params
    params.require(:comment).permit(:body)
  end
end
