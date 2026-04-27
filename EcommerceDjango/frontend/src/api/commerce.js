import api from "./client";

export const getCart = async () => {
  const { data } = await api.get("/cart/");
  return data;
};

export const addCartItem = async ({ product_id, quantity }) => {
  const { data } = await api.post("/cart/", { product_id, quantity });
  return data;
};

export const updateCartItem = async ({ item_id, quantity }) => {
  const { data } = await api.patch("/cart/", { item_id, quantity });
  return data;
};

export const removeCartItem = async ({ item_id }) => {
  const { data } = await api.delete("/cart/", { data: { item_id } });
  return data;
};

export const placeCheckout = async ({ shipping_address }) => {
  const { data } = await api.post("/checkout/", { shipping_address });
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get("/orders/");
  return data;
};

export const getOrderById = async (orderId) => {
  const { data } = await api.get(`/orders/${orderId}/`);
  return data;
};

export const createStripeCheckout = async ({ shipping_address }) => {
  const { data } = await api.post("/checkout/stripe/", { shipping_address });
  return data;
};
export const cartCountFromPayload = (cartPayload) =>
  (cartPayload?.items || []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

/* ── Profile ─────────────────────────────────────── */
export const getProfile = async () => {
  const { data } = await api.get("/profile/");
  return data;
};
export const updateProfile = async (payload) => {
  const { data } = await api.patch("/profile/", payload);
  return data;
};

/* ── Addresses ───────────────────────────────────── */
export const getAddresses = async () => {
  const { data } = await api.get("/addresses/");
  return Array.isArray(data) ? data : data?.results || [];
};
export const createAddress = async (payload) => {
  const { data } = await api.post("/addresses/", payload);
  return data;
};
export const updateAddress = async (id, payload) => {
  const { data } = await api.patch(`/addresses/${id}/`, payload);
  return data;
};
export const deleteAddress = async (id) => {
  await api.delete(`/addresses/${id}/`);
};
