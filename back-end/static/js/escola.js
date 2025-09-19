const galeriaImgs = document.querySelectorAll('.galeria img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const captionText = document.getElementById('lightbox-caption');
const closeBtn = document.querySelector('.lightbox .close');
const prevBtn = document.querySelector('.lightbox .prev');
const nextBtn = document.querySelector('.lightbox .next');

let currentIndex = 0;

// Abre o lightbox ao clicar em uma imagem
galeriaImgs.forEach((img, index) => {
    img.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    lightbox.style.display = "block";
    lightboxImg.src = galeriaImgs[currentIndex].src;
    captionText.innerText = galeriaImgs[currentIndex].alt;
}

// Fecha o lightbox e reseta imagem
closeBtn.onclick = () => {
    lightbox.style.display = "none";
    lightboxImg.src = "";
}

// Navegação
prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + galeriaImgs.length) % galeriaImgs.length;
    openLightbox();
}

nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % galeriaImgs.length;
    openLightbox();
}

// Fecha clicando fora da imagem
lightbox.onclick = (e) => {
    if(e.target === lightbox) {
        lightbox.style.display = "none";
        lightboxImg.src = "";
    }
}


const hamburgerBtn = document.getElementById("hamburger-btn");
const sidebar = document.querySelector(".sidebar");

hamburgerBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active"); 
});     