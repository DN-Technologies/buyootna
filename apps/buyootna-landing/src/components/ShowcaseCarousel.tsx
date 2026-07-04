"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ShowcaseCarousel() {
  const screenshots = [
    { src: "/screenshot-1.png", alt: "Home Screen - Feed and Search" },
    { src: "/screenshot-2.png", alt: "Property Details - Features and Map" },
    { src: "/screenshot-3.png", alt: "Advanced Filter Options" },
    { src: "/screenshot-4.png", alt: "Verified Service Companies" },
    { src: "/screenshot-5.png", alt: "Add Listing - Form Steps" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="showcase" className="py-24 px-6 bg-gradient-to-b from-[#0A1118] via-[#0E1B28] to-[#0A1118] relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#C5A880]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">معرض التطبيق</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            شاهد واجهة مستخدم التطبيق
          </h2>
          <div className="w-16 h-1 bg-[#C5A880] rounded-full mt-2" />
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-between gap-6">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-[#1B2936]/40 border border-[#1B2936] text-[#C5A880] hover:bg-[#C5A880] hover:text-[#070D14] hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
            aria-label="Previous screenshot"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Screenshot Display */}
          <div className="flex-1 flex justify-center items-center py-6">
            <div className="relative w-[280px] h-[580px] sm:w-[300px] sm:h-[620px] bg-[#070D14] rounded-[48px] border-8 border-[#1B2936] shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]">
              {/* Dynamic image loading */}
              <Image
                src={screenshots[currentIndex].src}
                alt={screenshots[currentIndex].alt}
                fill
                sizes="300px"
                className="object-cover object-top pt-6"
                priority
              />
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#070D14] rounded-b-2xl z-30" />
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-[#1B2936]/40 border border-[#1B2936] text-[#C5A880] hover:bg-[#C5A880] hover:text-[#070D14] hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
            aria-label="Next screenshot"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="flex justify-center gap-3 mt-10">
          {screenshots.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? "bg-[#C5A880] w-8"
                  : "bg-[#1B2936] hover:bg-[#C5A880]/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
