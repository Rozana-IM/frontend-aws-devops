// ================= SERVICE URLS =================
const USER_SERVICE_URL = "https://api.rozana-projects.online";
const ORDER_SERVICE_URL = "https://api.rozana-projects.online";

// ================= SAFE HELPERS =================
function getUser() {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch (e) {
    console.error("Invalid user JSON in localStorage");
    localStorage.removeItem("user");
    return null;
  }
}

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function requireLogin() {
  if (!getUser() || !getToken()) {
    alert("Please login first");
    window.location.href = "profile.html";
    return false;
  }
  return true;
}

// ================= SAFE FETCH =================
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
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

// ================= ORDERS =================
async function createOrder(items, totalAmount) {
  if (!requireLogin()) return null;

  return await safeFetch(`${ORDER_SERVICE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      items,
      totalAmount,
    }),
  });
}

async function fetchUserOrders() {
  if (!requireLogin()) return [];

  return (
    (await safeFetch(`${ORDER_SERVICE_URL}/orders`, {
      headers: authHeaders(),
    })) || []
  );
}

// ================= ADMIN =================
async function fetchAllUsers() {
  if (!requireLogin()) return [];

  return (
    (await safeFetch(`${USER_SERVICE_URL}/admin/users`, {
      headers: authHeaders(),
    })) || []
  );
}

async function fetchAllOrders() {
  if (!requireLogin()) return [];

  return (
    (await safeFetch(`${ORDER_SERVICE_URL}/admin/orders`, {
      headers: authHeaders(),
    })) || []
  );
}
