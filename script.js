// ✅ TELEGRAM DETAILS
const TELEGRAM_BOT_TOKEN = "7942211815:AAGo9GylL7zO_SUWWkqJn1AFH40DO-Q0cqY";
const TELEGRAM_CHAT_ID = "-4891793325";

// ✅ CART & ORDER DATA
let cart = [];
let orders = [];
let bannerIndex = 0;
let bannerInterval;

/* -------------------- 📌 PAGE LOAD -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  loadOrders();

  // ✅ Dark Mode Status Load
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    const darkBtn = document.getElementById("darkModeBtn");
    if (darkBtn) darkBtn.textContent = "☀ Disable Dark Mode";
  }

  // ✅ Start Banner Slider
  startBannerSlider();
});

/* -------------------- 📦 LOCAL STORAGE -------------------- */
function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    cart = [];
  }
  updateCartUI();
  updateCartCount();
}

function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.error("LocalStorage Error:", e);
  }
}

function loadOrders() {
  try {
    orders = JSON.parse(localStorage.getItem("orders")) || [];
  } catch {
    orders = [];
  }
  updateOrdersUI();
}

function saveOrders() {
  try {
    localStorage.setItem("orders", JSON.stringify(orders));
  } catch (e) {
    console.error("LocalStorage Error:", e);
  }
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
  const countEl = document.querySelector(".cart-count");
  if (!countEl) return;
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  countEl.innerText = count;
  countEl.style.display = count > 0 ? "block" : "none";
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;

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

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.innerText = "Total: ₹" + total;
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
  const checkout = document.getElementById("checkout-section");
  if (checkout) checkout.style.display = "block";
}

function closeCheckout() {
  const checkout = document.getElementById("checkout-section");
  if (checkout) checkout.style.display = "none";
}

async function placeOrder() {
  const nameEl = document.getElementById("name");
  const addressEl = document.getElementById("address");
  const phoneEl = document.getElementById("phone");
  if (!nameEl || !addressEl || !phoneEl) return;

  const name = nameEl.value.trim();
  const address = addressEl.value.trim();
  const phone = phoneEl.value.trim();

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
  const input = document.querySelector(".search-box input");
  if (!input) return;

  const query = input.value.toLowerCase();
  document.querySelectorAll(".product-card").forEach((product) => {
    const name = product.querySelector("h3").innerText.toLowerCase();
    product.style.display = name.includes(query) ? "block" : "none";
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
  const cartSection = document.getElementById("cart-section");
  if (cartSection) cartSection.style.display = "block";
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
    if (btn) btn.textContent = "☀ Disable Dark Mode";
    showToast("🌙 Dark Mode ON");
  } else {
    localStorage.setItem("theme", "light");
    if (btn) btn.textContent = "🌙 Enable Dark Mode";
    showToast("☀ Light Mode OFF");
  }
}

/* -------------------- 📲 MENU BUTTONS -------------------- */
function goHome() {
  closePanel();
  toggleMenu();
  const hero = document.getElementById("hero");
  if (hero) hero.scrollIntoView({ behavior: "smooth" });
}

function showAllProducts() {
  closePanel();
  toggleMenu();
  const products = document.getElementById("products");
  if (products) products.scrollIntoView({ behavior: "smooth" });
}

function showBestSellers() {
  closePanel();
  toggleMenu();
  const best = document.getElementById("bestsellers");
  if (best) best.scrollIntoView({ behavior: "smooth" });
}

function showContact() {
  closePanel();
  toggleMenu();
  const contact = document.getElementById("contact");
  if (contact) contact.scrollIntoView({ behavior: "smooth" });
}

function showSettings() {
  closePanel();
  toggleMenu();
  const settings = document.getElementById("settings-section");
  if (settings) settings.style.display = "block";
}

/* -------------------- 🔔 TOAST NOTIFICATION -------------------- */
function showToast(msg) {
  document.querySelectorAll(".toast").forEach(t => t.remove()); // ✅ Old toasts clear
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

/* -------------------- 🎞 FIXED BANNER SLIDER -------------------- */
function startBannerSlider() {
  // ✅ Old interval clear before setting a new one
  if (bannerInterval) clearInterval(bannerInterval);

  const slides = document.querySelector(".banner-slider .slides");
  const dots = document.querySelectorAll(".dots span");
  if (!slides || dots.length === 0) return;

  const totalSlides = slides.children.length;

  function showSlide(index) {
    bannerIndex = (index + totalSlides) % totalSlides;
    slides.style.transition = "transform 0.5s ease";
    slides.style.transform = `translateX(-${bannerIndex * 100}%)`;

    dots.forEach(dot => dot.classList.remove("active"));
    dots[bannerIndex].classList.add("active");
  }

  function nextSlide() {
    showSlide(bannerIndex + 1);
  }

  // ✅ Auto Slide Start
  bannerInterval = setInterval(nextSlide, 4000);

  // ✅ Prev/Next Buttons
  window.changeSlide = function (step) {
    showSlide(bannerIndex + step);
    resetAutoSlide();
  };

  // ✅ Dots Click
  window.currentSlide = function (index) {
    showSlide(index);
    resetAutoSlide();
  };

  // ✅ Pause on hover
  const banner = document.querySelector(".banner-slider");
  if (banner) {
    banner.addEventListener("mouseenter", () => clearInterval(bannerInterval));
    banner.addEventListener("mouseleave", () => resetAutoSlide());
  }

  function resetAutoSlide() {
    clearInterval(bannerInterval);
    bannerInterval = setInterval(nextSlide, 4000);
  }

  // ✅ Start from first slide
  showSlide(0);
}
