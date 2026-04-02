/* ===============================
LOAD CART
=============================== */

function loadCart(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let container = document.getElementById("cartItems");
let totalBox = document.getElementById("cartTotal");

if(!container) return;

container.innerHTML = "";

if(cart.length === 0){

container.innerHTML = `
<div class="empty-cart">
<p>Your bag is empty 👜</p>
<a href="products.html" class="shop-btn">Continue Shopping</a>
</div>
`;

if(totalBox) totalBox.innerText = "";

updateCartCount();

return;

}

let total = 0;

cart.forEach((item,index)=>{

let price = Number(item.price) || 0;
let qty = Number(item.quantity) || 1;

total += price * qty;

container.innerHTML += `

<div class="cart-item">

<div class="cart-image">
<img src="${item.image}" alt="${item.name}" onerror="this.src='https://cdn.rozana-projects.online/placeholder.png'">
</div>

<div class="cart-details">

<h3>${item.name}</h3>

<p class="cart-price">₹${price}</p>

<div class="qty-box">

<button class="qty-btn" onclick="decreaseQty(${index})">−</button>

<span class="qty">${qty}</span>

<button class="qty-btn" onclick="increaseQty(${index})">+</button>

</div>

<button class="remove-btn" onclick="removeItem(${index})">
Remove
</button>

</div>

</div>

`;

});

if(totalBox){
totalBox.innerText = "Total: ₹" + total.toFixed(2);
}

updateCartCount();

}


/* ===============================
INCREASE QTY
=============================== */

function increaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(!cart[index]) return;

cart[index].quantity = Number(cart[index].quantity) + 1;

localStorage.setItem("cart", JSON.stringify(cart));

loadCart();

}


/* ===============================
DECREASE QTY
=============================== */

function decreaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(!cart[index]) return;

if(cart[index].quantity > 1){
cart[index].quantity = Number(cart[index].quantity) - 1;
}

localStorage.setItem("cart", JSON.stringify(cart));

loadCart();

}


/* ===============================
REMOVE ITEM
=============================== */

function removeItem(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(!cart[index]) return;

cart.splice(index,1);

localStorage.setItem("cart", JSON.stringify(cart));

loadCart();

}


/* ===============================
CLEAR CART
=============================== */

function clearCart(){

localStorage.removeItem("cart");

updateCartCount();
loadCart();

}


/* ===============================
CHECKOUT BUTTON
=============================== */

function goToCheckout(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length === 0){

alert("Your bag is empty");

return;

}

window.location.href = "checkout.html";

}


/* ===============================
NAVBAR CART COUNT
=============================== */

function updateCartCount(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let count = cart.reduce((sum,item)=> sum + Number(item.quantity || 1),0);

let badge = document.getElementById("cartCount");

if(badge){
badge.innerText = count;
}

}


/* ===============================
INIT
=============================== */

document.addEventListener("DOMContentLoaded",function(){

loadCart();

});
