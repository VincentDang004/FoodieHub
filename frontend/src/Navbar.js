import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const updateState = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCount(cart.reduce((sum, item) => sum + item.quantity, 0));
      setUser(JSON.parse(localStorage.getItem("user") || "{}"));
    };

    updateState();
    window.addEventListener("cartChange", updateState);
    window.addEventListener("storage", updateState);

    return () => {
      window.removeEventListener("cartChange", updateState);
      window.removeEventListener("storage", updateState);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">FoodieHub</div>
        <Link to="/home" className="navbar-link">Trang chủ</Link>
        <Link to="/restaurants" className="navbar-link">Nhà hàng</Link>
        <Link to="/categories" className="navbar-link">Danh mục</Link>
        <Link to="/cart" className="navbar-link">Giỏ hàng ({count})</Link>
        <Link to="/orders" className="navbar-link">Đơn hàng</Link>
        <Link to="/profile" className="navbar-link">Tài khoản</Link>
        {user.role === "admin" && (
          <Link to="/admin" className="navbar-link">Quản trị</Link>
        )}
      </div>
      <button
        onClick={logout}
        className="btn btn-danger navbar-logout"
      >
        Đăng xuất
      </button>
    </nav>
  );
}
