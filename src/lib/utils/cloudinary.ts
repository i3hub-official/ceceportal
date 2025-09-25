// File: src/lib/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { URL } from 'url'; // Using WHATWG URL API

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Missing Cloudinary config');
}

// Use WHATWG URL API instead of url.parse()
const cloudinaryUrl = new URL(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}`);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    api_url: cloudinaryUrl.toString(),
});

export default cloudinary;