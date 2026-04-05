const API = "https://api.rozana-projects.online";

let isPlacingOrder = false;
let isPaymentStarted = false;

const params = new URLSearchParams(window.location.search);
const type = params.get("type");

let cart = [];

if(type === "buyNow"){
  const item = JSON.parse(localStorage.getItem("buyNowItem"));
  cart = item ? [item] : [];
} else {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
}
/* ===============================
LOAD CHECKOUT CART
=============================== */

function loadCheckout() {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty");
    window.location = "products.html";
    return;
  }

  let container = document.getElementById("checkoutItems");
  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    let price = Number(item.price);
    let qty = Number(item.quantity);

    total += price * qty;

    container.innerHTML += `
      <div class="checkout-item">
        <img src="${item.image}" width="80">
        <div>
          <p>${item.name}</p>
          <p>₹${price} x ${qty}</p>
        </div>
      </div>
    `;
  });

  document.getElementById("checkoutTotal").innerText =
    "Total: ₹" + total;
}

/* ===============================
RAZORPAY POPUP
=============================== */

function openRazorpay(order, orderId) {

  if (!order || !order.id) {
    alert("Invalid Razorpay order");
    console.error("❌ Invalid order object:", order);
    return;
  }

  console.log("💳 Opening Razorpay with:", order);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}

  const options = {
    key: "rzp_test_SPry8xdmipoUN8",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    name: "LUCCI",
    description: "Order Payment",

    modal: {
      ondismiss: async function () {
        console.log("❌ Payment cancelled");

        isPaymentStarted = false;
        window.onbeforeunload = null;

        try {
          await apiRequest(`${API}/orders/update-status`, {
            method: "PUT",
            body: JSON.stringify({
              orderId,
              status: "FAILED"
            }),
            skipLoader: true
          });
        } catch (err) {
          console.error("Cancel update failed");
        }
      }
    },

    prefill: {
      name: document.getElementById("full_name").value,
      contact: document.getElementById("phone").value,
      email: user?.email || "test@example.com"
    },

    notes: {
      orderId: orderId
    },

    theme: {
      color: "#3399cc"
    },

    handler: async function (response) {

      console.log("✅ Razorpay response:", response);

      try {

        let verifyData = await apiRequest(`${API}/payments/verify`, {
          method: "POST",
          body: JSON.stringify({
            orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }),
          skipLoader: true
        });

        if (verifyData && verifyData.success) {

          isPaymentStarted = false;
          window.onbeforeunload = null;

          // ✅ CLEAR CART FIRST
          localStorage.removeItem("cart");

          if (typeof updateCartCount === "function") {
            updateCartCount();
          }

          // ✅ SINGLE REDIRECT
          window.location.replace("order-success.html?id=" + orderId);

        } else {
          isPaymentStarted = false;
          alert(verifyData?.error || "Payment verification failed");
        }

      } catch (err) {
        isPaymentStarted = false;
        window.onbeforeunload = null;
        console.error(err);
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

document.getElementById("addressForm")
.addEventListener("submit", async function (e) {

  e.preventDefault();

  if (isPlacingOrder) return;
  isPlacingOrder = true;

  const btn = e.submitter;
  if (btn) btn.disabled = true;

  const token = localStorage.getItem("token");

  if (!token && !localStorage.getItem("refreshToken")) {
    alert("Please login first");
    isPlacingOrder = false;
    if (btn) btn.disabled = false;
    window.location = "profile.html";
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!cart.length) {
    alert("Cart is empty");
    isPlacingOrder = false;
    if (btn) btn.disabled = false;
    window.location = "products.html";
    return;
  }

  let items = cart.map(item => ({
    product_id: item.id,
    product_name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    image_url: item.image
  }));

  let totalAmount = cart.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity);
  }, 0);

  let address = {
    full_name: document.getElementById("full_name").value,
    phone: document.getElementById("phone").value,
    address_line1: document.getElementById("address_line1").value,
    address_line2: document.getElementById("address_line2").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    pincode: document.getElementById("pincode").value,
    country: "India"
  };

  try {

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
      alert(data?.error || "Order failed");
      throw new Error("Order failed");
    }

    const orderId = data.orderId;

    /* ================= PAYMENT METHOD ================= */

    let selected = document.querySelector('input[name="paymentMethod"]:checked');

    if (!selected) {
      alert("Please select a payment method");
      throw new Error("No payment method selected");
    }

    let method = selected.value.toLowerCase();

    /* ================= CREATE PAYMENT ================= */

    let paymentData = await apiRequest(`${API}/payments/create`, {
      method: "POST",
      body: JSON.stringify({
        orderId,
        amount: totalAmount,
        method
      })
    });

    if (!paymentData || paymentData.error) {
      alert(paymentData?.error || "Payment failed");
      throw new Error("Payment failed");
    }

    /* ================= HANDLE PAYMENT ================= */

    if (paymentData.gateway === "razorpay") {

      if (!paymentData.order) {
        console.error("❌ Missing Razorpay order:", paymentData);
        alert("Payment initialization failed");
        throw new Error("Razorpay init failed");
      }

      if (isPaymentStarted) {
        console.warn("⚠️ Payment already in progress");
        return;
      }

      isPaymentStarted = true;

      // ✅ SET LEAVE WARNING HERE
      window.onbeforeunload = () => "Payment in progress...";

      openRazorpay(paymentData.order, orderId);

    } else if (paymentData.gateway === "paytm") {

      window.location = paymentData.paymentUrl;

    } else if (paymentData.gateway === "cod") {

      localStorage.removeItem("cart");

      if (typeof updateCartCount === "function") {
        updateCartCount();
      }

      window.location.replace("order-success.html?id=" + orderId);

    } else {
      alert("Invalid payment gateway");
    }

  } catch (err) {
    console.error(err);
  } finally {
    isPlacingOrder = false;
    if (btn) btn.disabled = false;
  }
});

/* ===============================
INIT
=============================== */

loadCheckout();
