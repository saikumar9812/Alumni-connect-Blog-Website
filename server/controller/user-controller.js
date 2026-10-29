import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import Token from '../model/token.js'
import User, { USER_ROLES } from '../model/user.js';
import { tokenPayload, ACCESS_TOKEN_EXPIRY } from './jwt-controller.js';

dotenv.config();

const PUBLIC_USER_FIELDS = 'name username role graduationYear currentCompany currentRole';

export const validateSignup = (body = {}) => {
    const { name, username, password, role } = body;

    const isText = (value) => typeof value === 'string' && value.trim() !== '';
    if (!isText(name) || !isText(username) || !isText(password)) {
        return { error: 'Name, username and password are required' };
    }
    if (!USER_ROLES.includes(role)) {
        return { error: `Role must be one of: ${USER_ROLES.join(', ')}` };
    }

    const user = { name: name.trim(), username: username.trim(), role };

    if (body.graduationYear !== undefined && body.graduationYear !== '') {
        const year = Number(body.graduationYear);
        const currentYear = new Date().getFullYear();
        if (!Number.isInteger(year) || year < 1950 || year > currentYear + 10) {
            return { error: 'Graduation year is invalid' };
        }
        if (role === 'alumni' && year > currentYear) {
            return { error: 'Alumni graduation year cannot be in the future' };
        }
        if (role === 'student' && year < currentYear) {
            return { error: 'Expected graduation year cannot be in the past' };
        }
        user.graduationYear = year;
    }

    if (role === 'alumni') {
        if (isText(body.currentCompany)) user.currentCompany = body.currentCompany.trim();
        if (isText(body.currentRole)) user.currentRole = body.currentRole.trim();
    }

    return { user };
}

export const singupUser = async (request, response) => {
    const { error, user } = validateSignup(request.body);
    if (error) {
        return response.status(400).json({ msg: error });
    }

    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10);

        const newUser = new User({ ...user, password: hashedPassword });
        await newUser.save();

        return response.status(200).json({ msg: 'Signup successfull' });
    } catch (error) {
        if (error.code === 11000) {
            return response.status(400).json({ msg: 'Username is already taken' });
        }
        return response.status(500).json({ msg: 'Error while signing up user' });
    }
}


export const loginUser = async (request, response) => {
    try {
        let user = await User.findOne({ username: String(request.body.username || '') });
        if (!user) {
            return response.status(400).json({ msg: 'Username does not match' });
        }

        let match = await bcrypt.compare(String(request.body.password || ''), user.password);
        if (match) {
            const accessToken = jwt.sign(tokenPayload(user), process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });
            const refreshToken = jwt.sign(tokenPayload(user), process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });

            const newToken = new Token({ token: refreshToken });
            await newToken.save();

            response.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken,
                name: user.name,
                username: user.username,
                role: user.role,
                graduationYear: user.graduationYear,
                currentCompany: user.currentCompany,
                currentRole: user.currentRole
            });

        } else {
            response.status(400).json({ msg: 'Password does not match' })
        }
    } catch (error) {
        response.status(500).json({ msg: 'error while login the user' })
    }
}

export const getUserProfile = async (request, response) => {
    try {
        const user = await User.findOne({ username: request.params.username }).select(PUBLIC_USER_FIELDS);
        if (!user) {
            return response.status(404).json({ msg: 'User not found' });
        }
        response.status(200).json(user);
    } catch (error) {
        response.status(500).json({ msg: error.message });
    }
}

export const logoutUser = async (request, response) => {
    try {
        const token = String(request.body.token || '').replace(/^Bearer /, '');
        await Token.deleteOne({ token: token });

        response.status(204).end();
    } catch (error) {
        response.status(500).json({ msg: 'error while logging out' });
    }
}
