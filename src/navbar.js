/* ================= MENU ================= */

function openMenu(){
const menu = document.getElementById("sideMenu");
if(menu){
menu.classList.toggle("open");
}
}


/* ================= SEARCH ================= */

function openSearch(){
window.location = "search.html";
}


/* ================= BAG / CART DRAWER ================= */

function openBag(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length === 0){
alert("Your bag is empty");
return;
}

const drawer = document.getElementById("cartDrawer");

if(drawer){
drawer.classList.add("open");
loadCartDrawer();
}

}


/* ================= CLOSE CART ================= */

function closeCart(){
const drawer = document.getElementById("cartDrawer");
if(drawer){
drawer.classList.remove("open");
}
}


/* ================= INITIALIZE NAVBAR ================= */
function initNavbar() {

  /* ================= PAGE DETECTION ================= */

  const path = window.location.pathname;
  const currentPage = path.split("/").pop();

  const backBtn = document.getElementById("navBack");
  const contactLink = document.getElementById("contactLink");

  const showContactPages = ["index.html", "products.html"];

  if (showContactPages.includes(currentPage)) {
    if(backBtn) backBtn.style.display = "none";
    if(contactLink) contactLink.style.display = "inline";
  } else {
    if(backBtn) backBtn.style.display = "inline";
    if(contactLink) contactLink.style.display = "none";
  }

  /* ================= BACK BUTTON ================= */

  if(backBtn){
    backBtn.onclick = () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location = "index.html";
      }
    };
  }

  /* ================= PROFILE DROPDOWN ================= */

  const profileMenu = document.getElementById("profileMenu");

  if(profileMenu){

    const dropdown = profileMenu.querySelector(".profile-dropdown");

    profileMenu.addEventListener("click", function(e){
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });

    document.addEventListener("click", function(e){
      if(!profileMenu.contains(e.target)){
        dropdown.classList.remove("open");
      }
    });
  }

  /* ================= USER LOGIN STATE ================= */

  const user = JSON.parse(localStorage.getItem("user"));

  const welcome = document.getElementById("welcomeText");
  const loginBtn = document.getElementById("loginBtn");
  const subText = document.getElementById("loginText");
  const logoutBtn = document.getElementById("logoutBtn");

  if(user){

    if(welcome){
      welcome.innerText = `Hello, ${user.name} 👋`;
    }

    if(subText){
      subText.innerText = "Explore the LUCCI collections";
    }

    if(loginBtn){
      loginBtn.style.display = "none";
    }

    if(logoutBtn){
      logoutBtn.style.display = "block";
    }
  }

  /* ================= LOGOUT ================= */

  if(logoutBtn){
    logoutBtn.addEventListener("click", function(e){
      e.preventDefault();
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert("Logged out successfully");
      window.location = "index.html";
    });
  }

  /* ================= NAVBAR SCROLL ================= */

  const nav = document.querySelector(".top-nav");

  window.addEventListener("scroll", () => {
    if(!nav) return;

    if(window.scrollY > 50){
      nav.classList.add("nav-scroll");
    } else {
      nav.classList.remove("nav-scroll");
    }
  });

  /* ================= CART COUNT ================= */

  updateCartCount();
}
/* ================= PAGE NAVIGATION ================= */

function goPage(page){

if(page === "cart"){
window.location = "cart.html";
}

if(page === "wishlist"){
window.location = "wishlist.html";
}

if(page === "orders"){
window.location = "orders.html";
}

if(page === "products"){
window.location = "products.html";
}

if(page === "contact"){
window.location = "contactus.html";
}

}


/* ================= CART COUNTER ================= */

function updateCartCount(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let count = 0;

cart.forEach(item => {
count += Number(item.quantity) || 1;
});

let badge = document.getElementById("cartCount");

if(!badge) return;

if(count > 0){

badge.style.display = "block";
badge.innerText = count;

}
else{

badge.style.display = "none";

}

}


/* ================= AUTO SYNC CART ================= */

window.addEventListener("storage", function(e){

if(e.key === "cart"){
updateCartCount();
}

});


/* ================= PAGE LOAD SYNC ================= */

document.addEventListener("DOMContentLoaded", function(){

updateCartCount();

});


/* ================= LOAD CART DRAWER ================= */

function loadCartDrawer(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let container = document.getElementById("drawerItems");

if(!container) return;

container.innerHTML = "";

let total = 0;

cart.forEach(item => {

let price = Number(item.price) || 0;
let qty = Number(item.quantity) || 1;

total += price * qty;

container.innerHTML += `

<div class="drawer-item">

<img src="${item.image}" width="60">

<div>

<p>${item.name}</p>
<p>₹${price}</p>
<p>Qty: ${qty}</p>

</div>

</div>

`;

});

let totalBox = document.getElementById("drawerTotal");

if(totalBox){
totalBox.innerText = "Total: ₹" + total;
}

}


/* ================= GO TO CART ================= */

function goToCart(){

window.location = "cart.html";

}


/* ================= GO TO CHECKOUT ================= */

function goCheckout(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length === 0){

alert("Your bag is empty");
return;

}

window.location = "checkout.html";

}
