const API_BASE_URL = "https://rozana-projects.online";

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/users`);
    const data = await res.json();

    const target = document.getElementById("result");
    target.innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById("result").innerText =
      "❌ Failed to load users";
    console.error(err);
  }
}

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    const data = await res.json();

    const target = document.getElementById("result");
    target.innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    document.getElementById("result").innerText =
      "❌ Failed to load orders";
    console.error(err);
  }
}
