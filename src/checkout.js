const API = "https://api.rozana-projects.online";

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

      try{

        let verifyRes = await apiRequest(`${API}/payments/verify`,{
          method:"POST",
          body: JSON.stringify({
            orderId: orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        let verifyData = await verifyRes.json();

        if(verifyRes.ok){

          // ✅ CLEAR CART
          localStorage.removeItem("cart");

          // ✅ UPDATE NAVBAR COUNT
          if(typeof updateCartCount === "function"){
            updateCartCount();
          }

          // ✅ REDIRECT
          window.location = "order-success.html?id=" + orderId;

        } else {
          alert(verifyData.error || "Payment verification failed");
        }

      }catch(err){
        console.error(err);
        alert("Verification error");
      }
    },

    modal: {
      ondismiss: function(){
        alert("Payment cancelled");
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

    let res = await apiRequest(`${API}/orders/create`, {
      method:"POST",
      body: JSON.stringify({
        items,
        totalAmount,
        address
      })
    });

    let data = await res.json();

    if(!res.ok){
      alert(data.error || "Order failed");
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

    let payRes = await apiRequest(`${API}/payments/create`,{
      method:"POST",
      body: JSON.stringify({
        orderId,
        amount: totalAmount,
        method
      })
    });

    let paymentData = await payRes.json();

    if(!payRes.ok){
      alert(paymentData.error || "Payment failed");
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
