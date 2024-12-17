const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');

const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

// Initialize variables
let currentIndex = 0;

// Create dots based on slides
for (let i = 0; i < totalSlides; i++) {
  const dot = document.createElement('button');
  dot.dataset.index = i; // Assign index to each dot
  if (i === 0) dot.classList.add('active'); // First dot active
  dotsContainer.appendChild(dot);
}

// Select all dots
const dots = document.querySelectorAll('.carousel-dots button');

// Update slide position
function updateCarousel() {
  const offset = -currentIndex * 800; // Move by width of slide (800px)
  carousel.style.transform = `translateX(${offset}px)`;

  // Update active dot
  dots.forEach(dot => dot.classList.remove('active'));
  dots[currentIndex].classList.add('active');
}

// Navigate to the previous slide
prevBtn.addEventListener('click', () => {
  currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - 1;
  updateCarousel();
});

// Navigate to the next slide
nextBtn.addEventListener('click', () => {
  currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0;
  updateCarousel();
});

// Dots navigation
dots.forEach(dot => {
  dot.addEventListener('click', () => {
    currentIndex = parseInt(dot.dataset.index); // Go to dot's index
    updateCarousel();
  });
});

// Auto Slide (Optional)
setInterval(() => {
  nextBtn.click();
}, 5000);
