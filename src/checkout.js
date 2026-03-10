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

/* PLACE ORDER */

document.getElementById("addressForm")
.addEventListener("submit", function(e){

e.preventDefault();

let order = {

name: document.getElementById("name").value,
phone: document.getElementById("phone").value,
address: document.getElementById("address").value,
city: document.getElementById("city").value,
state: document.getElementById("state").value,
pincode: document.getElementById("pincode").value,

items: JSON.parse(localStorage.getItem("cart")) || []

};

console.log("ORDER DATA", order);

alert("Order placed successfully!");

localStorage.removeItem("cart");

window.location = "orders.html";

});

loadCheckout();
