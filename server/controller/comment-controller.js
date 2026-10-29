
import mongoose from 'mongoose';

import Comment from '../model/comment.js';
import Post from '../model/post.js';


export const newComment = async (request, response) => {
    try {
        const { postId, comments } = request.body;
        if (typeof comments !== 'string' || !comments.trim()) {
            return response.status(400).json({ msg: 'Comment text is required' });
        }
        if (!mongoose.isValidObjectId(postId) || !(await Post.exists({ _id: postId }))) {
            return response.status(404).json({ msg: 'Post not found' });
        }

        // commenter identity always comes from the auth token
        const comment = new Comment({ name: request.user.username, postId, comments: comments.trim(), date: new Date().toISOString() });
        await comment.save();

        response.status(200).json('Comment saved successfully');
    } catch (error) {
        response.status(500).json({ msg: error.message });
    }
}


export const getComments = async (request, response) => {
    try {
        const comments = await Comment.find({ postId: String(request.params.id) });
        
        response.status(200).json(comments);
    } catch (error) {
        response.status(500).json({ msg: error.message })
    }
}

export const deleteComment = async (request, response) => {
    try {
        if (!mongoose.isValidObjectId(request.params.id)) {
            return response.status(400).json({ msg: 'Invalid comment id' });
        }
        const comment = await Comment.findById(request.params.id);
        if (!comment) {
            return response.status(404).json({ msg: 'Comment not found' });
        }
        if (comment.name !== request.user.username) {
            return response.status(403).json({ msg: 'You can only delete your own comments' });
        }
        await comment.delete()

        response.status(200).json('comment deleted successfully');
    } catch (error) {
        response.status(500).json({ msg: error.message })
    }
}
