import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  images: {
    type: Array,
    default: [],
  },
  date: {
    type: Date,
    default: Date.now, // Store as timestamp
  },
});

const productReview =
  mongoose.models.review || mongoose.model("productReview", reviewSchema);

export default productReview;
