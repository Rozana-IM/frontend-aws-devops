const API_BASE_URL = "http://localhost:8080"; // API Gateway / ALB URL later

async function loadUsers() {
  const res = await fetch(`${API_BASE_URL}/users`);
  const data = await res.json();
  document.getElementById("result").innerText =
    JSON.stringify(data, null, 2);
}

async function loadOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`);
  const data = await res.json();
  document.getElementById("result").innerText =
    JSON.stringify(data, null, 2);
}

