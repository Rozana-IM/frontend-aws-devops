// ================= CONFIG =================
const API_BASE_URL = "https://api.rozana-projects.online";

/* =====================================================
   USER HELPERS
===================================================== */

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === "admin";
}

/* =====================================================
   LOGOUT
===================================================== */

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

/* =====================================================
   AUTO LOGIN (RUNS ON EVERY PAGE)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupProfileUI();
  setupDropdown();
});

/* =====================================================
   PROFILE UI STATE
===================================================== */

function setupProfileUI() {

  const user = getUser();

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const welcomeText = document.getElementById("welcomeText");
  const subText = document.querySelector(".sub-text");

  if (!welcomeText) return;

  if (user) {
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    welcomeText.innerText = `Welcome back, ${user.name} 👋`;

    // ✅ hide old message
    if (subText) subText.style.display = "none";

  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";

    welcomeText.innerText = "Welcome";
    if (subText) subText.style.display = "block";
  }

  logoutBtn?.addEventListener("click", e => {
    e.preventDefault();
    logout();
  });
}

/* =====================================================
   CLICK DROPDOWN (NO HOVER)
===================================================== */

function setupDropdown() {

  const profile = document.querySelector(".profile-menu");
  const dropdown = document.querySelector(".profile-dropdown");

  if (!profile || !dropdown) return;

  profile.addEventListener("click", e => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
  });
}

/* =====================================================
   LOADING SPINNER
===================================================== */

function showLoader() {
  let loader = document.getElementById("globalLoader");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "globalLoader";
    loader.innerHTML = "Loading...";
    loader.style =
      "position:fixed;top:0;left:0;width:100%;background:black;color:white;text-align:center;padding:10px;z-index:9999;";
    document.body.appendChild(loader);
  }

  loader.style.display = "block";
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "none";
}

/* =====================================================
   SAFE FETCH WITH TOKEN REFRESH
===================================================== */

async function safeFetch(url, options = {}) {

  showLoader();

  options.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    ...(options.headers || {})
  };

  let res = await fetch(url, options);

  // token expired → refresh
  if (res.status === 401 && getRefreshToken()) {

    const refreshed = await refreshAccessToken();

    if (refreshed) {
      options.headers.Authorization = `Bearer ${getToken()}`;
      res = await fetch(url, options);
    } else {
      logout();
      return null;
    }
  }

  hideLoader();

  if (!res.ok) return null;

  return res.json();
}

/* =====================================================
   REFRESH TOKEN
===================================================== */

async function refreshAccessToken() {

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: getRefreshToken()
    })
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem("token", data.token);

  return true;
}

/* =====================================================
   ORDERS
===================================================== */

async function fetchUserOrders() {
  return await safeFetch(`${API_BASE_URL}/orders`);
}

/* =====================================================
   ADMIN HEALTH CHECK
===================================================== */

async function checkServiceHealth() {

  const services = [
    { name: "User Service", url: `${API_BASE_URL}/health` },
    { name: "Order Service", url: `${API_BASE_URL}/orders/health` }
  ];

  return Promise.all(
    services.map(async s => {
      try {
        const r = await fetch(s.url);
        return { name: s.name, ok: r.ok };
      } catch {
        return { name: s.name, ok: false };
      }
    })
  );
}
