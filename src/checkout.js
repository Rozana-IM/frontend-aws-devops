const API = "https://api.rozana-projects.online";

let isPlacingOrder = false;
let isPaymentStarted = false;

/* ===============================
BUY NOW / CART HANDLING
=============================== */

const params = new URLSearchParams(window.location.search);
const type = params.get("type");

let cart = [];

if (type === "buyNow") {
  const item = JSON.parse(localStorage.getItem("buyNowItem"));
  cart = item ? [item] : [];
} else {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
}

function showAddressForm(){
  document.getElementById("addressForm").style.display = "block";
}

/* ===============================
LOAD CHECKOUT CART
=============================== */

function loadCheckout(){

  if(!cart.length){
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

  document.getElementById("checkoutTotal").innerText =
    "Total: ₹" + total;
}

/* ===============================
LOAD ADDRESSES
=============================== */

async function loadAddresses(){

  const addresses = await apiRequest(`${API}/users/addresses`);
  const container = document.getElementById("savedAddresses");

  if(!addresses || addresses.length === 0){
    showAddressForm();
    return;
  }

  container.innerHTML = "";

  addresses.forEach((addr, index) => {

    container.innerHTML += `
      <div class="address-card ${index === 0 ? 'selected' : ''}">
        <input 
          type="radio" 
          name="selectedAddress" 
          value="${addr.id}" 
          ${index === 0 ? "checked" : ""}
        >

        <p><b>${addr.full_name}</b></p>
        <p>${addr.address_line1}, ${addr.city}</p>
        <p>${addr.state} - ${addr.pincode}</p>
        <p>${addr.phone}</p>
      </div>
    `;
  });

  // ✅ Default behavior → show only first address
  const cards = document.querySelectorAll(".address-card");

  cards.forEach((card, index) => {
    if(index !== 0){
      card.style.display = "none";
    }
  });

}

  // ✅ AUTO SELECT FIRST ADDRESS
  const first = document.querySelector('input[name="selectedAddress"]');
  if(first) first.checked = true;
}

/* ===============================
RAZORPAY POPUP
=============================== */

function openRazorpay(order, orderId) {

  if (!order || !order.id) {
    alert("Invalid Razorpay order");
    return;
  }

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  // ✅ GET ADDRESS DATA FOR PREFILL
  let selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');

  let name = "";
  let phone = "";

  if(selectedAddress){
    const card = selectedAddress.closest(".address-card");
    name = card.querySelector("p b").innerText;
    phone = card.querySelectorAll("p")[3].innerText;
  } else {
    name = document.getElementById("full_name").value;
    phone = document.getElementById("phone").value;
  }

  const options = {
    key: "rzp_test_SPry8xdmipoUN8",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    name: "LUCCI",
    description: "Order Payment",

    modal: {
      ondismiss: async function () {
        isPaymentStarted = false;
        window.onbeforeunload = null;

        try {
          await apiRequest(`${API}/orders/update-status`, {
            method: "PUT",
            body: JSON.stringify({
              orderId,
              status: "FAILED"
            })
          });
        } catch {}
      }
    },

    prefill: {
      name,
      contact: phone,
      email: user?.email || "test@example.com"
    },

    notes: {
      orderId: orderId
    },

    theme: {
      color: "#3399cc"
    },

    handler: async function (response) {

      try {

        let verifyData = await apiRequest(`${API}/payments/verify`, {
          method: "POST",
          body: JSON.stringify({
            orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        if (verifyData && verifyData.success) {

          isPaymentStarted = false;
          window.onbeforeunload = null;

          localStorage.removeItem("cart");
          localStorage.removeItem("buyNowItem");

          if (typeof updateCartCount === "function") {
            updateCartCount();
          }

          window.location.replace("order-success.html?id=" + orderId);

        } else {
          isPaymentStarted = false;
          alert("Payment verification failed");
        }

      } catch (err) {
        isPaymentStarted = false;
        window.onbeforeunload = null;
        alert("Verification error");
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

/* ===============================
PLACE ORDER
=============================== */

document.getElementById("placeOrderBtn")
.addEventListener("click", async () => {

  if (isPlacingOrder) return;
  isPlacingOrder = true;

  const btn = document.getElementById("placeOrderBtn");
  btn.disabled = true;

  try {

    /* ================= ADDRESS ================= */

    let selectedAddress = document.querySelector('input[name="selectedAddress"]:checked');
    let address;

    if (selectedAddress) {
      address = { addressId: selectedAddress.value };
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

      // ✅ VALIDATION
      if(!address.full_name || !address.phone || !address.address_line1){
        alert("Please fill address details");
        return;
      }

      await apiRequest(`${API}/users/addresses`, {
        method: "POST",
        body: JSON.stringify(address)
      });
    }

    /* ================= ITEMS ================= */

    let items = cart.map(i => ({
      product_id: i.id,
      product_name: i.name,
      price: i.price,
      quantity: i.quantity,
      image_url: i.image
    }));

    let totalAmount = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    /* ================= CREATE ORDER ================= */

    let data = await apiRequest(`${API}/orders/create`, {
      method: "POST",
      body: JSON.stringify({
        items,
        totalAmount,
        address
      })
    });

    if (!data || data.error) {
      alert("Order failed");
      return;
    }

    const orderId = data.orderId;

    /* ================= PAYMENT ================= */

    let method = document.querySelector('input[name="paymentMethod"]:checked').value;

    let paymentData = await apiRequest(`${API}/payments/create`, {
      method: "POST",
      body: JSON.stringify({
        orderId,
        amount: totalAmount,
        method
      })
    });

    if (!paymentData || paymentData.error) {
      alert("Payment failed");
      return;
    }

    /* ================= HANDLE PAYMENT ================= */

    if (paymentData.gateway === "razorpay") {

      if (!paymentData.order) {
        alert("Payment initialization failed");
        return;
      }

      if (isPaymentStarted) return;

      isPaymentStarted = true;
      window.onbeforeunload = () => "Payment in progress...";

      openRazorpay(paymentData.order, orderId);

    } 
    else if (paymentData.gateway === "paytm") {

      window.location = paymentData.paymentUrl;

    } 
    else {

      localStorage.removeItem("cart");
      localStorage.removeItem("buyNowItem");

      if (typeof updateCartCount === "function") {
        updateCartCount();
      }

      window.location = "order-success.html?id=" + orderId;
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    isPlacingOrder = false;
    btn.disabled = false;
  }
});

/* ===============================
    TOGGLE ADDRESS
=============================== */

function toggleAddressList(){
  const container = document.getElementById("savedAddresses");

  if(container.style.display === "none"){
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

/* ===============================
INIT
=============================== */

loadCheckout();
loadAddresses();
