// MORDISANO: carrito compartido entre páginas mediante localStorage.
const CART_KEY = 'mordisano_cart_v1';
// Cambia este valor por el número oficial, con código de país y sin + ni espacios.
// Ejemplo de formato para Perú: 519XXXXXXXX
const WHATSAPP_NUMBER = '';

let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (error) { cart = []; }

const $ = (selector) => document.querySelector(selector);
const countEl = $('#cartCount');
const cartDialog = $('#cartDialog');
const cartItems = $('#cartItems');
const cartTotal = $('#cartTotal');
const toast = $('#toast');

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCount();
}
function updateCount() {
  if (countEl) countEl.textContent = cart.length;
}
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2300);
}
function renderCart() {
  if (!cartItems || !cartTotal) return;
  if (!cart.length) {
    cartItems.innerHTML = '<p>Aún no has agregado productos.</p>';
    cartTotal.textContent = 'S/ 0.00';
    return;
  }
  cartItems.innerHTML = '';
  cart.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    const label = document.createElement('span');
    label.textContent = `${item.name} — S/ ${Number(item.price).toFixed(2)}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Quitar';
    remove.setAttribute('aria-label', `Quitar ${item.name}`);
    remove.addEventListener('click', () => {
      cart.splice(index, 1);
      saveCart();
      renderCart();
    });
    row.append(label, remove);
    cartItems.appendChild(row);
  });
  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
  cartTotal.textContent = `S/ ${total.toFixed(2)}`;
}
function openWhatsApp(message) {
  const url = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
}

document.addEventListener('DOMContentLoaded', () => {
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  updateCount();

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      cart.push({ name: button.dataset.name, price: Number(button.dataset.price) });
      saveCart();
      showToast(`${button.dataset.name} agregado al carrito`);
    });
  });

  const cartButton = $('#cartButton');
  if (cartButton && cartDialog) {
    cartButton.addEventListener('click', () => {
      renderCart();
      cartDialog.showModal();
    });
  }
  const closeCart = $('#closeCart');
  if (closeCart && cartDialog) closeCart.addEventListener('click', () => cartDialog.close());

  const checkoutButton = $('#checkoutButton');
  if (checkoutButton) {
    checkoutButton.addEventListener('click', () => {
      if (!cart.length) {
        showToast('Agrega al menos un producto primero');
        return;
      }
      const lines = cart.map(item => `• ${item.name}: S/ ${Number(item.price).toFixed(2)}`).join('\n');
      const total = cart.reduce((sum, item) => sum + Number(item.price), 0);
      openWhatsApp(`Hola, MORDISANO. Quisiera consultar este pedido:\n${lines}\nTotal referencial: S/ ${total.toFixed(2)}\n¿Me confirman disponibilidad y entrega?`);
    });
  }

  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const consultForm = $('#consultForm');
  if (consultForm) {
    consultForm.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(consultForm);
      const message = `Hola, MORDISANO. Quisiera realizar una consulta.\nMi nombre: ${data.get('owner')}\nNombre de mi mascota: ${data.get('pet') || 'No indicado'}\nTema: ${data.get('topic')}\nConsulta: ${data.get('question')}`;
      openWhatsApp(message);
    });
  }
});
