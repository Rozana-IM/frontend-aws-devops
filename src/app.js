// ================= SERVICE URL =================
// Single entry point via API Gateway
const API_BASE_URL = "https://api.rozana-projects.online";

// ================= USER HELPERS =================
function getUser() {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token");
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

function isAdmin() {
  const user = getUser();
  return user && user.role === "admin";
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function requireLogin() {
  if (!getUser() || !getToken()) {
    window.location.href = "profile.html";
    return false;
  }
  return true;
}

// ================= SAFE FETCH WITH REFRESH =================
async function safeFetch(url, options = {}) {
  try {
    let res = await fetch(url, options);

    // 🔁 Access token expired → try refresh
    if (res.status === 401 && getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        options.headers = authHeaders();
        res = await fetch(url, options);
      }
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err.message);
    return null;
  }
}

// ================= REFRESH TOKEN =================
async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: getRefreshToken(),
      }),
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    localStorage.setItem("token", data.token);
    return true;
  } catch {
    logout();
    return false;
  }
}

// ================= ORDERS =================
async function fetchUserOrders() {
  if (!requireLogin()) return [];

  return (
    (await safeFetch(`${API_BASE_URL}/orders`, {
      headers: authHeaders(),
    })) || []
  );
}

async function createOrder(items, totalAmount) {
  if (!requireLogin()) return null;

  return await safeFetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items, totalAmount }),
  });
}

// ================= ADMIN =================
async function fetchAllUsers() {
  if (!requireLogin() || !isAdmin()) return [];

  return (
    (await safeFetch(`${API_BASE_URL}/admin/users`, {
      headers: authHeaders(),
    })) || []
  );
}

async function fetchAllOrders() {
  if (!requireLogin() || !isAdmin()) return [];

  return (
    (await safeFetch(`${API_BASE_URL}/admin/orders`, {
      headers: authHeaders(),
    })) || []
  );
}