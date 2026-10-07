// Campus Bakery POS
// Product prices are based on the assigned Campus Bakery scenario.

const products = [
  { id: 1, name: "Pandesal (pack of 5)", price: 25, image: "images/Pandesal.jpg" },
  { id: 2, name: "Ensaymada", price: 20, image: "images/Ensaymada.jpg" },
  { id: 3, name: "Spanish Bread", price: 15, image: "images/Spanish_Bread.jpg" },
  { id: 4, name: "Chocolate Cupcake", price: 30, image: "images/Chocolate_CupCake.jpg" },
  { id: 5, name: "Loaf Bread", price: 55, image: "images/Loaf_Bread.jpg" },
  { id: 6, name: "Brewed Coffee (cup)", price: 25, image: "images/Brewed_Coffee.jpg" }
];

let cart = [];
let transactionNumber = 1;

const productList = document.getElementById("productList");
const cartList = document.getElementById("cartList");
const cartCount = document.getElementById("cartCount");
const subtotalAmount = document.getElementById("subtotalAmount");
const totalAmount = document.getElementById("totalAmount");
const changeBox = document.getElementById("changeBox");
const changeAmount = document.getElementById("changeAmount");
const paymentInput = document.getElementById("payment");
const paymentMessage = document.getElementById("paymentMessage");
const receipt = document.getElementById("receipt");
const payBtn = document.getElementById("payBtn");
const newTransactionBtn = document.getElementById("newTransactionBtn");

function formatCurrency(amount) {
  return `₱${amount.toFixed(2)}`;
}

function renderProducts() {
  productList.innerHTML = products.map(product => `
    <div class="product-card">
      <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <div class="price">${formatCurrency(product.price)}</div>
      <button class="add-btn" onclick="addToCart(${product.id})">
        Add to Cart
      </button>
    </div>
  `).join("");
}

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  clearPaymentMessage();
  renderCart();
}

function changeQuantity(productId, amount) {
  const item = cart.find(product => product.id === productId);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(product => product.id !== productId);
  }

  clearPaymentMessage();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(product => product.id !== productId);
  clearPaymentMessage();
  renderCart();
}

function getTotal() {
  return cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="empty-state">No items in the cart.</div>
    `;
  } else {
    cartList.innerHTML = cart.map(item => {
      const subtotal = item.price * item.quantity;

      return `
        <div class="cart-item">
          <div class="cart-row">
            <div>
              <div class="cart-name">${item.name}</div>
              <small>${formatCurrency(item.price)} each</small>
            </div>
            <div class="cart-subtotal">${formatCurrency(subtotal)}</div>
          </div>

          <div class="cart-controls">
            <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
            <strong>${item.quantity}</strong>
            <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">
              Remove
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = `${itemCount} item${itemCount !== 1 ? "s" : ""}`;
  const subtotal = getTotal();
  subtotalAmount.textContent = formatCurrency(subtotal);
  totalAmount.textContent = formatCurrency(subtotal);
}

function validatePayment() {
  changeBox.hidden = true;

  if (cart.length === 0) {
    showMessage("Add at least one product before payment.", "error");
    return;
  }

  const rawPayment = paymentInput.value.trim();

  // Blank, non-numeric, and negative validation
  if (rawPayment === "" || !Number.isFinite(Number(rawPayment)) || Number(rawPayment) < 0) {
    showMessage("Please enter a valid payment amount.", "error");
    return;
  }

  const amountPaid = Number(rawPayment);
  const total = getTotal();

  if (amountPaid < total) {
    showMessage(
      `Insufficient payment. Please enter at least ${formatCurrency(total)}.`,
      "error"
    );
    return;
  }

  const change = amountPaid - total;

  changeAmount.textContent = formatCurrency(change);
  changeBox.hidden = false;
  showMessage("Payment successful.", "success");
  generateReceipt(amountPaid, change);
}

function generateReceipt(amountPaid, change) {
  const transactionRef =
    `CB-${new Date().getFullYear()}-${String(transactionNumber).padStart(4, "0")}`;

  receipt.innerHTML = `
    <h3>Campus Bakery</h3>
    <div class="receipt-meta">
      Transaction: ${transactionRef}<br>
      Date: ${new Date().toLocaleString()}
    </div>

    ${cart.map(item => `
      <div class="receipt-line">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      </div>
    `).join("")}

    <div class="receipt-line receipt-total">
      <span>Total Amount</span>
      <span>${formatCurrency(getTotal())}</span>
    </div>

    <div class="receipt-line">
      <span>Amount Paid</span>
      <span>${formatCurrency(amountPaid)}</span>
    </div>

    <div class="receipt-line">
      <span>Change</span>
      <span>${formatCurrency(change)}</span>
    </div>

    <p class="success"><strong>Payment Confirmed</strong></p>
  `;

  transactionNumber++;
}

function startNewTransaction() {
  cart = [];
  paymentInput.value = "";
  clearPaymentMessage();

  receipt.innerHTML = `
    <div class="receipt-placeholder">
      Complete a valid payment to generate a receipt.
    </div>
  `;

  renderCart();
}

function showMessage(message, type) {
  paymentMessage.textContent = message;
  paymentMessage.className = `message ${type}`;
}

function clearPaymentMessage() {
  paymentMessage.textContent = "";
  paymentMessage.className = "message";
  changeAmount.textContent = "";
  changeBox.hidden = true;
}

payBtn.addEventListener("click", validatePayment);
newTransactionBtn.addEventListener("click", startNewTransaction);

renderProducts();
renderCart();
