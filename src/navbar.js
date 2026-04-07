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

  /* ===== PAGE DETECTION ===== */

  let currentPage = window.location.pathname.split("/").pop();

  if(!currentPage){
    currentPage = "index.html";
  }

  const showContactPages = ["index.html", "products.html"];

  const backBtn = document.getElementById("navBack");
  const contactLink = document.getElementById("contactLink");

  /* ===== SHOW/HIDE BACK + CONTACT ===== */

  if(showContactPages.includes(currentPage)){
    if(backBtn) backBtn.style.display = "none";
    if(contactLink) contactLink.style.display = "inline";
  } else {
    if(backBtn) backBtn.style.display = "inline";
    if(contactLink) contactLink.style.display = "none";
  }

  /* ===== BACK BUTTON (SMART) ===== */

 if(backBtn){
  backBtn.onclick = () => {

    // ✅ BLOCK SUCCESS PAGE LOOP
    if(localStorage.getItem("orderCompleted")){
      localStorage.removeItem("orderCompleted");
      window.location = "products.html";
      return;
    }

if (document.referrer && document.referrer.includes(window.location.origin)) {
  window.history.back();
} else {
  window.location = "products.html";
}
  };
}

  /* ===== PROFILE DROPDOWN ===== */

  const profileMenu = document.getElementById("profileMenu");

  if(profileMenu){

    const dropdown = profileMenu.querySelector(".profile-dropdown");

    profileMenu.onclick = function(e){
      e.stopPropagation();
      dropdown.classList.toggle("open");
    };

    document.addEventListener("click", function(e){
      if(!profileMenu.contains(e.target)){
        dropdown.classList.remove("open");
      }
    });
  }

  /* ===== USER STATE ===== */

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    user = null;
  }

  const welcome = document.getElementById("welcomeText");
  const loginBtn = document.getElementById("loginBtn");
  const subText = document.getElementById("loginText");
  const logoutBtn = document.getElementById("logoutBtn");

  if(user){

    if(welcome) welcome.innerText = `Hello, ${user.name} 👋`;
    if(subText) subText.innerText = "Explore the LUCCI collections";
    if(loginBtn) loginBtn.style.display = "none";
    if(logoutBtn) logoutBtn.style.display = "block";

  } else {

    if(loginBtn) loginBtn.style.display = "block";
    if(logoutBtn) logoutBtn.style.display = "none";
  }

  /* ===== LOGOUT ===== */

  if(logoutBtn){
    logoutBtn.onclick = function(e){
      e.preventDefault();

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      alert("Logged out successfully");

      window.location = "index.html";
    };
  }

  /* ===== NAVBAR SCROLL ===== */

  const nav = document.querySelector(".top-nav");

  if(nav && !window.navScrollAdded){

    window.addEventListener("scroll", () => {
      if(window.scrollY > 50){
        nav.classList.add("nav-scroll");
      } else {
        nav.classList.remove("nav-scroll");
      }
    });

    window.navScrollAdded = true;
  }

  /* ===== CART COUNT ===== */

  updateCartCount(); // 🔥 important fix
}


/* ================= PAGE NAVIGATION ================= */

function goPage(page){

  const routes = {
    cart: "cart.html",
    wishlist: "wishlist.html",
    orders: "orders.html",
    products: "products.html",
    contact: "contact.html" // 🔥 FIXED
  };

  if(routes[page]){
    window.location = routes[page];
  }
}


/* ================= CART COUNTER ================= */

function updateCartCount(){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  let count = cart.reduce((sum, item) => {
    return sum + Number(item.quantity || 1);
  }, 0);

  let badge = document.getElementById("cartCount");

  if(!badge) return;

  if(count > 0){
    badge.style.display = "block";
    badge.innerText = count;
  } else {
    badge.style.display = "none";
  }
}


/* ================= AUTO SYNC ================= */

window.addEventListener("storage", function(e){
  if(e.key === "cart"){
    updateCartCount();
  }
});


document.addEventListener("DOMContentLoaded", function(){
  updateCartCount();
});


/* ================= CART DRAWER ================= */

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


/* ================= NAVIGATION ================= */

function goToCart(){
  window.location = "cart.html";
}

function goCheckout(){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length === 0){
    alert("Your bag is empty");
    return;
  }

  window.location = "checkout.html";
}
