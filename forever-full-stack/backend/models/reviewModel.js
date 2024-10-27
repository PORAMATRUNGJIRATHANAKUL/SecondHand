import mongoose from "mongoose";

// Define the review schema
const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, // Limit rating between 1 and 5
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    default: new Date().toLocaleString(), // Default to current date and time in local format
  },
});

// Create the review model
const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
