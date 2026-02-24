// ================== API BASE URLS ==================
const USER_SERVICE_URL = "https://api.rozana-projects.online"; 
const ORDER_SERVICE_URL = "https://api.rozana-projects.online";

// ================== AUTH ==================
function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function requireLogin() {
  const user = getLoggedInUser();
  if (!user) {
    alert("Please login first");
    window.location.href = "profile.html";
    return null;
  }
  return user;
}

// ================== CREATE ORDER ==================
async function createOrder(items, totalAmount) {
  const user = requireLogin();
  if (!user) return;

  const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      items,
      totalAmount
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert("Failed to create order");
    return;
  }

  alert("Order placed successfully!");
  return data;
}

// ================== GET MY ORDERS ==================
async function loadMyOrders() {
  const user = requireLogin();
  if (!user) return;

  const res = await fetch(`${ORDER_SERVICE_URL}/orders/${user.id}`);
  const orders = await res.json();

  const container = document.getElementById("ordersContainer");
  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders found</p>";
    return;
  }

  orders.forEach(order => {
    const div = document.createElement("div");
    div.className = "order-card";
    div.innerHTML = `
      <p><b>Order ID:</b> ${order.id}</p>
      <p><b>Items:</b> ${order.items.join(", ")}</p>
      <p><b>Total:</b> ₹${order.totalAmount}</p>
      <hr/>
    `;
    container.appendChild(div);
  });
}

// ================== ADMIN ORDERS ==================
async function loadAllOrders() {
  const res = await fetch(`${ORDER_SERVICE_URL}/admin/orders`);
  const data = await res.json();

  document.getElementById("result").innerText =
    JSON.stringify(data, null, 2);
}
