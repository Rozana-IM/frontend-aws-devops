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

async function apiRequest(url, options = {}) {

  showLoader();

  try {

    options.headers = {
      "Content-Type": "application/json",
...(getToken() && !url.includes("/products") && {
  Authorization: `Bearer ${getToken()}`
}),
       ...(options.headers || {})
    };

    let res = await fetch(url, options);

    // 🔁 TOKEN EXPIRED → REFRESH
    if (res.status === 401 && getRefreshToken()) {

      console.log("🔁 Token expired, refreshing...");

      // ❗ IMPORTANT: use fetch here (NOT apiRequest)
      const refreshRes = await fetch(
        `${API_BASE_URL}/users/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: getRefreshToken()
          })
        }
      );

      if (!refreshRes.ok) {
        logout();
        return null;
      }

      const data = await refreshRes.json();

      if (data.token) {

        console.log("✅ New token received");

        localStorage.setItem("token", data.token);

        // 🔁 RETRY ORIGINAL REQUEST
        options.headers.Authorization = `Bearer ${data.token}`;
        res = await fetch(url, options);

      } else {
        logout();
        return null;
      }
    }

    if (!res.ok) {
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
        `${API_BASE_URL}/users/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        }
      );

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("✅ Silent login success");
      }

    } catch (err) {
      console.error("Silent login failed");
    }
  }

});
