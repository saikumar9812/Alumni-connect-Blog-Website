import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';

import { getMongoURL } from '../database/db.js';

export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = /\.(png|jpe?g|gif|webp)$/i;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const storage = new GridFsStorage({
    url: getMongoURL(),
    options: { useNewUrlParser: true },
    file: (request, file) => ({
        bucketName: 'fs',
        filename: `${Date.now()}-${file.originalname.replace(/[^\w.-]/g, '_')}`
    })
});

const fileFilter = (request, file, callback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.test(file.originalname)) {
        return callback(null, true);
    }
    callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } });

// Single-image upload that answers with JSON 400/413 instead of falling through to Express's HTML error page
export const uploadSingleImage = (request, response, next) => {
    upload.single('file')(request, response, (error) => {
        if (!error) return next();
        if (error.code === 'LIMIT_FILE_SIZE') {
            return response.status(413).json({ msg: `Image must be ${MAX_IMAGE_SIZE / (1024 * 1024)} MB or smaller` });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return response.status(400).json({ msg: 'Only png, jpg, jpeg, gif or webp images are allowed' });
        }
        return response.status(500).json({ msg: error.message });
    });
};

export default upload;
