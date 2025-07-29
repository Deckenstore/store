// ✅ TELEGRAM DETAILS
const TELEGRAM_BOT_TOKEN = "7942211815:AAGo9GylL7zO_SUWWkqJn1AFH40DO-Q0cqY"; 
const TELEGRAM_CHAT_ID = "-4891793325"; 

// ✅ MENU TOGGLE FUNCTION
function toggleMenu() {
    const menu = document.getElementById("side-menu");
    const backdrop = document.getElementById("menu-backdrop");

    if (menu.style.left === "0px") {
        menu.style.left = "-270px";
        backdrop.style.display = "none";
    } else {
        menu.style.left = "0px";
        backdrop.style.display = "block";
    }
}

// ✅ POPUP PANELS (Cart / Orders / Settings)
function toggleCart() {
    closePanel();
    document.getElementById("cart-section").style.display = "block";
}

function showOrders() {
    closePanel();
    document.getElementById("orders-section").style.display = "block";
    toggleMenu();
}

function showSettings() {
    closePanel();
    document.getElementById("settings-section").style.display = "block";
    toggleMenu();
}

// ✅ CLOSE ALL POPUPS
function closePanel() {
    document.querySelectorAll(".popup-section").forEach(p => p.style.display = "none");
}

// ✅ SEARCH PRODUCTS
function searchProducts() {
    const input = document.querySelector(".search-box input").value.toLowerCase();
    const products = document.querySelectorAll(".product-card");
    products.forEach(product => {
        const name = product.querySelector("h3").innerText.toLowerCase();
        product.style.display = name.includes(input) ? "block" : "none";
    });
}

// ✅ FILTER PRODUCTS
function filterCategory(category) {
    const products = document.querySelectorAll(".product-card");
    products.forEach(product => {
        product.style.display = (category === "all" || product.dataset.category === category) ? "block" : "none";
    });
    toggleMenu();
}

// ✅ SMOOTH SCROLL
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    toggleMenu();
}

// ✅ CART SYSTEM
let cart = [];
let orders = [];

function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    document.querySelector(".cart-count").innerText = cart.length;
    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        let itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");
        itemDiv.innerHTML = `
            <p>🛍 <b>${item.name}</b> - ₹${item.price} 
            <button class="remove-btn" onclick="removeFromCart(${index})">❌</button></p>
        `;
        cartItems.appendChild(itemDiv);
    });
    document.getElementById("cart-total").innerText = "Total: ₹" + total;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    document.querySelector(".cart-count").innerText = cart.length;
    updateCartUI();
}

// ✅ DARK MODE
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const btn = document.getElementById("darkModeBtn");
    btn.innerText = document.body.classList.contains("dark-mode") 
        ? "☀️ Disable Dark Mode" : "🌙 Enable Dark Mode";
}

// ✅ HERO SLIDER
let currentSlide = 0;
const slides = document.querySelectorAll(".slides img");
function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove("active");
        if (i === index) slide.classList.add("active");
    });
}
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}
setInterval(nextSlide, 4000);
showSlide(currentSlide);

// ✅ CHECKOUT
function openCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }
    closePanel();
    document.getElementById("checkout-section").style.display = "block";
}
function closeCheckout() {
    document.getElementById("checkout-section").style.display = "none";
}

// ✅ PLACE ORDER
function placeOrder() {
    const name = document.getElementById("name").value;
    const address = document.getElementById("address").value;
    const phone = document.getElementById("phone").value;

    if (!name || !address || !phone) {
        alert("⚠️ Please fill all fields!");
        return;
    }

    let total = cart.reduce((sum, item) => sum + item.price, 0);
    const newOrder = {
        id: Date.now(),
        items: [...cart],
        name,
        address,
        phone,
        total,
        date: new Date().toLocaleString()
    };

    orders.push(newOrder);

    let message = `🛍 *New Order Received!*\n\n` +
                  `👤 Name: ${name}\n` +
                  `📍 Address: ${address}\n` +
                  `📞 Phone: ${phone}\n\n📦 *Items Ordered:*\n`;
    newOrder.items.forEach((item, i) => {
        message += ` ${i+1}. ${item.name} - ₹${item.price}\n`;
    });
    message += `\n💰 *Total: ₹${total}*\n⏰ Date: ${newOrder.date}`;

    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        })
    });

    cart = [];
    document.querySelector(".cart-count").innerText = "0";
    updateCartUI();
    updateOrdersUI();

    alert("🎉 Order Placed Successfully!");
    closeCheckout();
    closePanel();
}

// ✅ ORDERS UI
function updateOrdersUI() {
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "";
    if (orders.length === 0) {
        ordersList.innerHTML = "<p>No orders placed yet!</p>";
        return;
    }
    orders.forEach(order => {
        const orderDiv = document.createElement("div");
        orderDiv.classList.add("order-item");
        orderDiv.innerHTML = `
            <p><b>🆔 Order ID:</b> ${order.id}</p>
            <p><b>👤 Name:</b> ${order.name}</p>
            <p><b>📦 Items:</b> ${order.items.map(i => i.name).join(", ")}</p>
            <p><b>📍 Address:</b> ${order.address}</p>
            <p><b>📞 Phone:</b> ${order.phone}</p>
            <p><b>💰 Total:</b> ₹${order.total}</p>
            <p><b>⏰ Date:</b> ${order.date}</p>
            <hr>
        `;
        ordersList.appendChild(orderDiv);
    });
}

// ✅ NEWSLETTER
function sendSubscription() {
    const email = document.getElementById("subscriberEmail").value;
    if (!email) {
        alert("⚠️ Please enter your email first!");
        return;
    }
    const myEmail = "thedeckenstore@gmail.com";
    const subject = "New Subscription for The Decken Store";
    const body = `Hello,\n\nA new user subscribed for offers.\n\n📩 Email: ${email}\n\nThank You!`;
    window.location.href = `mailto:${myEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/*  
   ✅ PRODUCT DETAILS PAGE REDIRECT + REVIEWS SYSTEM
*/

// जब भी product click हो -> details page खोले और info पास करे
function openProductDetail(name, price, image) {
    localStorage.setItem("selectedProduct", JSON.stringify({ name, price, image }));
    window.location.href = "product.html";
}

// ✅ Product Details Page Script (अगर हम product.html पर हैं)
if (window.location.pathname.includes("product.html")) {
    const product = JSON.parse(localStorage.getItem("selectedProduct"));

    if (product) {
        document.getElementById("product-image").src = product.image;
        document.getElementById("product-title").innerText = product.name;
        document.getElementById("product-price").innerText = `₹${product.price}`;
        document.getElementById("product-description").innerText = "This is a high-quality product from The Decken Store.";
    }

    // ✅ Load Reviews
    loadReviews();

    // ✅ Fake reviews add (only first time)
    if (!localStorage.getItem("fakeReviewsAdded")) {
        const fakeReviews = [
            { name: "Rahul", text: "Great quality product!", date: new Date().toLocaleString() },
            { name: "Neha", text: "Loved it! Fast delivery.", date: new Date().toLocaleString() },
            { name: "Amit", text: "Worth the price!", date: new Date().toLocaleString() }
        ];
        localStorage.setItem("productReviews", JSON.stringify(fakeReviews));
        localStorage.setItem("fakeReviewsAdded", "true");
    }
}

// ✅ Add Review Function
function addReview() {
    const name = document.getElementById("reviewerName").value;
    const text = document.getElementById("reviewText").value;
    if (!name || !text) {
        alert("⚠️ Please enter your name and review!");
        return;
    }

    let reviews = JSON.parse(localStorage.getItem("productReviews")) || [];
    reviews.push({ name, text, date: new Date().toLocaleString() });
    localStorage.setItem("productReviews", JSON.stringify(reviews));

    document.getElementById("reviewerName").value = "";
    document.getElementById("reviewText").value = "";

    loadReviews();
}

// ✅ Load Reviews Function
function loadReviews() {
    const reviewList = document.getElementById("review-list");
    if (!reviewList) return;

    reviewList.innerHTML = "";
    let reviews = JSON.parse(localStorage.getItem("productReviews")) || [];

    reviews.forEach(r => {
        let div = document.createElement("div");
        div.classList.add("review");
        div.innerHTML = `<p><b>${r.name}</b> (${r.date})</p><p>${r.text}</p><hr>`;
        reviewList.appendChild(div);
    });
}
