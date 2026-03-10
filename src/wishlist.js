const API = "https://api.rozana-projects.online";

async function loadWishlist(){

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

let container = document.getElementById("wishlistItems");

container.innerHTML = "";

if(list.length === 0){

container.innerHTML = "<p>Your wishlist is empty ❤️</p>";

return;

}

for(let id of list){

let res = await fetch(`${API}/products/${id}`);

let product = await res.json();

container.innerHTML += `

<div class="wishlist-card">

<img src="${product.image_url}">

<h3>${product.name}</h3>

<p>₹${product.price}</p>

<button onclick="addToCartFromWishlist(${product.id})">
Add To Bag
</button>

<button onclick="removeWishlist(${product.id})">
Remove
</button>

</div>

`;

}

}

function removeWishlist(id){

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

list = list.filter(p => p != id);

localStorage.setItem("wishlist", JSON.stringify(list));

loadWishlist();

}

function addToCartFromWishlist(id){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

fetch(`${API}/products/${id}`)
.then(res => res.json())
.then(product => {

let existing = cart.find(p => p.id == id);

if(existing){
existing.quantity += 1;
}
else{

cart.push({
id:product.id,
name:product.name,
price:product.price,
image:product.image_url,
quantity:1
})

}

localStorage.setItem("cart",JSON.stringify(cart));

alert("Added to Bag 👜");

})

}

loadWishlist();
