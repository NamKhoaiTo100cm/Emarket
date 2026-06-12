import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor() {
        // Config ngay trong constructor
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, type: "authenticated" },
                (error, result) => {
                    if (error) return reject(error);
                    // @ts-ignore
                    resolve(result.public_id);
                }
            );
            Readable.from(file.buffer).pipe(uploadStream);
        });
    }
    async uploadFiles(file: Express.Multer.File, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder, type: "authenticated" },
                (error, result) => {
                    if (error) return reject(error);
                    // @ts-ignore
                    resolve(result.public_id);
                }
            );
            Readable.from(file.buffer).pipe(uploadStream);
        });
    }
    async deleteFile(publicId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve();
            });
        });
    }

    getUrl(publicId: string | null, options?: any): string | null {
        if (!publicId) return null;

        const url = cloudinary.url(publicId, {
            secure: true,
            sign_url: true,                                          // ← THIẾU CÁI NÀY
            type: "authenticated",
            ...options
        });
        // console.log("url", url)
        return url;
    }
}