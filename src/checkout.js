const API = "https://api.rozana-projects.online";

let isPlacingOrder = false;
let isPaymentStarted = false;

const params = new URLSearchParams(window.location.search);
const type = params.get("type");

let cart = type === "buyNow"
  ? [JSON.parse(localStorage.getItem("buyNowItem"))]
  : JSON.parse(localStorage.getItem("cart")) || [];

let selectedAddressId = null;
let allAddresses = [];

/* ================= LOAD CART ================= */

function loadCheckout() {
  if (!cart.length) {
    alert("Cart is empty");
    window.location = "products.html";
    return;
  }

  let total = 0;
  const container = document.getElementById("checkoutItems");
  container.innerHTML = "";

  cart.forEach(item => {
    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="checkout-item">
        <img src="${item.image}" width="80">
        <div>
          <p>${item.name}</p>
          <p>₹${item.price} x ${item.quantity}</p>
        </div>
      </div>
    `;
  });

  document.getElementById("checkoutTotal").innerText = "Total: ₹" + total;
}

/* ================= LOAD ADDRESSES ================= */

async function loadAddresses() {
  let addresses = await apiRequest(`${API}/users/addresses`);

if (!addresses) {
  console.log("Retrying address fetch...");
  addresses = await apiRequest(`${API}/users/addresses`);
}

  const selectedBox = document.getElementById("selectedAddressBox");
  const listBox = document.getElementById("addressList");

  if (!addresses || addresses.length === 0) {
  allAddresses = [];
  selectedAddressId = null;

  document.getElementById("selectedAddressBox").innerHTML = "";

  // ✅ ADD THIS
  document.getElementById("addressList").style.display = "none";

  showAddressForm();

  return;
}

  allAddresses = addresses;

  // ✅ DO NOT RESET USER CHOICE
  if (!selectedAddressId) {
    selectedAddressId = addresses[0].id;
  }

  const selected = addresses.find(a => a.id === selectedAddressId);

if (!selected) {
  console.warn("No selected address found");
  showAddressForm();
  return;
}
  // SELECTED UI
  selectedBox.innerHTML = `
    <div class="address-card selected">
      <p><b>${selected.full_name}</b></p>
      <p>${selected.address_line1}, ${selected.city}</p>
      <p>${selected.state} - ${selected.pincode}</p>
      <p>${selected.phone}</p>
    </div>
  `;

  // LIST UI
  listBox.innerHTML = "";

  addresses.forEach(addr => {
  listBox.innerHTML += `
    <div class="address-card">
      <p><b>${addr.full_name}</b></p>
      <p>${addr.address_line1}, ${addr.city}</p>
      <p>${addr.state} - ${addr.pincode}</p>
      <p>${addr.phone}</p>

      <button class="delete-btn" onclick="deleteAddress(${addr.id})">
        Delete
      </button>

      <div onclick="selectAddress(${addr.id})" style="margin-top:10px; cursor:pointer; color:blue;">
        Select Address
      </div>
    </div>
  `;
});
}

/* ================= ADDRESS ACTIONS ================= */

function toggleAddressList() {
  const box = document.getElementById("addressList");
  const form = document.getElementById("addressForm");

  form.style.display = "none";

  box.style.display =
    box.style.display === "none" ? "block" : "none";
}

function selectAddress(id) {
  selectedAddressId = id;

  document.getElementById("addressForm").style.display = "none"; 

  loadAddresses();

  document.getElementById("addressList").style.display = "none";
}

function showAddressForm() {
  const form = document.getElementById("addressForm");
  const list = document.getElementById("addressList");

  // close list
  list.style.display = "none";

  // toggle form
  form.style.display =
    form.style.display === "none" || form.style.display === ""
      ? "block"
      : "none";
}

/* ================= RAZORPAY ================= */

function openRazorpay(order, orderId) {

  let user = JSON.parse(localStorage.getItem("user")) || {};

  let selected = allAddresses.find(a => a.id === selectedAddressId);

  let name = selected?.full_name || document.getElementById("full_name")?.value;
  let phone = selected?.phone || document.getElementById("phone")?.value;

  const options = {
    key: "rzp_test_SPry8xdmipoUN8",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    name: "LUCCI",
    description: "Order Payment",

    prefill: {
      name,
      contact: phone,
      email: user.email || "test@example.com"
    },

    handler: async function (response) {

      const verifyRes = await apiRequest(`${API}/payments/verify`, {
  method: "POST",
  body: JSON.stringify({
    orderId,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature
  })
});

if (!verifyRes || !verifyRes.success) {
  alert("Payment verification failed");
  return;
}

      localStorage.removeItem("cart");
      localStorage.removeItem("buyNowItem");

      window.location.replace("order-success.html?id=" + orderId);
    },
    modal: {
    ondismiss: function () {
      alert("Payment cancelled");
    }
  }
  };

  new Razorpay(options).open();
}

/* ================= PLACE ORDER ================= */

document.getElementById("placeOrderBtn")
.addEventListener("click", async () => {

  if (!cart.length) {
    alert("Cart expired or already ordered");
    window.location = "products.html";
    return;
  }

  const btn = document.getElementById("placeOrderBtn");

  if (isPlacingOrder) return;

  isPlacingOrder = true;
  btn.disabled = true;
  btn.innerText = "Processing...";

  try {

    /* ================= ADDRESS ================= */
/* ================= ADDRESS ================= */

let address;
let selected = allAddresses.find(a => a.id === selectedAddressId);
 const fullNameEl = document.getElementById("full_name");

if (
  !selected &&
  (!fullNameEl?.value ||
   !document.getElementById("phone").value ||
   !document.getElementById("address_line1").value)
) {
  alert("Please fill address or select one");

  isPlacingOrder = false;
  btn.disabled = false;
  btn.innerText = "Place Order";

  return;
}
    
if (selected) {
  address = selected;
} else {

  address = {
    full_name: document.getElementById("full_name").value,
    phone: document.getElementById("phone").value,
    address_line1: document.getElementById("address_line1").value,
    address_line2: document.getElementById("address_line2").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    pincode: document.getElementById("pincode").value,
    country: "India"
  };

  if (!address.full_name || !address.phone || !address.address_line1) {
    alert("Please fill complete address");
    isPlacingOrder = false;
    btn.disabled = false;
    btn.innerText = "Place Order";
    return;
  }

  await apiRequest(`${API}/users/addresses`, {
    method: "POST",
    body: JSON.stringify(address)
  });

  await loadAddresses();

// ✅ safer selection
selectedAddressId = allAddresses[allAddresses.length - 1]?.id;

let latest = allAddresses.find(a => a.id === selectedAddressId);
if (latest) {
  address = latest;
}
}

/* ================= ORDER (NOW OUTSIDE) ================= */

console.log("📍 FINAL ADDRESS:", address);

const items = cart.map(i => ({
  product_id: Number(i.id),
  product_name: i.name,
  price: Number(i.price),
  quantity: Number(i.quantity),
  image_url: i.image
}));

const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);

console.log("🚀 Sending order:", { items, totalAmount, address });

const orderRes = await apiRequest(`${API}/orders/create`, {
  method: "POST",
  body: JSON.stringify({ items, totalAmount, address })
});

if (!orderRes || !orderRes.orderId) {
  console.error("Order failed:", orderRes);
  alert("Order creation failed");
  return;
}

const orderId = orderRes.orderId;

/* ================= PAYMENT ================= */

const methodEl = document.querySelector('input[name="paymentMethod"]:checked');

if (!methodEl) {
  alert("Please select payment method");
  return;
}

const method = methodEl.value;

const payment = await apiRequest(`${API}/payments/create`, {
  method: "POST",
  body: JSON.stringify({
    orderId,
    amount: totalAmount,
    method
  })
});

if (!payment) {
  alert("Payment initialization failed");
  return;
}

if (payment.gateway === "razorpay") {

  if (!payment.order) {
    alert("Payment gateway error");
    return;
  }

  openRazorpay(payment.order, orderId);

} else if (payment.gateway === "cod") {

  localStorage.removeItem("cart");
  localStorage.removeItem("buyNowItem");

  window.location = "order-success.html?id=" + orderId;

} else if (payment.gateway === "paytm") {

  if (!payment.paymentUrl) {
    alert("Paytm gateway error");
    return;
  }

  window.location.href = payment.paymentUrl;
}
    
  } catch (err) {
    console.error(err);
    alert("Order failed");
  } finally {
    // ✅ CORRECT PLACE
    isPlacingOrder = false;
    btn.disabled = false;
    btn.innerText = "Place Order";
  }

});

/*   DELETE FUNTION   */

async function deleteAddress(id) {
  if (!confirm("Delete this address?")) return;

  const res = await apiRequest(`${API}/users/addresses/${id}`, { 
    method: "DELETE"
  });

  if (!res) {
    alert("Failed to delete address");
    return;
  }

  // close list
  document.getElementById("addressList").style.display = "none";

  if (selectedAddressId === id) {
    selectedAddressId = null;
  }

  document.getElementById("addressForm").style.display = "none";

  await loadAddresses();

  if (allAddresses.length > 0 && !selectedAddressId) {
    selectedAddressId = allAddresses[0].id;
  }
}

/* ================= INIT ================= */

loadCheckout();
loadAddresses();
