
import mongoose from 'mongoose';

import Post from '../model/post.js';

const EDITABLE_FIELDS = ['title', 'description', 'picture', 'company', 'role', 'categories'];

const pickEditable = (body = {}) => EDITABLE_FIELDS.reduce((fields, key) => {
    if (body[key] !== undefined) fields[key] = body[key];
    return fields;
}, {});

const sendSaveError = (response, error) => {
    if (error.code === 11000) return response.status(400).json({ msg: 'A post with this title already exists' });
    if (error.name === 'ValidationError' || error.name === 'CastError') return response.status(400).json({ msg: error.message });
    return response.status(500).json({ msg: error.message });
}

// Loads the post and checks the token user is its author; sends 400/404/403 and returns null otherwise
const findOwnPost = async (request, response) => {
    if (!mongoose.isValidObjectId(request.params.id)) {
        response.status(400).json({ msg: 'Invalid post id' });
        return null;
    }
    const post = await Post.findById(request.params.id);
    if (!post) {
        response.status(404).json({ msg: 'Post not found' });
        return null;
    }
    if (post.username !== request.user.username) {
        response.status(403).json({ msg: 'You can only modify your own posts' });
        return null;
    }
    return post;
}

export const createPost = async (request, response) => {
    try {
        const post = new Post({ 
            ...pickEditable(request.body), 
            username: request.user.username, 
            authorRole: request.user.role, 
            createdDate: new Date() 
        });
        await post.save();

        response.status(200).json('Post saved successfully');
    } catch (error) {
        sendSaveError(response, error);
    }
}

export const updatePost = async (request, response) => {
    try {
        const post = await findOwnPost(request, response);
        if (!post) return;

        post.set(pickEditable(request.body));
        await post.save();

        response.status(200).json('post updated successfully');
    } catch (error) {
        sendSaveError(response, error);
    }
}

export const deletePost = async (request, response) => {
    try {
        const post = await findOwnPost(request, response);
        if (!post) return;
        
        await post.delete()

        response.status(200).json('post deleted successfully');
    } catch (error) {
        response.status(500).json({ msg: error.message })
    }
}

export const getPost = async (request, response) => {
    try {
        if (!mongoose.isValidObjectId(request.params.id)) {
            return response.status(400).json({ msg: 'Invalid post id' });
        }
        const post = await Post.findById(request.params.id);
        if (!post) {
            return response.status(404).json({ msg: 'Post not found' });
        }

        response.status(200).json(post);
    } catch (error) {
        response.status(500).json({ msg: error.message })
    }
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getAllPosts = async (request, response) => {
    const { username, category, company, role } = request.query;
    const filter = {};

    if (username) filter.username = String(username);
    if (category) filter.categories = String(category);
    if (company) filter.company = { $regex: escapeRegex(String(company).trim()), $options: 'i' };
    if (role) filter.role = { $regex: escapeRegex(String(role).trim()), $options: 'i' };

    try {
        const posts = await Post.find(filter).sort({ createdDate: -1 });
            
        response.status(200).json(posts);
    } catch (error) {
        response.status(500).json({ msg: error.message })
    }
}
