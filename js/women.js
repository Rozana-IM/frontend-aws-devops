const API = "https://api.rozana-projects.online";

const params = new URLSearchParams(window.location.search);
const category = params.get("cat");

fetch(`${API}/products/category/${category}`)
.then(res => res.json())
.then(data => {

const container = document.getElementById("products");

container.innerHTML = "";

data.forEach(product => {

container.innerHTML += `
<div class="product-card">

<img src="${product.image_url}">

<h3>${product.name}</h3>

<p>₹${product.price}</p>

</div>
`;

});

})
.catch(err => {
console.error("Error loading products:", err);
});
