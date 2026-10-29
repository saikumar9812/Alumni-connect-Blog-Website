
import jwt from 'jsonwebtoken';

import Token from '../model/token.js';

export const ACCESS_TOKEN_EXPIRY = '15m';

export const tokenPayload = (user) => ({ _id: user._id.toString(), name: user.name, username: user.username, role: user.role });

// 401 = missing/invalid/expired token (client refreshes and retries); 403 is reserved for "not allowed"
export const authenticateToken = (request, response, next) => {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return response.status(401).json({ msg: 'token is missing' });
    }

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (error, user) => {
        if (error) {
            return response.status(401).json({ msg: 'invalid token' })
        }

        request.user = user;
        next();
    })
}

export const createNewToken = async (request, response) => {
    const refreshToken = request.body?.token?.replace(/^Bearer /, '');

    if (!refreshToken) {
        return response.status(401).json({ msg: 'Refresh token is missing' })
    }

    try {
        const token = await Token.findOne({ token: refreshToken });

        if (!token) {
            return response.status(401).json({ msg: 'Refresh token is not valid'});
        }

        const user = jwt.verify(token.token, process.env.REFRESH_SECRET_KEY);
        const accessToken = jwt.sign(tokenPayload(user), process.env.ACCESS_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXPIRY });

        return response.status(200).json({ accessToken: accessToken });
    } catch (error) {
        return response.status(401).json({ msg: 'invalid refresh token' });
    }
}
