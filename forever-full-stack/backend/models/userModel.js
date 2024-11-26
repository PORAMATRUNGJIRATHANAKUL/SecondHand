import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    profileImage: {
      type: String,
      default: "https://avatar.iran.liara.run/public/boy",
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bankName: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    bankAccountName: { type: String, default: "" },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
