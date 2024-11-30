import mongoose from "mongoose";

const userOrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: false },
    paymentMethod: { type: String, required: true },
    date: { type: Number, required: true },
  },
  {
    strict: false,
  }
);

const userOrderModel =
  mongoose.models.userOrder || mongoose.model("userOrder", userOrderSchema);
export default userOrderModel;
