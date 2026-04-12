import { Router } from "express";

import {
  deleteAccount,
  deleteUser,
  getAllUsers,
  updateProfile,
  changePassword,
  toggleBlockUser,
  updateUserProfile,
  uploadProfileImage,
} from "../controllers/user.controller";

import { protectRoute } from "../middlewares/protectRoute.middleware";
import { uploadProfile } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", protectRoute, getAllUsers);

router.put("/update-profile", protectRoute, updateProfile);
router.put(
  "/profile-image",
  protectRoute,
  uploadProfile.single("profileImage"),
  uploadProfileImage,
);
router.put("/change-password", protectRoute, changePassword);
router.put(
  "/update-user-profile/:targetUserId",
  protectRoute,
  updateUserProfile,
);
router.put("/toggle-block-user/:targetUserId", protectRoute, toggleBlockUser);

router.delete("/delete-account", protectRoute, deleteAccount);
router.delete("/delete-user/:targetUserId", protectRoute, deleteUser);

export default router;
