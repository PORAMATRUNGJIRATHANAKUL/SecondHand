import reviewModel from "../models/reviewModel.js";

// เพิ่มรีวิวใหม่หรืออัพเดทรีวิวที่มีอยู่
const addReview = async (req, res) => {
  try {
    const { name, rating, comment, userId } = req.body;

    // สร้างรีวิวใหม่
    const newReview = new reviewModel({
      name,
      rating,
      comment,
      date: new Date().toLocaleString("th-TH"), // เพิ่มการแสดงวันที่แบบไทย
    });

    await newReview.save();
    res.status(200).json(newReview);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเพิ่มรีวิว:", error);
    res.status(500).json({ message: "ไม่สามารถเพิ่มรีวิวได้" });
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
