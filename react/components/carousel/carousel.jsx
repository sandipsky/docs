import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './carousel.css';

const Carousel = ({ images, width = 800, height = 300, autoSlide = true, autoSlideInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  let slideInterval;

  // Next Slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Previous Slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Go to a specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlide) {
      slideInterval = setInterval(() => {
        nextSlide();
      }, autoSlideInterval);
    }

    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [autoSlide, autoSlideInterval, currentIndex]); // Re-run when currentIndex or autoSlide changes

  return (
    <div className="carousel-container" style={{ width: `${width}px`, height: `${height}px` }}>
      {/* Slides Wrapper */}
      <div
        className="carousel-wrapper"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          width: `${images.length * 100}%`,
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className="carousel-slide"
            style={{ width: `${width}px`, height: `${height}px` }}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button className="carousel-btn prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="carousel-btn next" onClick={nextSlide}>
        &#10095;
      </button>

      {/* Navigation Dots */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

Carousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  autoSlide: PropTypes.bool,
  autoSlideInterval: PropTypes.number,
};

export default Carousel;
