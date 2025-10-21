import React from "react";
import styles from "./HeroBanner.module.css"

function HeroBanner()  {
    return (
<section className= {styles.heroBanner}>
<img 
src="https://images.unsplash.com/photo-1646526807601-69792584c4ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd29tYW4lMjBiZWF1dHl8ZW58MXx8fHwxNzYwODg1OTk1fDA&ixlib=rb-4.1.0&q=80&w=1080" 
alt="hero"
className={styles.heroImage}
/>
<div className={styles.heroOverlay}>
<div className={styles.heroCaption}><h1>Elevate Your <span className={styles.ritual}> Beauty Ritual </span></h1></div>

<div className={styles.heroSubCaption}><h3>Discover premium hair, beauty, and self-care products from the world's most trusted brands.</h3></div>
<div className={styles.heroButtons}>
<button className={styles.primaryBtn}>Shop Collection &gt; </button>  <button className={styles.secondaryBtn}>Explaore Brands</button>
</div>
</div>
</section>

    )
};

export default HeroBanner;