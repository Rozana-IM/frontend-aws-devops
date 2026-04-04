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
  return window.currentToken || localStorage.getItem("token");
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
  window.location.href = "profile.html";
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
   API REQUEST (AUTO TOKEN HANDLING)
===================================================== */
let isRefreshing = false;
let refreshPromise = null;

async function apiRequest(url, options = {}) {

  if (!options.skipLoader) showLoader();

  try {

    options.headers = {
      "Content-Type": "application/json",
      ...(getToken() && {
        Authorization: `Bearer ${getToken()}`
      }),
      ...(options.headers || {})
    };

    let res = await fetch(url, options);
    
    /* ================= TOKEN EXPIRED ================= */

    if (res.status === 401 && getRefreshToken()) {

      if (!isRefreshing) {

        isRefreshing = true;

        refreshPromise = fetch(`${API_BASE_URL}/users/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: getRefreshToken()
          })
        })
        .then(async (r) => {
          if (!r.ok) {
            logout();
            return null;
          }
          return r.json();
        })
        .then(data => {
  if (data?.token) {

    // ✅ STORE TOKEN (PERSIST)
    localStorage.setItem("token", data.token);

    // ✅ STORE TOKEN (IN MEMORY - INSTANT USE)
    window.currentToken = data.token;

    console.log("🔄 Token refreshed");

    return data.token;

  } else {
    logout();
    return null;
  }
})
        .finally(() => {
          isRefreshing = false;
        });
      }

      const newToken = await refreshPromise;

      if (!newToken) {
  console.log("❌ Refresh failed");
  logout();
  return null;
}

      // 🔁 Retry original request
      options.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, options);
    }

    /* ================= FINAL RESPONSE CHECK ================= */

    if (!res.ok) {

  if (res.status === 401) {
    console.log("❌ Unauthorized → logout");
    logout();
    return null;
  }

  // ⚠️ DO NOT logout for 403
  if (res.status === 403) {
    console.warn("⚠️ Forbidden request");
    return null;
  }

  console.error("API ERROR:", res.status);
  return null;
}

    return await res.json();

  } catch (err) {
    console.error("FETCH ERROR:", err);
    return null;

  } finally {
    hideLoader();
  }
}
/* =====================================================
   SILENT LOGIN (AUTO LOGIN ON PAGE LOAD)
===================================================== */

window.addEventListener("load", async () => {

  const token = getToken();
  const refreshToken = getRefreshToken();

  if (!token && refreshToken) {

    console.log("🔁 Silent login...");

    try {
      const res = await fetch(
        `${API_BASE_URL}/users/auth/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        }
      );

      const data = await res.json();

      if (data.token) {

  localStorage.setItem("token", data.token);

  // ✅ ADD THIS
  window.currentToken = data.token;

  console.log("✅ Silent login success");
}

    } catch (err) {
      console.error("Silent login failed");
    }
  }

});
