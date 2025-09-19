const API_URL = "http://192.168.100.8:5000";

document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const newsId  = pathParts[pathParts.length - 1]; 

    
    if (!newsId ) {
        document.querySelector(".news-single").innerHTML = "<p>❌ Notícia não encontrada.</p>";
        return;
    }

    try {

        const res = await fetch(`${API_URL}/news/${newsId }`);
        if (!res.ok) throw new Error("Notícia não encontrada");

        const news = await res.json();

        const newsImage = document.getElementById('news-image');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const captionText = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox .close');

        // Preenche o conteúdo da notícia
        document.getElementById("news-title").textContent = news.title;
        document.getElementById("news-subtitle").textContent = news.subtitle || "";
        newsImage.src = news.image_url || "https://via.placeholder.com/600x400";
        document.getElementById("news-caption").textContent = news.caption || "";
        document.getElementById("news-content").innerHTML = news.content || "";

        // Adiciona os eventos de clique APÓS a imagem ser carregada
        newsImage.onclick = function () {
            lightbox.style.display = "flex"; // Usa flex para centralizar
            lightboxImg.src = this.src;
            captionText.innerHTML = document.getElementById('news-caption').innerText;
        }

        closeBtn.onclick = function () {
            lightbox.style.display = "none";
        }

        lightbox.onclick = function (e) {
            if (e.target === this) {
                lightbox.style.display = "none";
            }
        } 
    } catch (err) {
        console.error("Erro ao carregar notícia:", err);
        document.querySelector(".news-single").innerHTML = "<p>⚠️ Erro ao carregar a notícia.</p>";
    }
});


// Hamburger menu
const hamburgerBtn = document.getElementById("hamburger-btn");
const sidebar = document.querySelector(".sidebar");

hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});

