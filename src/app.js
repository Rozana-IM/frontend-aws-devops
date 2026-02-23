const API_BASE_URL = "https://api.rozana-projects.online";

async function loadUsers() {
  const res = await fetch(`${API_BASE_URL}/admin/users`);
  const data = await res.json();
  document.getElementById("result").innerText =
    JSON.stringify(data, null, 2);
}

async function loadOrders() {
  const res = await fetch(`${API_BASE_URL}/admin/orders`);
  const data = await res.json();
  document.getElementById("result").innerText =
    JSON.stringify(data, null, 2);
}
