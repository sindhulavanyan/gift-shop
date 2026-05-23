// --- 1. PRODUCTS DATA ---
const PRODUCTS = [
    { id: 1, name: "LAEON Stainless Steel Tumbler", category: "Water Bottles", price: 900, image: "https://static-assets-prod.fnp.com/images/pr/l/v20251028180715/dual-tone-personalised-stainless-steel-tumbler_1.jpg" },
    { id: 2, name: "LAEON Stainless Steel Flask (Black colour)", category: "Water Bottles", price: 600, image: "https://www.thewalletstore.in/cdn/shop/products/bottle-02.jpg?v=1668669610&width=800" },
    { id: 3, name: "LAEON Stainless Steel Flask (Red & BLUE available)", category: "Water Bottles", price: 600, image: "https://static-assets-prod.fnp.com/images/pr/l/v20230728154424/personalised-led-temperature-bottle_1.jpg" },
    { id: 4, name: "LAEON Stainless steel Bottle", category: "Water Bottles", price: 500, image: "https://i0.wp.com/unlimitedgifts.in/wp-content/uploads/2024/02/bottle-ok.jpg?fit=1000%2C1000&ssl=1" },
    { id: 5, name: "Personalized Wooden Photo Frame", category: "Frames", price: 450, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80" },
    { id: 6, name: "Collage Memory Photo Frame", category: "Frames", price: 799, image: "https://images.unsplash.com/photo-1544273677-c433136021d4?w=500&q=80" },
    { id: 7, name: "Luxury Surprise Gift Box", category: "Gifts", price: 1200, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&q=80" },
    { id: 8, name: "Customized Ceramic Mug", category: "Gifts", price: 299, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80" },
    { id: 9, name: "Premium Privacy Tempered Glass", category: "Tempered Glass", price: 250, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80" },
    { id: 10, name: "11D Ultra Clear Screen Guard", category: "Tempered Glass", price: 180, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80" },
    { id: 11, name: "Custom Printed Black Cotton T-Shirt", category: "T-Shirts", price: 499, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80" },
    { id: 12, name: "Minimalist Aesthetic White Tee", category: "T-Shirts", price: 449, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80" }
];

// --- 2. STATE MANAGEMENT (LOCAL STORAGE) ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userSession = JSON.parse(localStorage.getItem('userSession')) || null;
let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
let currentCategory = "All";
let searchQuery = "";

// --- 3. APP INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    showSpinner();
    setTimeout(() => {
        lucide.createIcons();
        renderCategoriesMenu();
        renderProducts();
        setupEventListeners();
        updateCartUI();
        checkLoginStatus();
        hideSpinner();
    }, 600); // 0.6 Seconds Loading Spinner
});

// --- 4. LOADING SPINNER CONTROLS ---
function showSpinner() { 
    const loader = document.getElementById("loader");
    if(loader) loader.style.display = "flex"; 
}
function hideSpinner() { 
    const loader = document.getElementById("loader");
    if(loader) loader.style.display = "none"; 
}

// --- 5. RENDER CATEGORIES NAVIGATION MENU ---
function renderCategoriesMenu() {
    const categories = ["All", "Water Bottles", "Frames", "Gifts", "Tempered Glass", "T-Shirts"];
    const menuContainer = document.getElementById("categories-menu");
    if(menuContainer) {
        menuContainer.innerHTML = categories.map(cat => `
            <button class="category-btn ${currentCategory === cat ? 'active' : ''}" onclick="filterCategory('${cat}')">${cat}</button>
        `).join('');
    }
}

function filterCategory(category) {
    currentCategory = category;
    renderCategoriesMenu();
    renderProducts();
}

// --- 6. RENDER PRODUCTS WITH SEARCH & FILTER ---
function renderProducts() {
    const container = document.getElementById("products-container");
    if (!container) return;

    let filtered = PRODUCTS.filter(p => currentCategory === "All" || p.category === currentCategory);
    
    if(searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if(filtered.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px; font-weight: 500;">No products found matching "${searchQuery}".</div>`;
        return;
    }

    container.innerHTML = filtered.map(prod => `
        <div class="product-card">
            <div class="img-container"><img src="${prod.image}" alt="${prod.name}"></div>
            <div class="product-info">
                <span class="product-category">${prod.category}</span>
                <h3>${prod.name}</h3>
                <p class="product-price">₹${prod.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${prod.id})">Add to Bag</button>
            </div>
        </div>
    `).join('');
}

// --- 7. CART MANAGEMENT WITH + / - BUTTONS ---
function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) { 
        existing.quantity += 1; 
    } else { 
        cart.push({ ...product, quantity: 1 }); 
    }
    saveAndUpdateCart();
    document.getElementById("cart-drawer").classList.add("active");
    document.getElementById("cart-overlay").classList.add("active");
}

function updateQuantity(id, change) {
    const item = cart.find(p => p.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.id !== id);
        }
        saveAndUpdateCart();
    }
}

function saveAndUpdateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById("cart-count").innerText = count;

    const itemsContainer = document.getElementById("cart-items-container");
    if(cart.length === 0) {
        itemsContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center; margin-top:40px; font-size:14px;">Your bag is empty.</p>`;
    } else {
        itemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p style="font-weight: 600; color: var(--primary);">₹${item.price.toFixed(2)}</p>
                    <div class="qty-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span style="font-weight: 600; font-size: 14px;">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    document.getElementById("cart-total").innerText = `₹${total.toFixed(2)}`;
    document.getElementById("checkout-btn-container").style.display = total > 0 ? "block" : "none";
}

// --- 8. CASH ON DELIVERY (COD) ORDER PROCESS ---
function placeCODOrder() {
    if(!userSession) {
        alert("Please Login first using your mobile number to place an order!");
        showPage("auth-page");
        return;
    }

    const deliveryAddress = prompt("Please enter your complete Delivery Address:");
    
    if(!deliveryAddress || deliveryAddress.trim() === "") {
        alert("Delivery Address is required to place a Cash on Delivery order!");
        return;
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const order = {
        orderId: "ORD" + Math.floor(Math.random() * 900000 + 100000),
        paymentMethod: "Cash on Delivery",
        address: deliveryAddress,
        date: new Date().toLocaleDateString(),
        amount: total,
        items: [...cart]
    };

    orderHistory.unshift(order);
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    
    cart = [];
    saveAndUpdateCart();

    document.getElementById("success-order-id").innerText = order.orderId;
    document.getElementById("success-payment-id").innerText = "Collect ₹" + total.toFixed(2) + " on Delivery";
    
    const successMsg = document.querySelector("#order-success-page p");
    if(successMsg) successMsg.innerText = "Your order is confirmed! Please keep the cash ready at the time of delivery.";

    showPage("order-success-page");
}

// --- 9. AUTHENTICATION (PHONE NUMBER LOGIN) ---
function handlePhoneLogin(e) {
    e.preventDefault();
    const phone = document.getElementById("phone-input").value;
    if(phone.length !== 10) {
        alert("Please enter a valid 10-digit phone number");
        return;
    }
    userSession = { phone: phone };
    localStorage.setItem('userSession', JSON.stringify(userSession));
    checkLoginStatus();
    showPage("home-page");
}

function checkLoginStatus() {
    const profileBtn = document.getElementById("nav-profile-btn");
    if(userSession) {
        document.getElementById("profile-phone").innerText = userSession.phone;
        profileBtn.setAttribute("onclick", "showPage('profile-page')");
        renderOrderHistory();
    } else {
        profileBtn.setAttribute("onclick", "showPage('auth-page')");
    }
}

function handleLogout() {
    userSession = null;
    localStorage.removeItem('userSession');
    checkLoginStatus();
    showPage("home-page");
}

function renderOrderHistory() {
    const container = document.getElementById("history-list");
    if(!container) return;

    if(orderHistory.length === 0) {
        container.innerHTML = "<p style='color: var(--text-muted); font-size: 14px; text-align: left; margin-top: 10px;'>No orders placed yet.</p>";
        return;
    }
    container.innerHTML = orderHistory.map(order => `
        <div class="order-history-card">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size: 14px;">
                <strong>ID: ${order.orderId}</strong>
                <span style="color:#F59E0B; font-weight:600;">COD</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">Date: ${order.date} | Total: ₹${order.amount.toFixed(2)}</p>
            <small style="color:var(--text-muted); font-size: 11px; display:block; margin-top: 4px;">Address: ${order.address}</small>
        </div>
    `).join('');
}

// --- 10. NAVIGATION & SEARCH LISTENERS ---
function setupEventListeners() {
    const searchBar = document.getElementById("search-bar");
    if(searchBar) {
        searchBar.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderProducts();
        });
    }

    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    
    document.getElementById("cart-btn").addEventListener("click", () => {
        drawer.classList.add("active");
        overlay.classList.add("active");
    });
    
    document.getElementById("close-cart").addEventListener("click", () => {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    });
    
    overlay.addEventListener("click", () => {
        drawer.classList.remove("active");
        overlay.classList.remove("active");
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
    document.getElementById("cart-drawer").classList.remove("active");
    document.getElementById("cart-overlay").classList.remove("active");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
