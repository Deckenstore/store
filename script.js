// ✅ TELEGRAM DETAILS
const TELEGRAM_BOT_TOKEN = "7942211815:AAGo9GylL7zO_SUWWkqJn1AFH40DO-Q0cqY";
const TELEGRAM_CHAT_ID = "-4891793325";

// ✅ CART & ORDER DATA
let cart = [];
let orders = [];

/* -------------------- 📌 PAGE LOAD -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  loadOrders();

  // ✅ Dark Mode Status Load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeBtn").textContent = "☀ Disable Dark Mode";
  }
});

/* -------------------- 📦 LOCAL STORAGE -------------------- */
function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartUI();
  updateCartCount();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadOrders() {
  orders = JSON.parse(localStorage.getItem("orders")) || [];
  updateOrdersUI();
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

/* -------------------- 🛍 CART SYSTEM -------------------- */
function addToCart(productName, price) {
  let item = cart.find((i) => i.name === productName);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name: productName, price: price, qty: 1 });
  }
  saveCart();
  updateCartUI();
  updateCartCount();
  showToast(`✅ ${productName} added to cart`);
}

function updateCartCount() {
  document.querySelector(".cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <p><b>${item.name}</b> - ₹${item.price} x ${item.qty}
        <button onclick="changeQty(${index}, 1)">➕</button>
        <button onclick="changeQty(${index}, -1)">➖</button>
        <button onclick="removeFromCart(${index})">❌</button>
      </p>
    `;
    cartItems.appendChild(div);
  });

  document.getElementById("cart-total").innerText = "Total: ₹" + total;
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
  updateCartUI();
  updateCartCount();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
  updateCartCount();
}

/* -------------------- 🛒 CHECKOUT -------------------- */
function openCheckout() {
  if (cart.length === 0) return alert("⚠️ Your cart is empty!");
  closePanel();
  document.getElementById("checkout-section").style.display = "block";
}

function closeCheckout() {
  document.getElementById("checkout-section").style.display = "none";
}

async function placeOrder() {
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !address || !phone) return alert("⚠️ Please fill all fields!");
  if (!/^[0-9]{10}$/.test(phone)) return alert("📞 Enter a valid 10-digit phone!");

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
  saveOrders();

  // ✅ Send to Telegram
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

  // ✅ Reset cart after order
  cart = [];
  saveCart();
  updateCartUI();
  updateCartCount();
  updateOrdersUI();

  showToast("🎉 Order Placed Successfully!");
  closeCheckout();
  closePanel();
}

/* -------------------- 📦 ORDERS -------------------- */
function updateOrdersUI() {
  const ordersList = document.getElementById("orders-list");
  if (!ordersList) return;

  ordersList.innerHTML = "";
  if (orders.length === 0) {
    ordersList.innerHTML = "<p>No orders placed yet!</p>";
    return;
  }

  orders.forEach((order) => {
    const div = document.createElement("div");
    div.classList.add("order-item");
    div.innerHTML = `
      <p><b>🆔 Order ID:</b> ${order.id}</p>
      <p><b>👤 Name:</b> ${order.name}</p>
      <p><b>📦 Items:</b> ${order.items.map((i) => `${i.name} (${i.qty})`).join(", ")}</p>
      <p><b>📍 Address:</b> ${order.address}</p>
      <p><b>📞 Phone:</b> ${order.phone}</p>
      <p><b>💰 Total:</b> ₹${order.total}</p>
      <p><b>⏰ Date:</b> ${order.date}</p><hr>
    `;
    ordersList.appendChild(div);
  });
}

/* -------------------- 🔍 SEARCH & FILTER -------------------- */
function searchProducts() {
  const input = document.querySelector(".search-box input").value.toLowerCase();
  document.querySelectorAll(".product-card").forEach((product) => {
    const name = product.querySelector("h3").innerText.toLowerCase();
    product.style.display = name.includes(input) ? "block" : "none";
  });
}

function filterCategory(category) {
  document.querySelectorAll(".product-card").forEach((product) => {
    product.style.display =
      category === "all" || product.dataset.category === category ? "block" : "none";
  });
}

/* -------------------- 🎛 MENU & PANELS -------------------- */
function toggleMenu() {
  document.getElementById("side-menu").classList.toggle("active");
  document.getElementById("menu-backdrop").classList.toggle("active");
}

function toggleCart() {
  closePanel();
  document.getElementById("cart-section").style.display = "block";
}

function closePanel() {
  document.querySelectorAll(".popup-section").forEach((p) => (p.style.display = "none"));
}

/* -------------------- 🌙 DARK MODE -------------------- */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  let btn = document.getElementById("darkModeBtn");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    btn.textContent = "☀ Disable Dark Mode";
    showToast("🌙 Dark Mode ON");
  } else {
    localStorage.setItem("theme", "light");
    btn.textContent = "🌙 Enable Dark Mode";
    showToast("☀ Light Mode OFF");
  }
}

/* -------------------- 📲 MENU BUTTONS -------------------- */
function goHome() {
  closePanel();
  toggleMenu();
  document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
}

function showAllProducts() {
  closePanel();
  toggleMenu();
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

function showBestSellers() {
  closePanel();
  toggleMenu();
  document.getElementById("bestsellers").scrollIntoView({ behavior: "smooth" });
}

function showContact() {
  closePanel();
  toggleMenu();
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
}

function showSettings() {
  closePanel();
  toggleMenu();
  document.getElementById("settings-section").style.display = "block";
}

/* -------------------- 🔔 TOAST NOTIFICATION -------------------- */
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