import React from "react";
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import Category from "../../components/Category/Category";
import Partners from "../../components/Partners/Partners";


function Home() {
  return (
    <div>
      <HeroBanner />
      <Category />
      <Partners />
    </div>
  );
}

export default Home;
