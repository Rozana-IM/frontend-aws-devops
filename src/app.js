const API_BASE_URL = "http://localhost:8080";

async function loadUsers() {
  const res = await fetch(`${API_BASE_URL}/users`);
  const data = await res.json();

  const target =
    document.getElementById("usersResult") ||
    document.getElementById("result");

  target.innerText = JSON.stringify(data, null, 2);
}

async function loadOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`);
  const data = await res.json();

  const target =
    document.getElementById("ordersResult") ||
    document.getElementById("result");

  target.innerText = JSON.stringify(data, null, 2);
}
