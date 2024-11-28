import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: Array, required: true },
  colors: { type: Array, required: true },
  bestseller: { type: Boolean },
  date: { type: Number, required: true },
  stockItems: { type: Array, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  isApproved: { type: Boolean, default: false },
  shippingType: { type: String, enum: ["free", "paid"], default: "free" },
  shippingCost: { type: Number, default: 0 },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
