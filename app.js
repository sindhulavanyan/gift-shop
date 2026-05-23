const PRODUCTS = [
    { 
        id: 1, 
        name: "LAEON Stainless Steel Tumbler ", 
        category: "Tumbler",
        price: 900, 
        image: "https://static-assets-prod.fnp.com/images/pr/l/v20251028180715/dual-tone-personalised-stainless-steel-tumbler_1.jpg" 
    },
    { 
        id: 2, 
        name: " LAEON Stainless Steel Flask", 
        category: "Flask",
        price:600, 
        image: "https://www.thewalletstore.in/cdn/shop/products/bottle-02.jpg?v=1668669610&width=800 " 
    },
    { 
        id: 3, 
        name: "LAEON  Stainless Stell Flask", 
        category: "Glass",
        price: 600, 
        image: "https://static-assets-prod.fnp.com/images/pr/l/v20230728154424/personalised-led-temperature-bottle_1.jpg" 
    },
    { 
        id: 4, 
        name: "LAEON Stainless steel Bottle", 
        category: "Bottle",
        price:500, 
        image: "https://i0.wp.com/unlimitedgifts.in/wp-content/uploads/2024/02/bottle-ok.jpg?fit=1000%2C1000&ssl=1" 
    }
];

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    renderProducts();
    setupCartListeners();
});

function renderProducts() {
    const container = document.getElementById("products-container");
    container.innerHTML = PRODUCTS.map(prod => `
        <div class="product-card">
            <div class="img-container">
                <img src="₹{prod.image}" alt="₹{prod.name}">
            </div>
            <div class="product-info">
                <span class="product-category">₹{prod.category}</span>
                <h3>₹{prod.name}</h3>
                <p class="product-price">₹{prod.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" onclick="addToCart(₹{prod.id})">Add to Bag</button>
            </div>
        </div>
    `).join('');
}

function setupCartListeners() {
    const drawer = document.getElementById("cart-drawer");
    document.getElementById("cart-btn").addEventListener("click", () => drawer.classList.add("active"));
    document.getElementById("close-cart").addEventListener("click", () => drawer.classList.remove("active"));
    document.getElementById("cart-overlay").addEventListener("click", () => drawer.classList.remove("active"));
}

function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    document.getElementById("cart-drawer").classList.add("active");
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
                <img src="₹{item.image}" alt="₹{item.name}">
                <div class="cart-item-details">
                    <h4>₹{item.name}</h4>
                    <p>₹{item.quantity} × ₹₹{item.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    document.getElementById("cart-total").innerText = `₹₹{total.toFixed(2)}`;

    const gPayButtonContainer = document.getElementById("google-pay-container");
    gPayButtonContainer.style.display = total > 0 ? "block" : "none";
}

const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        'gateway': 'example',
        'gatewayMerchantId': 'exampleGatewayMerchantId'
    }
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks
    }
};

const cardPaymentMethod = Object.assign(
    {},
    baseCardPaymentMethod,
    { tokenizationSpecification: tokenizationSpecification }
);

let paymentsClient = null;

function onGooglePayLoaded() {
    paymentsClient = new google.payments.api.PaymentsClient({ environment: 'TEST' });
    
    const isReadyToPayRequest = Object.assign({}, baseRequest);
    isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];

    paymentsClient.isReadyToPay(isReadyToPayRequest)
        .then(function(response) {
            if (response.result) {
                createAndRenderGooglePayButton();
            }
        })
        .catch(function(err) {
            console.error("Google Pay Setup Error: ", err);
        });
}

function createAndRenderGooglePayButton() {
    const button = paymentsClient.createButton({
        buttonColor: 'default',
        buttonType: 'checkout',
        buttonSizeMode: 'fill',
        onClick: onGooglePaymentButtonClicked
    });
    document.getElementById('google-pay-container').appendChild(button);
}

function getTransactionInfo() {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return {
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        totalPrice: total.toFixed(2)
    };
}

function onGooglePaymentButtonClicked() {
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = getTransactionInfo();
    paymentDataRequest.merchantInfo = {
        merchantName: 'The Present Gift Shop'
    };

    paymentsClient.loadPaymentData(paymentDataRequest)
        .then(function(paymentData) {
            processPaymentSuccess(paymentData);
        })
        .catch(function(err) {
            console.error("Payment Sheet Closed/Cancelled: ", err);
        });
}

function processPaymentSuccess(paymentData) {
    alert("✨ Order Placed Successfully! Thank you for supporting our shop.");
    cart = [];
    updateCartUI();
    document.getElementById("cart-drawer").classList.remove("active");
}
window.onload = function() {
    if (typeof onGooglePayLoaded === 'function') {
        onGooglePayLoaded();
    }
};
