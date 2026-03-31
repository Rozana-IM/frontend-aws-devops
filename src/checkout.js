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

function openRazorpay(order, orderId, token){

const options = {

key: "rzp_test_SPry8xdmipoUN8",

amount: order.amount,

currency: "INR",

order_id: order.id,

name: "LUCCI",

description: "Order Payment",

prefill: {
name: document.getElementById("full_name").value,
contact: document.getElementById("phone").value
},

handler: async function(response){

try{

let verifyRes = await fetch(`${API}/payments/verify`,{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body: JSON.stringify({
orderId,
razorpay_order_id: response.razorpay_order_id,
razorpay_payment_id: response.razorpay_payment_id,
razorpay_signature: response.razorpay_signature
})

});

let verifyData = await verifyRes.json();

if(verifyRes.ok){

localStorage.removeItem("cart");
window.location = "order-success.html?id=" + orderId;

}else{

alert(verifyData.error || "Payment verification failed");

}

}catch(err){

console.error(err);
alert("Verification error");

}

},

modal:{
ondismiss:function(){
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

/* CREATE ORDER */

let res = await fetch(`${API}/orders/create`, {

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body: JSON.stringify({
items,
totalAmount,
address
})

});

let text = await res.text();
let data;

try{
data = JSON.parse(text);
}catch{
console.error("Invalid JSON:", text);
alert("Server returned invalid response");
return;
}

if(!res.ok){
alert(data.error || "Order failed");
return;
}

const orderId = data.orderId;

/* GET PAYMENT METHOD */

let selected = document.querySelector('input[name="paymentMethod"]:checked');

if(!selected){
alert("Please select a payment method");
return;
}

let method = selected.value;

/* CREATE PAYMENT */

let payRes = await fetch(`${API}/payments/create`,{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body: JSON.stringify({
orderId,
amount: totalAmount,
method
})

});

if(!payRes.ok){

const errText = await payRes.text();
console.error("Payment API error:", errText);
alert("Payment creation failed");
return;

}

let payText = await payRes.text();
let paymentData;

try{
paymentData = JSON.parse(payText);
}catch{
console.error("Invalid payment response:", payText);
alert("Payment service returned invalid response");
return;
}

if(paymentData.gateway === "razorpay"){

openRazorpay(paymentData.order, orderId, token);

}
else if(paymentData.gateway === "paytm"){

window.location = paymentData.payment.paymentUrl;

}
else{

alert("Payment gateway error");

}

}catch(err){

console.error(err);
alert("Server error");

}

});

/* INITIAL LOAD */

loadCheckout();
