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
   PAGE INIT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setupProfileUI();
  setupDropdown();
});

/* =====================================================
   PROFILE UI CONTROL
===================================================== */

function setupProfileUI() {

  const user = getUser();

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const welcomeText = document.getElementById("welcomeText");
  const subText = document.querySelector(".sub-text");

  if (!welcomeText) return;

  if (user) {
    loginBtn && (loginBtn.style.display = "none");
    logoutBtn && (logoutBtn.style.display = "block");

    welcomeText.innerText = `Hello, ${user.name} 👋`;

    if (subText) {
      subText.style.display = "block";
      subText.innerText = "Explore LUCCI collections";
    }

  } else {
    loginBtn && (loginBtn.style.display = "block");
    logoutBtn && (logoutBtn.style.display = "none");

    welcomeText.innerText = "Welcome";

    if (subText) {
      subText.style.display = "block";
      subText.innerText = "To access account and manage orders";
    }
  }

  logoutBtn?.addEventListener("click", e => {
    e.preventDefault();
    logout();
  });
}

/* =====================================================
   DROPDOWN
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
   LOADER
===================================================== */

function showLoader() {
  let loader = document.getElementById("globalLoader");

  if (!loader) {
    loader = document.createElement("div");
    loader.id = "globalLoader";
    loader.innerText = "Loading...";
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
   SAFE FETCH
===================================================== */

async function safeFetch(url, options = {}) {

  showLoader();

  try {

    options.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    };

    let res = await fetch(url, options);

    // 🔁 TOKEN EXPIRED → REFRESH
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

    if (!res.ok) return null;

    return await res.json();

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return null;
  } finally {
    hideLoader(); // ✅ always hide loader
  }
}

/* =====================================================
   REFRESH TOKEN
===================================================== */

async function refreshAccessToken() {

  try {

    const res = await fetch(`${API_BASE_URL}/users/auth/refresh`, {
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

  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return false;
  }
}
