import React from "react";
import Hero from "../components/Hero";
import ProductSection from "../components/ProductSection";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";

const Home = () => {
  return (
    <div>
      <Hero />
      <ProductSection />
      <OurPolicy />
      <NewsletterBox />
    </div>
  );
};

export default Home;
