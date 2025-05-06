import reviewModel from "../models/reviewModel.js";
import jwt from "jsonwebtoken";

// เพิ่มรีวิวใหม่หรืออัพเดทรีวิวที่มีอยู่
const addReview = async (req, res) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "กรุณาเข้าสู่ระบบก่อนรีวิว",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { name, rating, comment } = req.body;

      // Basic validation
      if (!name || !rating || !comment) {
        return res.status(400).json({
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        });
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "คะแนนต้องอยู่ระหว่าง 1-5",
        });
      }

      // สร้างรีวิวใหม่
      const newReview = new reviewModel({
        name,
        rating: Number(rating),
        comment,
        date: new Date().toISOString(),
      });

      const savedReview = await newReview.save();

      if (!savedReview) {
        throw new Error("Failed to save review");
      }

      res.status(200).json({
        success: true,
        message: "เพิ่มรีวิวสำเร็จ",
        review: savedReview,
      });
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        return res.status(401).json({
          success: false,
          message: "Not Authorized Login Again",
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มรีวิว:", error);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถเพิ่มรีวิวได้",
      error: error.message,
    });
  }
};

// ดึงรีวิวทั้งหมด
const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({});

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการดึงรีวิว:", error);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลรีวิวได้" });
  }
};

// อัพเดทรีวิวตาม ID
const updateReview = async (req, res) => {
  try {
    const { reviewId, rating, comment } = req.body;

    const updatedReview = await reviewModel.findByIdAndUpdate(
      reviewId,
      { rating, comment },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: "ไม่พบรีวิวที่ต้องการแก้ไข" });
    }

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัพเดทรีวิว:", error);
    res.status(500).json({ message: "ไม่สามารถอัพเดทรีวิวได้" });
  }
};

// ลบรีวิวตาม ID
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await reviewModel.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "ลบรีวิวสำเร็จ",
      deletedReview,
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการลบรีวิว:", error);
    res.status(500).json({ message: "ไม่สามารถลบรีวิวได้" });
  }
};

// กดถูกใจรีวิว
const likeReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    const review = await reviewModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "ไม่พบรีวิวที่ต้องการกดถูกใจ" });
    }

    review.like.count += 1;
    await review.save();

    res.status(200).json(review);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการกดถูกใจรีวิว:", error);
    res.status(500).json({ message: "ไม่สามารถกดถูกใจรีวิวได้" });
  }
};

export { addReview, getAllReviews, updateReview, deleteReview, likeReview };
