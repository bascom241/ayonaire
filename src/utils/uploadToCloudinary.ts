import cloudinary from "../config/cloudinary.js";

export const uploadMedia = (
  fileBuffer: Buffer | undefined,
  type: "image" | "video",
): Promise<any> => {
  if (!fileBuffer) {
    return Promise.reject(new Error("File buffer is required"));
  }

  return new Promise((resolve, reject) => {
    const options = { folder: "ayoniareCourses", resource_type: type } as const;
    const done = (error: any, result: any) => {
      if (error) reject(error);
      else resolve(result);
    };

    const uploadStream =
      type === "video"
        ? cloudinary.uploader.upload_large_stream(
            { ...options, chunk_size: 20 * 1024 * 1024 },
            done,
          )
        : cloudinary.uploader.upload_stream(options, done);

    uploadStream.end(fileBuffer);
  });
};

export const uploadFile = (
  fileBuffer: Buffer | undefined,
  type: "raw",
): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: "ayoniareCourses", resource_type: type },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      )
      .end(fileBuffer);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`❌ Failed to delete Cloudinary image: ${publicId}`, error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};
