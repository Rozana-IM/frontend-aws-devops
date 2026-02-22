const API_BASE_URL = "https://api.rozana-projects.online";

// LOAD USERS
async function loadUsers() {
  const result = document.getElementById("result");
  result.innerText = "Loading users...";

  try {
    const res = await fetch(`${API_BASE_URL}/users`);
    const data = await res.json();

    if (!res.ok) {
      result.innerText = "Failed to load users";
      return;
    }

    // ✅ HANDLE BOTH FORMATS
    const users = data.users || data;
    result.innerText = JSON.stringify(users, null, 2);

  } catch (error) {
    console.error(error);
    result.innerText = "Server error while loading users";
  }
}

// LOAD ORDERS
async function loadOrders() {
  const result = document.getElementById("result");
  result.innerText = "Loading orders...";

  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    const data = await res.json();

    if (!res.ok) {
      result.innerText = "Failed to load orders";
      return;
    }

    // ✅ HANDLE BOTH FORMATS
    const orders = data.orders || data;
    result.innerText = JSON.stringify(orders, null, 2);

  } catch (error) {
    console.error(error);
    result.innerText = "Server error while loading orders";
  }
}
