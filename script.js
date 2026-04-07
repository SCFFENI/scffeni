const menuIcon = document.querySelector(".menu-icon");
const navLinks = document.querySelector(".nav-links");

menuIcon.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        target.scrollIntoView({
            behavior: "smooth"
        });
    });
});

// ===== Sticky Navbar =====
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");
    header.classList.toggle("sticky", window.scrollY > 50);
});

// ===== Scroll Reveal Animation =====
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
    const triggerBottom = window.innerHeight * 0.85;

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop < triggerBottom) {
            section.style.opacity = "1";
            section.style.transform = "translateY(0)";
        }
    });
});




// Initial hidden state for animation
sections.forEach(section => {
    section.style.opacity = "0";
    section.style.transform = "translateY(50px)";
    section.style.transition = "all 0.6s ease-out";
});

// ===== Demo Button Alert =====
document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", function () {
        alert("Thank you for supporting National Citizen Party (NCP)!");
    });
});

// ===== Slider Script =====
const slides = document.querySelectorAll(".slide");
const slidesContainer = document.querySelector(".slides");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const dotsContainer = document.querySelector(".dots");

let currentIndex = 0;
let interval = setInterval(nextSlide, 5000);

// Create dots
slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll(".dots span");

function updateSlider() {
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach(dot => dot.classList.remove("active-dot"));
    dots[currentIndex].classList.add("active-dot");
}

function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlider();
}

function goToSlide(index) {
    currentIndex = index;
    updateSlider();
}

// Button events
nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

// Initialize
updateSlider();


function loadHTML(id,file){

fetch(file)
.then(response => response.text())
.then(data=>{
document.getElementById(id).innerHTML=data;
});

}

loadHTML("header","header.html");
loadHTML("footer","footer.html");
loadHTML("sidebar","sidebar.html");


const btn = document.getElementById("goTopBtn");

  window.onscroll = function () {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      btn.style.display = "block";
    } else {
      btn.style.display = "none";
    }
  };

  btn.onclick = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  