import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Generic function to create multer storage with dynamic folder
const createStorage = (folder: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("src", "uploads", folder);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  });


export const uploadProfile = multer({
  storage: createStorage("profile-pictures"),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF files are allowed."));
    }
  },
});

export const uploadProduct = multer({
  storage: createStorage("product-images"),
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and GIF files are allowed."));
    }
  },
});