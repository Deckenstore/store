// ✅ URL se product ID nikalo
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// ✅ Product data (tumhare products ke liye fake reviews add kiye)
const products = {
  cap: {
    title: "Cool Cap",
    price: 150,
    image: "images/cap.jpg",
    desc: "A stylish cap for all seasons.",
    reviews: [
      { name: "Rahul", text: "Great quality! Loved the design." },
      { name: "Neha", text: "Comfortable and worth the price." }
    ]
  },
  mug: {
    title: "Coffee Mug",
    price: 180,
    image: "images/mug.jpg",
    desc: "Premium ceramic mug for your coffee moments.",
    reviews: [
      { name: "Amit", text: "Keeps coffee hot for long time!" },
      { name: "Priya", text: "Very cute mug, perfect for gifting." }
    ]
  }
  // ✅ baaki products bhi isi format me add karenge
};

const product = products[productId];

// ✅ Product info show
document.getElementById("product-title").textContent = product.title;
document.getElementById("product-price").textContent = "₹" + product.price;
document.getElementById("product-image").src = product.image;
document.getElementById("product-description").textContent = product.desc;

// ✅ Add review
function addReview() {
  const name = document.getElementById("reviewerName").value;
  const text = document.getElementById("reviewText").value;

  if (name && text) {
    let userReviews = JSON.parse(localStorage.getItem(productId + "_reviews")) || [];
    userReviews.push({ name, text });
    localStorage.setItem(productId + "_reviews", JSON.stringify(userReviews));
    displayReviews();
    document.getElementById("reviewerName").value = "";
    document.getElementById("reviewText").value = "";
  } else {
    alert("⚠️ Please enter your name and review!");
  }
}

// ✅ Show reviews (Default + User)
function displayReviews() {
  let defaultReviews = product.reviews;
  let userReviews = JSON.parse(localStorage.getItem(productId + "_reviews")) || [];
  let allReviews = [...defaultReviews, ...userReviews];

  let reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  allReviews.forEach(r => {
    let div = document.createElement("div");
    div.classList.add("review-item");
    div.innerHTML = `<strong>${r.name}</strong>: ${r.text}`;
    reviewList.appendChild(div);
  });
}

displayReviews();