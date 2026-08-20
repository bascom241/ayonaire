import cloudinary from "../config/cloudinary.js";
export const uploadMedia = (fileBuffer, type) => {
    if (!fileBuffer) {
        return Promise.reject(new Error("File buffer is required"));
    }
    return new Promise((resolve, reject) => {
        const options = {
            folder: "ayoniareCourses",
            resource_type: type,
            chunk_size: type === "video" ? 20 * 1024 * 1024 : undefined,
        };
        cloudinary.uploader
            .upload_stream(options, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        })
            .end(fileBuffer);
    });
};
export const uploadFile = (fileBuffer, type) => {
    if (!fileBuffer) {
        return Promise.reject(new Error("File buffer is required"));
    }
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
