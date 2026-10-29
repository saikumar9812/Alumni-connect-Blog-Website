import grid from 'gridfs-stream';
import mongoose from 'mongoose';

const url = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;


let gfs, gridfsBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'fs'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('fs');
});


export const uploadImage = (request, response) => {
    if(!request.file) 
        return response.status(400).json({ msg: 'No image file provided' });
    
    const imageUrl = `${url}/file/${request.file.filename}`;

    response.status(200).json(imageUrl);    
}

export const getImage = async (request, response) => {
    try {   
        const file = await gfs.files.findOne({ filename: request.params.filename });
        if (!file) {
            return response.status(404).json({ msg: 'Image not found' });
        }
        if (file.contentType) response.set('Content-Type', file.contentType);
        const readStream = gridfsBucket.openDownloadStream(file._id);
        readStream.pipe(response);
    } catch (error) {
        response.status(500).json({ msg: error.message });
    }
}