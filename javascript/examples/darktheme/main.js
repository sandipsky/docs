// Select the toggle button
const themeToggle = document.getElementById('themeToggle');

// Add a click event listener
themeToggle.addEventListener('click', () => {
  // Toggle the 'dark' class on the body
  document.body.classList.toggle('dark');
});
