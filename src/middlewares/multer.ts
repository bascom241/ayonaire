import multer from "multer";

const storage = multer.memoryStorage();
const fileSizeLimit =
  Number(process.env.MAX_UPLOAD_SIZE_MB || 1500) * 1024 * 1024;

export const upload = multer({
  storage,
  limits: {
    fileSize: fileSizeLimit,
  },
});
