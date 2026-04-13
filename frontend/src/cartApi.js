import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api/cart";
const EMPTY_CART = { items: [], total: 0, totalItems: 0 };

function getToken() {
  return localStorage.getItem("token");
}

function getAuthConfig() {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  };
}

function normalizeCart(payload) {
  const cart = payload?.cart || payload || EMPTY_CART;
  return {
    ...EMPTY_CART,
    ...cart,
    items: Array.isArray(cart?.items) ? cart.items : []
  };
}

function persistCart(cart) {
  const nextCart = normalizeCart(cart);
  localStorage.setItem("cartCount", String(nextCart.totalItems || 0));
  window.dispatchEvent(new CustomEvent("cartChange", { detail: nextCart }));
  return nextCart;
}

async function requestCart(method, path = "/me", data) {
  if (!getToken()) {
    return persistCart(EMPTY_CART);
  }

  const response = await axios({
    method,
    url: `${API_BASE_URL}${path}`,
    data,
    ...getAuthConfig()
  });

  return persistCart(response.data);
}

export async function fetchCart() {
  return requestCart("get");
}

export async function addCartItem(foodId, quantity = 1) {
  return requestCart("post", "/items", { foodId, quantity });
}

export async function updateCartItem(itemId, quantity) {
  return requestCart("patch", `/items/${itemId}`, { quantity });
}

export async function removeCartItem(itemId) {
  return requestCart("delete", `/items/${itemId}`);
}

export async function clearCart() {
  return requestCart("delete", "/me/items");
}

export async function syncLegacyLocalCart() {
  if (!getToken()) {
    return persistCart(EMPTY_CART);
  }

  const legacyCart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (Array.isArray(legacyCart) && legacyCart.length > 0) {
    for (const item of legacyCart) {
      if (!item?.foodId) continue;

      await axios.post(
        `${API_BASE_URL}/items`,
        {
          foodId: item.foodId,
          quantity: Math.max(1, Number(item.quantity || 1))
        },
        getAuthConfig()
      );
    }

    localStorage.removeItem("cart");
  }

  return fetchCart();
}
