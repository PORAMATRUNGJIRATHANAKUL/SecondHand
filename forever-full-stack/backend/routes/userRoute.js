import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  updateProfileImage,
  updateUserProfile,
  getUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  getBanks,
  deleteBankInfo,
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
userRouter.post("/address", authUser, addAddress);
userRouter.put("/address/:addressId", authUser, updateAddress);
userRouter.delete("/address/:addressId", authUser, deleteAddress);
userRouter.get("/addresses", authUser, getAddresses);
userRouter.put("/address/:addressId/default", authUser, setDefaultAddress);
userRouter.get("/banks", authUser, getBanks);
userRouter.delete("/bank/:userId", authUser, deleteBankInfo);
export default userRouter;
