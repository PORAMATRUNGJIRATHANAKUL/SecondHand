// routes/reviewRoute.js
import express from "express";
import {
  addReview,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.get("/", getAllReviews); // Get all reviews
reviewRouter.post("/", addReview); // Create a new review
reviewRouter.put("/:reviewId", updateReview); // Update a review by ID
reviewRouter.delete("/:reviewId", deleteReview); // Delete a review by ID

export default reviewRouter;
