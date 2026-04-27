import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "./store/useStore";
import { cartCountFromPayload, getCart } from "./api/commerce";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ComparePage from "./pages/ComparePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import ToastContainer from "./components/ToastContainer";

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

function AnimatedPage({ children }) {
  return <motion.div {...pageTransition}>{children}</motion.div>;
}

export default function App() {
  const setAuthUser = useStore((s) => s.setAuthUser);
  const setCart = useStore((s) => s.setCart);
  const setCartCount = useStore((s) => s.setCartCount);

  useEffect(() => {
    const authUser = localStorage.getItem("authUser") || "";
    setAuthUser(authUser);

    const bootstrapCart = async () => {
      if (!localStorage.getItem("accessToken")) {
        setCart([]);
        setCartCount(0);
        return;
      }
      try {
        const payload = await getCart();
        setCart(payload.items || []);
        setCartCount(cartCountFromPayload(payload));
      } catch {
        setCart([]);
        setCartCount(0);
      }
    };

    bootstrapCart();
  }, [setAuthUser, setCart, setCartCount]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-white">
      <Navbar />
      <main className="container-shell flex-1 py-6">
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <HomePage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products"
              element={
                <AnimatedPage>
                  <ProductsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/products/:id"
              element={
                <AnimatedPage>
                  <ProductDetailsPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/compare"
              element={
                <AnimatedPage>
                  <ComparePage />
                </AnimatedPage>
              }
            />
            <Route
              path="/cart"
              element={
                <AnimatedPage>
                  <CartPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/checkout"
              element={
                <AnimatedPage>
                  <CheckoutPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/checkout/success"
              element={
                <AnimatedPage>
                  <CheckoutSuccessPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/checkout/cancel"
              element={
                <AnimatedPage>
                  <CheckoutCancelPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/account"
              element={
                <AnimatedPage>
                  <AccountPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/login"
              element={
                <AnimatedPage>
                  <LoginPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/register"
              element={
                <AnimatedPage>
                  <RegisterPage />
                </AnimatedPage>
              }
            />
            <Route
              path="/contact"
              element={
                <AnimatedPage>
                  <ContactPage />
                </AnimatedPage>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
