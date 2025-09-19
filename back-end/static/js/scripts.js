const slider = document.querySelector('.slider');
const slides = slider ? slider.children : [];
const totalSlides = slides.length;
let currentSlide = 0;

// largura total do slider (N imagens * 100vw)
if (slider) {
  slider.style.width = `${totalSlides * 100}vw`;
}

function slideShow() {
  if (!slider) return;
  currentSlide = (currentSlide + 1) % totalSlides;
  slider.style.transform = `translateX(-${currentSlide * 100}vw)`;
}

setInterval(slideShow, 5000);



const cards = document.querySelectorAll('.diretor-card');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    } else {
      entry.target.classList.remove('show');
    }
  });
}, { threshold: 0.1 });


cards.forEach(card => observer.observe(card));
const elementosAnimaveis = document.querySelectorAll('.diretor-card, .sobre-card, .clube-card');
elementosAnimaveis.forEach(el => observer.observe(el));




const navLinks = document.querySelectorAll('.nav-buttons a, .sidebar a');

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    navLinks.forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');
  });
});



function enableCardClickEffect(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(selector).forEach(c => c.classList.remove("clicked"));
      card.classList.add("clicked");
    });
  });
}


enableCardClickEffect(".clube-card");
enableCardClickEffect(".sobre-card");
enableCardClickEffect(".diretor-card");


const hamburgerBtn = document.getElementById("hamburger-btn");
const sidebar = document.querySelector(".sidebar");

hamburgerBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

const coll = document.querySelectorAll(".collapsible");

// Ativar o primeiro item por padrão
if (coll.length > 0) {
  const firstButton = coll[0];
  firstButton.classList.add("active");
  firstButton.nextElementSibling.style.display = "block";
}

coll.forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const content = btn.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
});
