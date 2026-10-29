import mongoose from 'mongoose';

// Prefer MONGODB_URI; fall back to the original Atlas cluster built from DB_USERNAME / DB_PASSWORD
export const getMongoURL = () => {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    return `mongodb://${username}:${password}@blogweb-shard-00-00.ch1hk.mongodb.net:27017,blogweb-shard-00-01.ch1hk.mongodb.net:27017,blogweb-shard-00-02.ch1hk.mongodb.net:27017/BLOG?ssl=true&replicaSet=atlas-lhtsci-shard-0&authSource=admin&retryWrites=true&w=majority`;
};

const Connection = async () => {
    try {
        await mongoose.connect(getMongoURL(), { useNewUrlParser: true })
        console.log('Database connected successfully');
    } catch (error) {
        console.log('Error while connecting to the database ', error);
    }
};

export default Connection;
