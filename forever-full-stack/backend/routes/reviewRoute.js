// routes/reviewRoute.js
import express from "express";
import {
  addReview,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import userAuth from "../middleware/auth.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews); // Get all reviews
reviewRouter.post("/", userAuth, addReview); // Create a new review
reviewRouter.put("/:reviewId", userAuth, updateReview); // Update a review by ID
reviewRouter.delete("/:reviewId", userAuth, deleteReview); // Delete a review by ID

export default reviewRouter;
