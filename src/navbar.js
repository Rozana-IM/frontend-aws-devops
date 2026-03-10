/* ---------------- MENU ---------------- */

function openMenu(){
const menu = document.getElementById("sideMenu")
if(menu) menu.classList.toggle("open")
}

/* ---------------- SEARCH ---------------- */

function openSearch(){
window.location="search.html"
}

/* ---------------- BAG ---------------- */

function openBag(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length === 0){
alert("Bag is empty");
return;
}

document.getElementById("cartDrawer").classList.add("open");

loadCartDrawer();

}

/* ---------------- INITIALIZE NAVBAR ---------------- */

function initNavbar(){

const profileMenu = document.getElementById("profileMenu")
if(!profileMenu) return

const dropdown = profileMenu.querySelector(".profile-dropdown")

/* PROFILE DROPDOWN */

profileMenu.addEventListener("click", function(e){

e.stopPropagation()
dropdown.classList.toggle("open")

})

document.addEventListener("click", function(e){

if(!profileMenu.contains(e.target)){
dropdown.classList.remove("open")
}

})


/* ---------------- USER LOGIN STATE ---------------- */

const user = JSON.parse(localStorage.getItem("user"))

const welcome = document.getElementById("welcomeText")
const loginBtn = document.getElementById("loginBtn")
const subText = document.getElementById("loginText")
const logoutBtn = document.getElementById("logoutBtn")

if(user){

if(welcome){
welcome.innerText = `Hello, ${user.name} 👋`
}

if(subText){
subText.innerText = "Explore the LUCCI collections"
}

if(loginBtn){
loginBtn.style.display = "none"
}

if(logoutBtn){
logoutBtn.style.display = "block"
}

}


/* ---------------- LOGOUT BUTTON ---------------- */

if(logoutBtn){
logoutBtn.addEventListener("click", function(e){

e.preventDefault()

localStorage.removeItem("user")
localStorage.removeItem("token")

alert("Logged out successfully")

window.location = "index.html"

})
}


/* ---------------- NAVBAR SHADOW ---------------- */

const nav = document.querySelector(".top-nav")

window.addEventListener("scroll", () => {

if(window.scrollY > 50){
nav.classList.add("nav-scroll")
}else{
nav.classList.remove("nav-scroll")
}

})

/* ---------------- CART COUNT ---------------- */

updateCartCount()

}


/* ---------------- PROFILE PAGE NAVIGATION ---------------- */

function goPage(page){

if(page==="cart"){
window.location="cart.html"
}

if(page==="wishlist"){
window.location="wishlist.html"
}

if(page==="orders"){
window.location="orders.html"
}

if(page==="products"){
window.location="products.html"
}

if(page==="contact"){
window.location="contactus.html"
}

}


/* ---------------- CART COUNTER ---------------- */

function updateCartCount(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let count = 0

cart.forEach(item=>{
count += Number(item.quantity) || 1
})

let badge = document.getElementById("cartCount")

if(!badge) return

if(count > 0){

badge.style.display="block"
badge.innerText = count

}
else{

badge.style.display="none"

}

}


/* ---------------- AUTO SYNC CART ---------------- */

window.addEventListener("storage", function(e){

if(e.key === "cart"){
updateCartCount()
}

})


/* ---------------- PAGE LOAD SYNC ---------------- */

document.addEventListener("DOMContentLoaded", function(){

updateCartCount()

})


/* ---------------- GLOBAL LOGOUT SAFETY ---------------- */

document.addEventListener("click", function(e){

if(e.target && e.target.id === "logoutBtn"){

localStorage.removeItem("user")
localStorage.removeItem("token")

alert("Logged out successfully")

window.location = "index.html"

}

})
