import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCart } from "./cartApi";

export default function Navbar() {
  const [count, setCount] = useState(Number(localStorage.getItem("cartCount") || 0));
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const updateState = async () => {
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));

      const token = localStorage.getItem("token");
      if (!token) {
        setCount(0);
        return;
      }

      try {
        const cart = await fetchCart();
        setCount(Number(cart?.totalItems || 0));
      } catch (error) {
        console.error(error);
      }
    };

    const handleCartChange = (event) => {
      setCount(Number(event.detail?.totalItems || localStorage.getItem("cartCount") || 0));
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };

    updateState();
    window.addEventListener("cartChange", handleCartChange);
    window.addEventListener("storage", updateState);

    return () => {
      window.removeEventListener("cartChange", handleCartChange);
      window.removeEventListener("storage", updateState);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("cartCount");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">FoodieHub</div>
        <Link to="/home" className="navbar-link">{"Trang chủ"}</Link>
     
        <Link to="/cart" className="navbar-link">{"Giỏ hàng"} ({count})</Link>
        <Link to="/orders" className="navbar-link">{"Đơn hàng"}</Link>
        <Link to="/profile" className="navbar-link">{"Tài khoản"}</Link>
        {user.role === "admin" && (
          <Link to="/admin" className="navbar-link">{"Quản trị"}</Link>
        )}
      </div>
      <button onClick={logout} className="btn btn-danger navbar-logout">
        {"Đăng xuất"}
      </button>
    </nav>
  );
}
