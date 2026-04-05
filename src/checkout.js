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
  const addresses = await apiRequest(`${API}/users/addresses`);

  const selectedBox = document.getElementById("selectedAddressBox");
  const listBox = document.getElementById("addressList");

  if (!addresses || addresses.length === 0) {
    showAddressForm();
    return;
  }

  allAddresses = addresses;

  // ✅ DO NOT RESET USER CHOICE
  if (!selectedAddressId) {
    selectedAddressId = addresses[0].id;
  }

  const selected = addresses.find(a => a.id === selectedAddressId);

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
      <div class="address-card" onclick="selectAddress(${addr.id})">
        <p><b>${addr.full_name}</b></p>
        <p>${addr.address_line1}, ${addr.city}</p>
        <p>${addr.state} - ${addr.pincode}</p>
        <p>${addr.phone}</p>
      </div>
    `;
  });
}

/* ================= ADDRESS ACTIONS ================= */

function toggleAddressList() {
  const box = document.getElementById("addressList");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

function selectAddress(id) {
  selectedAddressId = id;
  loadAddresses();
  document.getElementById("addressList").style.display = "none";
}

function showAddressForm() {
  document.getElementById("addressForm").style.display = "block";
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

      await apiRequest(`${API}/payments/verify`, {
        method: "POST",
        body: JSON.stringify({
          orderId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      localStorage.removeItem("cart");
      localStorage.removeItem("buyNowItem");

      window.location = "order-success.html?id=" + orderId;
    }
  };

  new Razorpay(options).open();
}

/* ================= PLACE ORDER ================= */

document.getElementById("placeOrderBtn")
.addEventListener("click", async () => {

  if (isPlacingOrder) return;
  isPlacingOrder = true;

  try {

    let address;

    if (selectedAddressId) {
      address = { addressId: selectedAddressId };
    } else {
      address = {
        full_name: full_name.value,
        phone: phone.value,
        address_line1: address_line1.value,
        address_line2: address_line2.value,
        city: city.value,
        state: state.value,
        pincode: pincode.value,
        country: "India"
      };

      await apiRequest(`${API}/users/addresses`, {
        method: "POST",
        body: JSON.stringify(address)
      });
    }

    const items = cart.map(i => ({
      product_id: Number(i.id),
      product_name: i.name,
      price: Number(i.price),
      quantity: Number(i.quantity),
      image_url: i.image
    }));

    const totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const orderRes = await apiRequest(`${API}/orders/create`, {
      method: "POST",
      body: JSON.stringify({ items, totalAmount, address })
    });

    const orderId = orderRes.orderId;

    const payment = await apiRequest(`${API}/payments/create`, {
      method: "POST",
      body: JSON.stringify({
        orderId,
        amount: totalAmount,
        method: document.querySelector('input[name="paymentMethod"]:checked').value
      })
    });

    if (payment.gateway === "razorpay") {
      openRazorpay(payment.order, orderId);
    } else {
      window.location = "order-success.html?id=" + orderId;
    }

  } catch (err) {
    console.error(err);
    alert("Order failed");
  }

  isPlacingOrder = false;
});

/* ================= INIT ================= */

loadCheckout();
loadAddresses();
