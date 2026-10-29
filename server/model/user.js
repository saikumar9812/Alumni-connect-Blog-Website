import mongoose from 'mongoose';

export const USER_ROLES = ['alumni', 'student'];

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: USER_ROLES,
        required: true
    },
    // alumni: year graduated, student: expected graduation year
    graduationYear: {
        type: Number,
        required: false
    },
    currentCompany: {
        type: String,
        required: false
    },
    currentRole: {
        type: String,
        required: false
    }
});


const user = mongoose.model('user', userSchema);

export default user;
