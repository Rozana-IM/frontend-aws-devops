// ================= SERVICE URLS =================
const USER_SERVICE_URL = "https://api.rozana-projects.online";
const ORDER_SERVICE_URL = "https://api.rozana-projects.online";
// ================= AUTH HELPERS =================
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

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function requireLogin() {
  if (!getUser()) {
    alert("Please login first");
    window.location.href = "profile.html";
    return false;
  }
  return true;
}

// ================= ORDERS =================
async function createOrder(items, totalAmount) {
  const user = getUser();
  if (!user) return;

  const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  items,
  totalAmount
})
  });

  return res.json();
}

async function fetchUserOrders() {
  const user = getUser();
  if (!user) return [];

  const res = await fetch(
    `${ORDER_SERVICE_URL}/orders/${user.id}`
  );
  return res.json();
}

// ================= ADMIN =================
async function fetchAllUsers() {
  const res = await fetch(`${USER_SERVICE_URL}/admin/users`);
  return res.json();
}

async function fetchAllOrders() {
  const res = await fetch(`${ORDER_SERVICE_URL}/admin/orders`);
  return res.json();
}
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

// Example
fetch(`${ORDER_SERVICE_URL}/orders`, {
  headers: authHeaders(),
});
