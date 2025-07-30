// ✅ TELEGRAM DETAILS
const TELEGRAM_BOT_TOKEN = "7942211815:AAGo9GylL7zO_SUWWkqJn1AFH40DO-Q0cqY";
const TELEGRAM_CHAT_ID = "-4891793325";

// ✅ MENU TOGGLE FUNCTION
function toggleMenu() {
  const menu = document.getElementById("side-menu");
  const backdrop = document.getElementById("menu-backdrop");
  const isOpen = menu.style.left === "0px";

  menu.style.left = isOpen ? "-270px" : "0px";
  backdrop.style.display = isOpen ? "none" : "block";
}

// ✅ POPUP PANELS
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
  document.querySelectorAll(".popup-section").forEach((p) => (p.style.display = "none"));
}

// ✅ SEARCH PRODUCTS
function searchProducts() {
  const input = document.querySelector(".search-box input").value.toLowerCase();
  document.querySelectorAll(".product-card").forEach((product) => {
    const name = product.querySelector("h3").innerText.toLowerCase();
    product.style.display = name.includes(input) ? "block" : "none";
  });
}

// ✅ FILTER PRODUCTS
function filterCategory(category) {
  document.querySelectorAll(".product-card").forEach((product) => {
    product.style.display =
      category === "all" || product.dataset.category === category ? "block" : "none";
  });
  toggleMenu();
}

// ✅ SMOOTH SCROLL
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  toggleMenu();
}

// ✅ CART SYSTEM (with Quantity)
let cart = [];
let orders = [];

function addToCart(productName, price) {
  let item = cart.find((i) => i.name === productName);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name: productName, price: price, qty: 1 });
  }
  document.querySelector(".cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
  updateCartUI();
  showToast(`✅ ${productName} added to cart`);
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    let itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item");
    itemDiv.innerHTML = `
      <p>🛍 <b>${item.name}</b> - ₹${item.price} x ${item.qty} 
        <button onclick="changeQty(${index}, 1)">➕</button>
        <button onclick="changeQty(${index}, -1)">➖</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">❌</button>
      </p>`;
    cartItems.appendChild(itemDiv);
  });

  document.getElementById("cart-total").innerText = "Total: ₹" + total;
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  document.querySelector(".cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  document.querySelector(".cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
  updateCartUI();
}

// ✅ DARK MODE
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  document.getElementById("darkModeBtn").innerText = document.body.classList.contains("dark-mode")
    ? "☀️ Disable Dark Mode"
    : "🌙 Enable Dark Mode";
}

// ✅ HERO SLIDER
let currentSlide = 0;
const slides = document.querySelectorAll(".slides img");

function showSlide(index) {
  slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

setInterval(nextSlide, 4000);
showSlide(currentSlide);

// ✅ CHECKOUT
function openCheckout() {
  if (cart.length === 0) return alert("Your cart is empty!");
  closePanel();
  document.getElementById("checkout-section").style.display = "block";
}

function closeCheckout() {
  document.getElementById("checkout-section").style.display = "none";
}

// ✅ PLACE ORDER (Send to Telegram)
async function placeOrder() {
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;

  if (!name || !address || !phone) return alert("⚠️ Please fill all fields!");

  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const newOrder = {
    id: Date.now(),
    items: [...cart],
    name,
    address,
    phone,
    total,
    date: new Date().toLocaleString(),
  };

  orders.push(newOrder);

  let message = `🛍 *New Order Received!*\n\n👤 Name: ${name}\n📍 Address: ${address}\n📞 Phone: ${phone}\n\n📦 *Items Ordered:*\n`;
  newOrder.items.forEach((item, i) => {
    message += `${i + 1}. ${item.name} - ₹${item.price} x ${item.qty}\n`;
  });
  message += `\n💰 *Total: ₹${total}*\n⏰ Date: ${newOrder.date}`;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" }),
    });
  } catch (e) {
    console.error("Telegram API Error:", e);
  }

  // Reset cart & update UI
  cart = [];
  document.querySelector(".cart-count").innerText = "0";
  updateCartUI();
  updateOrdersUI();

  showToast("🎉 Order Placed Successfully!");
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

  orders.forEach((order) => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-item");
    orderDiv.innerHTML = `
      <p><b>🆔 Order ID:</b> ${order.id}</p>
      <p><b>👤 Name:</b> ${order.name}</p>
      <p><b>📦 Items:</b> ${order.items.map((i) => `${i.name} (${i.qty})`).join(", ")}</p>
      <p><b>📍 Address:</b> ${order.address}</p>
      <p><b>📞 Phone:</b> ${order.phone}</p>
      <p><b>💰 Total:</b> ₹${order.total}</p>
      <p><b>⏰ Date:</b> ${order.date}</p><hr>
    `;
    ordersList.appendChild(orderDiv);
  });
}

// ✅ NEWSLETTER
function sendSubscription() {
  const email = document.getElementById("subscriberEmail").value;
  if (!email) return alert("⚠️ Please enter your email first!");

  const myEmail = "thedeckenstore@gmail.com";
  const subject = "New Subscription for The Decken Store";
  const body = `Hello,\n\nA new user subscribed for offers.\n\n📩 Email: ${email}\n\nThank You!`;
  window.location.href = `mailto:${myEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ✅ TOAST (Success Notification)
function showToast(msg) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = msg;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
