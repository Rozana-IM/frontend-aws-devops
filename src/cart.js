function loadCart(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let container = document.getElementById("cartItems");

container.innerHTML="";

let total = 0;

cart.forEach((item,index)=>{

total += item.price * item.quantity;

container.innerHTML += `

<div class="cart-item">

<img src="${item.image}" width="100">

<div>

<h3>${item.name}</h3>

<p>₹${item.price}</p>

<div class="qty-box">

<button onclick="decreaseQty(${index})">-</button>

<span>${item.quantity}</span>

<button onclick="increaseQty(${index})">+</button>

</div>

<button onclick="removeItem(${index})">Remove</button>

</div>

</div>

`;

});

document.getElementById("cartTotal").innerText =
"Total: ₹"+total;

}

function increaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart[index].quantity += 1;

localStorage.setItem("cart", JSON.stringify(cart));

loadCart();

}

function decreaseQty(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart[index].quantity > 1){
cart[index].quantity -= 1;
}

localStorage.setItem("cart", JSON.stringify(cart));

loadCart();

}

function removeItem(index){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart.splice(index,1);

localStorage.setItem("cart", JSON.stringify(cart));

loadCart();

}

function checkout(){

window.location="checkout.html"

}

loadCart();

function goToCheckout(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length === 0){
alert("Your bag is empty");
return;
}

window.location = "checkout.html";

}
