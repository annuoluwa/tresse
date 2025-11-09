import React from "react";
import HeroBanner from "../../components/HeroBanner/HeroBanner";
import Category from "../../components/Category/Category";
import Partners from "../../components/Partners/Partners";


function Home({onBrandSelect, onShowAllProducts}) {
  return (
    <div>
      <HeroBanner onShowAllProducts={onShowAllProducts}/>
      <Category />
      <Partners onBrandSelect={onBrandSelect}/>
    </div>
  );
}

export default Home;
