import React from "react";
import { assets } from "../assets/assets";

const Hero = () => {
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="h-[160px] sm:h-[180px] md:h-[200px] w-[85%] mx-auto relative rounded-xl overflow-hidden shadow-md">
        <div className="w-full h-full">
          <img
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            alt="hero"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
          <div className="text-center text-white px-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
              ยินดีต้อนรับสู่
            </h1>
            <p className="text-sm sm:text-base max-w-[500px] mx-auto drop-shadow-md">
              แหล่งรวมสินค้ามือสองคุณภาพดี ราคาถูก
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
