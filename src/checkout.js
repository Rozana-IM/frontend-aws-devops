const API = "https://api.rozana-projects.online";

/* ===============================
LOAD CHECKOUT CART
=============================== */

function loadCheckout(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let container = document.getElementById("checkoutItems");

container.innerHTML = "";

let total = 0;

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

/* GET CART */

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* FORMAT ITEMS FOR API */

let items = cart.map(item => ({
product_id: item.id,
product_name: item.name,
price: item.price,
quantity: item.quantity,
image_url: item.image
}));

/* CALCULATE TOTAL */

let totalAmount = cart.reduce(
(sum,item)=>sum+(item.price*item.quantity),
0
);

/* ADDRESS */

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

/* CREATE ORDER */

try{

let res = await fetch(`${API}/orders`,{

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

let data = await res.json();

if(res.ok){

alert("Order placed successfully 🎉");

localStorage.removeItem("cart");

window.location="order-success.html?id="+data.orderId;
}else{

alert(data.error || "Order failed");

}

}catch(err){

console.error(err);

alert("Server error");

}

});

loadCheckout();
