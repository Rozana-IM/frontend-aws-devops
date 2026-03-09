fetch("https://api.rozana-projects.online/products/category/men")
.then(res => res.json())
.then(data => {

const container = document.getElementById("products");

data.forEach(product => {

container.innerHTML += `
<div class="product-card">

<a href="product.html?id=${product.id}">

<img src="${product.image_url}">
<h3>${product.name}</h3>
<p>₹${product.price}</p>

</a>

</div>
`;

});

});
