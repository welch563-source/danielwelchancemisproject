// Add smooth scroll behavior
document.querySelector('.scroll-indicator').addEventListener('click', () => {
 document.querySelector('.content-section').scrollIntoView({
 behavior: 'smooth'
 });
});

// Add a dynamic greeting based on time of day
function setGreeting() {
 const hour = new Date().getHours();
 const welcomeText = document.querySelector('.fade-in');
 let greeting;
 
 if (hour >= 5 && hour < 12) {
 greeting = "Good morning! ";
 } else if (hour >= 12 && hour < 18) {
 greeting = "Good afternoon! ";
 } else {
 greeting = "Good evening! ";
 }
 
 welcomeText.textContent = greeting + "I'm Bjorn! Let's explore my journey together.";
}

// Initialize the greeting
setGreeting();

// Add smooth reveal animations for cards
const observer = new IntersectionObserver((entries) => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 entry.target.style.opacity = 1;
 entry.target.style.transform = 'translateY(0)';
 }
 });
}, {
 threshold: 0.1
});

document.querySelectorAll('.card').forEach(card => {
 card.style.opacity = 0;
 card.style.transform = 'translateY(20px)';
 observer.observe(card);
});
