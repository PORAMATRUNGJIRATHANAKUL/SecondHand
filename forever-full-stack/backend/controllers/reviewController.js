import reviewModel from "../models/reviewModel.js";

// Add a new review or update an existing review
const addReview = async (req, res) => {
  try {
    const { name, rating, comment } = req.body;

    // Create new review
    const newReview = new reviewModel({
      name,
      rating,
      comment,
      date: new Date().toLocaleString(),
    });

    await newReview.save();
    res.status(200).json(newReview);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Failed to add review" });
  }
};

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({});

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

// Update a review by ID
const updateReview = async (req, res) => {
  try {
    const { reviewId, rating, comment } = req.body;

    const updatedReview = await reviewModel.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await reviewModel.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      deletedReview,
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

// Like a review
const likeReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.like.count += 1;
    await review.save();

    res.status(200).json(review);
  } catch (error) {
    console.error("Error liking review:", error);
    res.status(500).json({ message: "Failed to like review" });
  }
};

export { addReview, getAllReviews, updateReview, deleteReview, likeReview };
