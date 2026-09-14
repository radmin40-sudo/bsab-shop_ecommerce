import React from 'react';

// Hero section styled using CSS variables defined in app.css.
export default function HeroSection() {
  return (
    <section className="py-12 text-center bg-[var(--bg)]">
      <h1 className="text-4xl font-bold text-[var(--green)]">Our Products</h1>
      <p className="mt-4 text-lg text-[var(--text)]">
        Discover the finest selection curated just for you.
      </p>
    </section>
  );
}
