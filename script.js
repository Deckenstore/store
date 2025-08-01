// ✅ TELEGRAM DETAILS
const TELEGRAM_BOT_TOKEN = "7942211815:AAGo9GylL7zO_SUWWkqJn1AFH40DO-Q0cqY";
const TELEGRAM_CHAT_ID = "-4891793325";

// ✅ CART & ORDER DATA
let cart = [];
let orders = [];

// ✅ LOAD CART & ORDERS FROM LOCALSTORAGE
function loadCart() {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartUI();
  updateCartCount();
}

function loadOrders() {
  orders = JSON.parse(localStorage.getItem("orders")) || [];
  updateOrdersUI();
}

// ✅ SAVE CART & ORDERS TO LOCALSTORAGE
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

// ✅ UPDATE CART COUNT BADGE
function updateCartCount() {
  document.querySelector(".cart-count").innerText = cart.reduce((sum, i) => sum + i.qty, 0);
}

// ✅ PAGE LOAD PAR CART & ORDERS LOAD
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
  loadOrders();
});

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

// ✅ CART SYSTEM (with Quantity)
function addToCart(productName, price) {
  let item = cart.find((i) => i.name === productName);
  if (item) {
    item.qty++;
  } else {
    cart.push({ name: productName, price: price, qty: 1 });
  }
  updateCartUI();
  updateCartCount();
  saveCart();
  showToast(`✅ ${productName} added to cart`);
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  if (!cartItems) return;

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
  updateCartUI();
  updateCartCount();
  saveCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
  updateCartCount();
  saveCart();
}

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
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !address || !phone) return alert("⚠️ Please fill all fields!");
  if (!/^[0-9]{10}$/.test(phone)) return alert("📞 Please enter a valid 10-digit phone number!");

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

  // ✅ Telegram Send
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

// ✅ ORDERS UI
function updateOrdersUI() {
  const ordersList = document.getElementById("orders-list");
  if (!ordersList) return;

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
