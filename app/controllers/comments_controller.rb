class CommentsController < ApplicationController
  before_filter :set_comment, only: [:destroy]
  before_filter :authenticate_user!, only: [:create, :show]


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

    respond_to do |format|
      if current_user == @commenter  || current_user == @comment.trail.users.first

        puts "Breakpoint"
        @comment.destroy

        format.html {redirect_to usert_trail_path(@trail.id , @trail.users.first)}
        format.js

      else

        format.html do
          flash[:error] = "you can only delete your own comments"
          redirect_to(@comment)
        end

        format.js {
          flash.now[:error] = 'You can only delete your own comments'
        }

      end

    end
  end

  private
  def set_comment
    @comment = Comment.find(params[:id])
    @commenter = @comment.user

  end

  def comment_params
    params.require(:comment).permit(:body)
  end


end
