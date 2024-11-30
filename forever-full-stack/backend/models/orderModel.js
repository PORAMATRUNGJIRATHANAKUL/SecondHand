import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  userOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userOrder",
    required: true,
  },
  items: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      size: { type: String, required: true },
      colors: [{ type: String, required: true }],
      image: [{ type: String }],
      owner: {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        name: { type: String, required: true },
        email: { type: String },
        profileImage: { type: String },
      },
      shippingAddress: {
        name: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        district: { type: String, required: true },
        province: { type: String, required: true },
        postalCode: { type: String, required: true },
        phoneNumber: { type: String, required: true },
      },
      shippingCost: { type: Number, default: 0 },
      status: { type: String, default: "รอดำเนินการ" },
      trackingNumber: { type: String },
      shippingProvider: { type: String },
    },
  ],
  amount: { type: Number, required: true },
  status: { type: String, required: true, default: "รอดำเนินการ" },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  paymentProof: { type: String, default: null },
  paymentDate: { type: Date },
  transferredToShop: { type: Boolean, default: false },
  date: { type: Date, default: Date.now, required: true },
  trackingNumber: { type: String },
  shippingProvider: { type: String },
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
