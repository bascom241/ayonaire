import cloudinary from "../config/cloudinary.js";
export const uploadMedia = (fileBuffer, type) => {
    if (!fileBuffer) {
        return Promise.reject(new Error("File buffer is required"));
    }
    return new Promise((resolve, reject) => {
        const options = { folder: "ayoniareCourses", resource_type: type };
        const done = (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        };
        const uploadStream = type === "video"
            ? cloudinary.uploader.upload_large_stream({ ...options, chunk_size: 20 * 1024 * 1024 }, done)
            : cloudinary.uploader.upload_stream(options, done);
        uploadStream.end(fileBuffer);
    });
};
export const uploadFile = (fileBuffer, type) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: "ayoniareCourses", resource_type: type }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        })
            .end(fileBuffer);
    });
};
export const deleteImage = async (publicId) => {
    if (!publicId)
        return;
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`✅ Image deleted from Cloudinary: ${publicId}`);
    }
    catch (error) {
        console.error(`❌ Failed to delete Cloudinary image: ${publicId}`, error);
        throw new Error("Failed to delete image from Cloudinary");
    }
};
