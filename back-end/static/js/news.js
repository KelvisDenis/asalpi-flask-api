const API_URL = "http://192.168.100.8:5000";

document.addEventListener("DOMContentLoaded", () => {
    const newsContainer = document.querySelector(".news-container");
    const paginationContainer = document.querySelector(".pagination");

    const itemsPerPage = 3;
    let currentPage = 1;
    let allNews = [];

    async function fetchNews() {
        try {
            const response = await fetch(`${API_URL}/news`);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            allNews = await response.json(); // ✅ atribui na variável global
            console.log(allNews); // veja os dados
        } catch (error) {
            console.error("Erro ao buscar notícias:", error);
            allNews = [];
        }

        renderNews();      // ✅ chamar depois de preencher allNews
        renderPagination();
    }


    function renderNews() {
        newsContainer.querySelectorAll(".news-item").forEach(item => item.remove());

        if (allNews.length === 0) {
            const noNews = document.createElement("div");
            noNews.classList.add("news-item");
            noNews.innerHTML = `<p style="text-align:center; font-size:1.2rem; margin: 20px 0;">Nenhuma notícia encontrada.</p>`;
            newsContainer.insertBefore(noNews, paginationContainer);
            return;
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageNews = allNews.slice(start, end);

        pageNews.forEach(news => {
            const newsItem = document.createElement("div");
            newsItem.classList.add("news-item");
            newsItem.innerHTML = `<a href="/noticias/${news.id}">
        <img src="${news.image_url || 'https://via.placeholder.com/300x180'}" alt="Imagem da notícia">
    </a>
    <div class="news-info">
        <h2><a href="/noticias/${news.id}">${news.title}</a></h2>
        <p>${news.summary || (news.content?.substring(0, 100) + '...')}</p>
    </div>
`;

            newsContainer.insertBefore(newsItem, paginationContainer);
        });
    }

    function renderPagination() {
        paginationContainer.innerHTML = "";

        // totalPages mínimo 1
        const totalPages = Math.max(1, Math.ceil(allNews.length / itemsPerPage));

        const createPageLink = (text, page) => {
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = text;
            if (page === currentPage) link.classList.add("active");
            link.addEventListener("click", (e) => {
                e.preventDefault();
                if (page !== currentPage) {
                    currentPage = page;
                    renderNews();
                    renderPagination();
                }
            });
            return link;
        };

        paginationContainer.appendChild(createPageLink("« Anterior", Math.max(currentPage - 1, 1)));

        for (let i = 1; i <= totalPages; i++) {
            paginationContainer.appendChild(createPageLink(i, i));
        }

        paginationContainer.appendChild(createPageLink("Próximo »", Math.min(currentPage + 1, totalPages)));
    }

    fetchNews();
});

// Hamburger menu
const hamburgerBtn = document.getElementById("hamburger-btn");
const sidebar = document.querySelector(".sidebar");

hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});