const API = "https://api.rozana-projects.online";

/* ===============================
API REQUEST FUNCTION (ADD HERE)
=============================== */
 async function apiRequest(url, options = {}) {

  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });

  const text = await res.text(); // ✅ ONLY ONCE

  if (!res.ok) {
    console.error("❌ API ERROR:", res.status, text);
    return { error: `API Error ${res.status}` };
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("❌ Invalid JSON:", text);
    return { error: "Invalid response from server" };
  }
}

/* ===============================
LOAD CHECKOUT CART
=============================== */

function loadCheckout(){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length === 0){
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

function openRazorpay(order, orderId){

  const options = {
    key: "rzp_test_SPry8xdmipoUN8",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    name: "LUCCI",
    description: "Order Payment",

    prefill: {
      name: document.getElementById("full_name").value,
      contact: document.getElementById("phone").value,
      email: "admin@lucci.com"
    },

    notes: {
      orderId: orderId
    },

    theme: {
      color: "#3399cc"
    },

    handler: async function(response){

      console.log("✅ Razorpay response:", response);

      try{

        let verifyData = await apiRequest(`${API}/payments/verify`,{
          method:"POST",
          body: JSON.stringify({
            orderId: orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        if(verifyData && verifyData.success){
          localStorage.removeItem("cart");

          if(typeof updateCartCount === "function"){
            updateCartCount();
          }

          window.location = "order-success.html?id=" + orderId;
        } else {
          alert(verifyData?.error || "Payment verification failed");
        }

      }catch(err){
        console.error(err);
        alert("Verification error");
      }
    } // ✅ handler ends here
  };

  // ✅ THIS MUST BE OUTSIDE handler
  const rzp = new Razorpay(options);
  rzp.open();
}

/* ===============================
PLACE ORDER
=============================== */

document.getElementById("addressForm")
.addEventListener("submit", async function(e){

  e.preventDefault();

  let token = localStorage.getItem("token");

  if(!token){
    alert("Please login first");
    window.location = "profile.html";
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let items = cart.map(item => ({
    product_id: item.id,
    product_name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    image_url: item.image
  }));

  let totalAmount = cart.reduce((sum,item)=>{
    return sum + (Number(item.price) * item.quantity);
  },0);

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

  try{

    /* ================= CREATE ORDER ================= */

    let data = await apiRequest(`${API}/orders/create`, {
      method:"POST",
      body: JSON.stringify({
        items,
        totalAmount,
        address
      })
    });

    if(!data || data.error){
      alert(data?.error || "Order failed");
      return;
    }

    const orderId = data.orderId;

    /* ================= PAYMENT METHOD ================= */

    let selected = document.querySelector('input[name="paymentMethod"]:checked');

    if(!selected){
      alert("Please select a payment method");
      return;
    }

    let method = selected.value.toLowerCase();

    /* ================= CREATE PAYMENT ================= */

    let paymentData = await apiRequest(`${API}/payments/create`,{
      method:"POST",
      body: JSON.stringify({
        orderId,
        amount: totalAmount,
        method
      })
    });

    if(!paymentData || paymentData.error){
      alert(paymentData?.error || "Payment failed");
      return;
    }

    /* ================= HANDLE PAYMENT ================= */

    if(paymentData.gateway === "razorpay"){
      openRazorpay(paymentData.order, orderId);
    }
    else if(paymentData.gateway === "paytm"){
      window.location = paymentData.paymentUrl;
    }
    else if(paymentData.gateway === "cod"){
      localStorage.removeItem("cart");
      window.location = "order-success.html?id=" + orderId;
    }
    else{
      alert("Invalid payment gateway");
    }

  }catch(err){
    console.error(err);
    alert("Server error");
  }
});

/* ===============================
INIT
=============================== */

loadCheckout();
