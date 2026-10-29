import mongoose from 'mongoose';

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true
    },
    // author's user role (alumni/student), set server-side from the auth token
    authorRole: {
        type: String,
        required: false
    },
    company: {
        type: String,
        trim: true,
        required: false
    },
    role: {
        type: String,
        trim: true,
        required: false
    },
    categories: {
        type: Array,
        required: false
    },
    createdDate: {
        type: Date
    }
});


const post = mongoose.model('post', PostSchema);

export default post;
