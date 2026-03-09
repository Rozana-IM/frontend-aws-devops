function openMenu(){
const menu = document.getElementById("sideMenu")
if(menu) menu.classList.toggle("open")
}

function openSearch(){
window.location="search.html"
}

function openBag(){

let cart = localStorage.getItem("cart")

if(!cart || cart==="[]"){
alert("Bag is empty")
}
else{
window.location="cart.html"
}

}

/* INITIALIZE NAVBAR */

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

/* USER LOGIN STATE */

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

/* NAVBAR SHADOW ON SCROLL */

const nav = document.querySelector(".top-nav")

window.addEventListener("scroll", () => {

if(window.scrollY > 50){
nav.classList.add("nav-scroll")
}else{
nav.classList.remove("nav-scroll")
}

})

}

/* LOGOUT */

document.addEventListener("click", function(e){

if(e.target && e.target.id === "logoutBtn"){

localStorage.removeItem("user")
localStorage.removeItem("token")

alert("Logged out successfully")

window.location = "index.html"

}

})
