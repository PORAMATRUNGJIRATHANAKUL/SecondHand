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
  productCondition: {
    type: String,
    required: true,
    enum: ["new", "used", "new_popular", "used_popular"],
    default: "new",
  },
  conditionPercentage: {
    type: Number,
    required: function () {
      return (
        this.productCondition === "used" ||
        this.productCondition === "used_popular"
      );
    },
    min: 0,
    max: 100,
  },

  bestseller: { type: Boolean, default: false },
  secondHand: { type: Boolean, default: true },
  date: { type: Number, required: true },
  stockItems: { type: Array, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  isApproved: { type: Boolean, default: false },
  shippingType: { type: String, enum: ["free", "paid"], default: "free" },
  shippingCost: { type: Number, default: 0 },
  sizeGuide: { type: Array },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
