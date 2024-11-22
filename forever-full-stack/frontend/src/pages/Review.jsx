import React, { useContext, useEffect, useState, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import userAvatar from "../assets/user-avatar.png";

const calculateAverageRating = (reviews) => {
  const overallRatingInNumber = reviews.reduce(
    (acc, review) => acc + review.rating,
    0
  );

  const overallRating =
    Math.round((overallRatingInNumber / reviews.length) * 10) / 10;
  const overallRatingRounded = Math.round(overallRating * 2) / 2;
  const overallRatingInPercentage = overallRatingRounded * 20;

  const findPercentage = (rating) => {
    return (
      (reviews.filter((review) => review.rating === rating).length /
        reviews.length) *
      100
    );
  };

  return {
    allReviews: reviews.length,
    overallRating,
    overallRatingRounded,
    overallRatingInPercentage,
    progress: {
      5: findPercentage(5),
      4: findPercentage(4),
      3: findPercentage(3),
      2: findPercentage(2),
      1: findPercentage(1),
    },
    separateCount: {
      5: reviews.filter((review) => review.rating === 5).length,
      4: reviews.filter((review) => review.rating === 4).length,
      3: reviews.filter((review) => review.rating === 3).length,
      2: reviews.filter((review) => review.rating === 2).length,
      1: reviews.filter((review) => review.rating === 1).length,
    },
  };
};

const Review = () => {
  const { shopReviews, fetchShopReviews, submitShopReview, user } =
    useContext(ShopContext);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    name: user?.name || "",
    date: new Date().toISOString(),
  });

  const ratingData = useMemo(() => {
    if (shopReviews.length === 0) return null;
    return calculateAverageRating(shopReviews);
  }, [shopReviews]);

  const sortedReviews = useMemo(() => {
    return [...shopReviews].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [shopReviews]);

  useEffect(() => {
    fetchShopReviews();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = () => {
    const reviewWithDate = {
      ...newReview,
      date: new Date().toISOString(),
    };
    submitShopReview(reviewWithDate);
    setNewReview({
      name: user?.name || "",
      rating: 0,
      comment: "",
      date: new Date().toISOString(),
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-500">
            ★
          </span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-500">
            ½
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ☆
          </span>
        );
      }
    }

    return stars;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">รีวิวเว็บไซต์</h1>

      {/* ส่วนคะแนนรวม */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="text-4xl font-bold">{ratingData?.overallRating}</span>
        <div className="flex text-2xl">
          {renderStars(ratingData?.overallRating)}
        </div>
        <span className="text-gray-500">
          จากทั้งหมด {ratingData?.allReviews} รีวิว
        </span>
      </div>

      {/* การกระจายของคะแนน */}
      <div className="mb-8 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-2">
            {/* ส่วนแสดงดาวและคำอธิบาย */}
            <div className="w-32 flex items-center">
              <div className="w-14 font-medium">{star} ดาว</div>
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {star === 5 && "(ดีมาก)"}
                {star === 4 && "(ดี)"}
                {star === 3 && "(ปานกลาง)"}
                {star === 2 && "(แย่)"}
                {star === 1 && "(แย่มาก)"}
              </span>
            </div>

            {/* แถบแสดงสัดส่วน */}
            <div className="bg-gray-200 flex-1 h-4 rounded-md overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{
                  width: `${ratingData?.progress[star]}%`,
                }}
              ></div>
            </div>

            {/* จำนวนรีวิว */}
            <div className="w-20 text-right text-gray-600">
              <span className="font-medium">
                {ratingData?.separateCount[star]}
              </span>
              <span className="ml-1">รีวิว</span>
            </div>
          </div>
        ))}
      </div>

      {/* รายการรีวิว */}
      <div className="my-8">
        {sortedReviews.map((review, index) => (
          <div key={index} className="border-b py-4">
            <div className="flex items-center gap-2">
              <img
                src={userAvatar}
                alt={`${review?.name}'s avatar`}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-semibold">
                  {review?.name || "Anonymous"}
                </span>
                <div className="text-yellow-500">
                  {renderStars(review.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-2">{review.comment}</p>
            <div className="flex justify-end text-sm text-gray-500 mt-2">
              <span>{review.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ส่วนสำหรับส่งความเห็นใหม่ */}
      <div className="my-8 pt-4">
        {/* ข้อความแนะนำการให้คะแนน */}
        <p className="text-sm text-gray-600 mb-2">คะแนนคุณภาพเว็บไซต์</p>

        {/* ส่วนให้คะแนนดาว */}
        <div className="flex items-center gap-2 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`cursor-pointer text-2xl ${
                newReview.rating > i ? "text-yellow-500" : "text-gray-300"
              }`}
              onClick={() =>
                setNewReview((prev) => ({ ...prev, rating: i + 1 }))
              }
              title={
                i === 4
                  ? "ดีมาก"
                  : i === 3
                  ? "ดี"
                  : i === 2
                  ? "ปานกลาง"
                  : i === 1
                  ? "แย่"
                  : "แย่มาก"
              }
            >
              ★
            </span>
          ))}
          <span className="text-sm text-gray-500 ml-2">
            {newReview.rating === 5 && "(ดีมาก)"}
            {newReview.rating === 4 && "(ดี)"}
            {newReview.rating === 3 && "(ปานกลาง)"}
            {newReview.rating === 2 && "(แย่)"}
            {newReview.rating === 1 && "(แย่มาก)"}
          </span>
        </div>
        <textarea
          name="comment"
          placeholder="เขียนความเห็น..."
          value={newReview.comment}
          onChange={handleInputChange}
          className="w-full border p-2 rounded-md my-2"
        />
        <div className="text-right">
          <button
            onClick={handleSubmitReview}
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            แสดงความเห็น
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;
