import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  updateProfileImage,
  updateUserProfile,
  getUserProfile,
} from "../controllers/userController.js";
import upload from "../middleware/multer.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.put(
  "/updateProfileImage",
  authUser,
  upload.fields([{ name: "profileImage", maxCount: 1 }]),
  updateProfileImage
);
userRouter.put("/updateUserProfile", authUser, updateUserProfile);
userRouter.get("/me", authUser, getUserProfile);
export default userRouter;
