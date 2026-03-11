const API = "https://api.rozana-projects.online";

/* ===============================
LOAD WISHLIST
=============================== */

async function loadWishlist(){

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

let container = document.getElementById("wishlistItems");

container.innerHTML = "";

if(list.length === 0){
container.innerHTML = "<p>Your wishlist is empty ❤️</p>";
return;
}

for(let id of list){

try{

let res = await fetch(`${API}/products/${id}`);

if(!res.ok) continue;

let product = await res.json();

container.innerHTML += `

<div class="wishlist-card">

<img src="${product.image_url}" 
onerror="this.src='https://cdn.rozana-projects.online/placeholder.png'">

<h3>${product.name}</h3>

<p>₹${product.price}</p>

<div class="wishlist-buttons">

<button onclick="addToCartFromWishlist(${product.id})">
Add To Bag
</button>

<button onclick="removeWishlist(${product.id})">
Remove
</button>

</div>

</div>

`;

}catch(err){

console.error("Wishlist product load error:",err);

}

}

}


/* ===============================
REMOVE FROM WISHLIST
=============================== */

function removeWishlist(id){

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

list = list.filter(p => p != id);

localStorage.setItem("wishlist", JSON.stringify(list));

loadWishlist();

}


/* ===============================
ADD TO CART FROM WISHLIST
=============================== */

async function addToCartFromWishlist(id){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

try{

let res = await fetch(`${API}/products/${id}`);

if(!res.ok){
alert("Failed to load product");
return;
}

let product = await res.json();

let existing = cart.find(p => p.id == id);

if(existing){

existing.quantity += 1;

}else{

cart.push({
id: product.id,
name: product.name,
price: Number(product.price),
image: product.image_url,
quantity: 1
});

}

localStorage.setItem("cart", JSON.stringify(cart));

/* update navbar cart counter */
if(typeof updateCartCount === "function"){
updateCartCount();
}

alert("Added to Bag 👜");

/* optional: remove from wishlist after adding to cart */
removeWishlist(id);

}catch(err){

console.error("Add to cart error:",err);

alert("Something went wrong");

}

}


/* ===============================
INIT
=============================== */

loadWishlist();
