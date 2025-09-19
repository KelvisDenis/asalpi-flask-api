let token = localStorage.getItem("token");
let tokenExpiry = localStorage.getItem("tokenExpiry");
let currentPage = 1;
let newsData = [];
const itemsPerPage = 10;

// ✅ variável única para a API
const baseURL = "http://192.168.100.8:5000";

document.addEventListener("DOMContentLoaded", () => {
  // Estado inicial
  document.getElementById("login-section").classList.remove("hidden");
  document.getElementById("dashboard-section").classList.add("hidden");
  document.getElementById("logout-btn").classList.add("hidden");
  document.getElementById("navbar").classList.add("hidden");

  // Se token válido, mostrar dashboard
  if (token && Date.now() < tokenExpiry) {
    showDashboard();
  }

  // Login
  document.getElementById("login-btn").addEventListener("click", async () => {
    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    
    try {
      const res = await fetch(`${baseURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password }),
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 401) {
          alert("Usuário ou senha incorretos!");
        } else {
          alert("Erro no login, tente novamente.");
        }
        return;
      }

      const data = await res.json();
      token = data.token;
      tokenExpiry = Date.now() + 15 * 60 * 1000;
      localStorage.setItem("token", token);
      localStorage.setItem("tokenExpiry", tokenExpiry);

      showDashboard();
    } catch (err) {
      alert("Erro de conexão com o servidor!");
    }
  });

  // Criar notícia
  document.getElementById("create-news-btn").addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const imageFile = document.getElementById("image_file").files[0];

    if (!title || !content) return alert("Preencha título e conteúdo!");

    let image_url = null;

    // Upload da imagem
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      try {
        const res = await fetch(`${baseURL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Erro ao enviar imagem");
        const data = await res.json();
        image_url = data.url;
      } catch (err) {
        return alert("Erro no upload da imagem: " + err.message);
      }
    }

    // Criar notícia
    try {
      const res = await fetch(`${baseURL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, image_url }),
      });
      if (!res.ok) throw new Error("Erro ao criar notícia");

      alert("Notícia publicada!");
      document.getElementById("title").value = "";
      document.getElementById("content").value = "";
      document.getElementById("image_file").value = "";
      getNews();
    } catch (err) {
      alert("Erro ao criar notícia: " + err.message);
    }
  });

  // Logout
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    token = null;
    tokenExpiry = null;

    document.getElementById("dashboard-section").classList.add("hidden");
    document.getElementById("navbar").classList.add("hidden");
    document.getElementById("logout-btn").classList.add("hidden");
    document.getElementById("login-section").classList.remove("hidden");
  });
});

// Mostrar dashboard
function showDashboard() {
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("dashboard-section").classList.remove("hidden");
  document.getElementById("navbar").classList.remove("hidden");
  document.getElementById("logout-btn").classList.remove("hidden");
  showTab("create-section");
  getNews();
}

// Alternar abas
function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.getElementById(tabId).classList.remove("hidden");
}

// Buscar notícias
async function getNews() {
  try {
    const res = await fetch(`${baseURL}/news`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao buscar notícias");

    newsData = await res.json();
    currentPage = 1;
    renderNews();
  } catch (err) {
    console.error("❌ Erro:", err);
  }
}

// Renderizar tabela
function renderNews() {
  const newsList = document.getElementById("news-list");
  newsList.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = newsData.slice(start, end);

  pageItems.forEach(news => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="ID">${news.id}</td>
      <td data-label="Título">${news.title}</td>
      <td data-label="Conteúdo">${news.content.substring(0, 50)}...</td>
      <td data-label="">
          <button onclick="editNews(${news.id})">Atualizar</button>
          <button onclick="deleteNews(${news.id})">Excluir</button>
      </td>
    `;
    newsList.appendChild(row);
  });

  renderPagination();
}

// Paginação
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(newsData.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderNews();
    });
    pagination.appendChild(btn);
  }
}

// Excluir notícia
async function deleteNews(id) {
  if (!confirm("Deseja realmente excluir?")) return;

  try {
    const res = await fetch(`${baseURL}/news/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao excluir");
    getNews();
  } catch (err) {
    alert("Erro ao excluir notícia");
  }
}

// Editar notícia
function editNews(id) {
  const newsItem = newsData.find(n => n.id === id);
  if (!newsItem) return alert("Notícia não encontrada");

  document.getElementById("update-id").value = newsItem.id;
  document.getElementById("update-title").value = newsItem.title;
  document.getElementById("update-content").value = newsItem.content;

  showTab("update-section");
}

// Atualizar notícia
document.getElementById("update-news-btn").addEventListener("click", async () => {
  const id = document.getElementById("update-id").value;
  const title = document.getElementById("update-title").value.trim();
  const content = document.getElementById("update-content").value.trim();
  const imageFile = document.getElementById("update-image_file").files[0];

  if (!title || !content) return alert("Título e conteúdo são obrigatórios!");

  let image_url = null;

  if (imageFile) {
    const formData = new FormData();
    formData.append("file", imageFile);

    try {
      const res = await fetch(`${baseURL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Erro ao enviar imagem");
      const data = await res.json();
      image_url = data.url;
    } catch (err) {
      return alert("Erro no upload da imagem: " + err.message);
    }
  }

  try {
    const res = await fetch(`${baseURL}/news/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, image_url }),
    });
    if (!res.ok) throw new Error("Erro ao atualizar notícia");

    alert("Notícia atualizada com sucesso!");
    showTab("list-section");
    getNews();
  } catch (err) {
    alert("Erro ao atualizar notícia: " + err.message);
  }
});

document.getElementById("back-news-btn").addEventListener("click", () => {
   document.getElementById("update-section").classList.add("hidden");

  // Garante que o dashboard está visível
  document.getElementById("dashboard-section").classList.remove("hidden");

  // Mostra listagem
  document.getElementById("list-section").classList.remove("hidden");

  // Esconde a aba de criação (se estava aberta antes)
  document.getElementById("create-section").classList.add("hidden");
});


