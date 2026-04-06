import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(cart);
  }, [navigate]);

  const updateCart = (next) => {
    localStorage.setItem("cart", JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("cartChange"));
  };

  const removeItem = (foodId) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const next = cart.filter((item) => item.foodId !== foodId);
    updateCart(next);
  };

  const createOrder = async (orderItems) => {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:3001/api/orders",
      { items: orderItems },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

  const placeOrderForItem = async (item) => {
    try {
      setSubmitting(true);
      await createOrder([item]);
      removeItem(item.foodId);
      alert("Đặt hàng thành công");
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const placeAllOrders = async () => {
    if (!items.length) {
      alert("Giỏ hàng trống");
      return;
    }

    try {
      setSubmitting(true);
      await createOrder(items);
      updateCart([]);
      alert("Đã chuyển đơn hàng sang trang đơn hàng");
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", marginBottom: "30px" }}>
        Giỏ hàng của bạn
      </h2>
      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>
            Giỏ hàng của bạn đang trống. Hãy thêm món ăn ngon nào.
          </p>
          <button onClick={() => navigate("/home")} className="btn" style={{ marginTop: "20px" }}>
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <>
          <div className="grid" style={{ marginBottom: "30px" }}>
            {items.map((item) => (
              <div
                key={item.foodId}
                className="card"
                style={{ display: "flex", flexDirection: "column", padding: "20px" }}
              >
                {item.image && (
                  <img
                    src={`http://localhost:3001/${item.image}`}
                    alt={item.name}
                    style={{ width: "100%", height: 180, objectFit: "cover", marginBottom: "15px", borderRadius: "8px" }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "10px" }}>{item.name}</div>
                  <div style={{ color: "#666", marginBottom: "5px" }}>Số lượng: {item.quantity}</div>
                  <div className="price">₫{item.price?.toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button
                    onClick={() => placeOrderForItem(item)}
                    className="btn"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    Đặt hàng
                  </button>
                  <button onClick={() => removeItem(item.foodId)} className="btn btn-danger" style={{ flex: 1 }}>
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ textAlign: "center", padding: "30px" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px", color: "#4caf50" }}>
              Tổng cộng: ₫{total?.toLocaleString()}
            </div>
            <button
              onClick={placeAllOrders}
              className="btn"
              style={{ fontSize: "1.2rem", padding: "15px 30px" }}
              disabled={submitting}
            >
              Đặt tất cả đơn hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
}
