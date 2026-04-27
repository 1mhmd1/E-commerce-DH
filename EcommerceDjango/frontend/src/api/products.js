import api from "./client";

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products/", { params });
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}/`);
  return data;
};

export const getFeatured = async () => {
  const { data } = await api.get("/products/featured/");
  return data;
};

export const getRecommended = async () => {
  const { data } = await api.get("/products/recommendations/");
  return data;
};

export const getSuggestions = async (q) => {
  const { data } = await api.get("/products/suggestions/", { params: { q } });
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get("/categories/");
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const getAIInsight = async (productId) => {
  const { data } = await api.get(`/products/${productId}/ai-insight/`);
  return data;
};

export const getCompareRecommendation = async (productIds) => {
  const { data } = await api.post("/products/compare-recommend/", { product_ids: productIds });
  return data;
};
