const API = "https://api.rozana-projects.online";

/* ===============================
LOAD WISHLIST
=============================== */

async function loadWishlist(){

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

let container = document.getElementById("wishlistItems");

if(!container) return;

// ✅ Loading state
if(container.innerHTML === "") {
  container.innerHTML = "<p>Loading wishlist...</p>";
}
if(list.length === 0){
container.innerHTML = "<p>Your wishlist is empty ❤️</p>";
return;
}

let html = "";

try {

  const requests = list.map(id => 
    apiRequest(`${API}/products/${Number(id)}`)
  );

  const products = await Promise.all(requests);

  products.forEach(product => {

    if(!product || product.error) return;

    html += `
      <div class="wishlist-card">

        <img src="${product.image_url || 'https://cdn.rozana-projects.online/placeholder.png'}"
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
  });

  // ✅ handle all failed case
  if (!html) {
    container.innerHTML = "<p>Failed to load wishlist items.</p>";
    return;
  }

} catch(err){
  console.error("Wishlist product load error:", err);
  container.innerHTML = "<p>Error loading wishlist</p>";
  return;
}

container.innerHTML = html;
}

/* ===============================
REMOVE FROM WISHLIST
=============================== */

function removeWishlist(id){

let list = JSON.parse(localStorage.getItem("wishlist")) || [];

list = list.filter(p => Number(p) !== Number(id));
  
localStorage.setItem("wishlist", JSON.stringify(list));

loadWishlist();

}


/* ===============================
ADD TO CART FROM WISHLIST
=============================== */

async function addToCartFromWishlist(id){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  try{

    let product = await apiRequest(`${API}/products/${id}`);

    if(!product || product.error){
      alert("Failed to load product");
      return;
    }

let existing = cart.find(p => Number(p.id) === Number(id));
    if(existing){
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image_url,
        quantity: 1
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    if(typeof updateCartCount === "function"){
      updateCartCount();
    }

    alert("Added to Bag 👜");

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
