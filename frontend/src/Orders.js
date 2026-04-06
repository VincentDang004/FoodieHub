import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function getStatusLabel(status) {
  if (status === "pending_payment") return "Chưa thanh toán";
  if (status === "awaiting_approval") return "Chờ admin duyệt";
  if (status === "payment_rejected") return "Thanh toán thất bại";
  if (status === "payment_expired") return "Hết hạn thanh toán";
  if (status === "paid") return "Thanh toán thành công";
  return status;
}

function getStatusStyle(status) {
  if (status === "paid") return { background: "#d1e7dd", color: "#0f5132" };
  if (status === "payment_rejected" || status === "payment_expired") {
    return { background: "#f8d7da", color: "#842029" };
  }
  return { background: "#fff3cd", color: "#856404" };
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const lastStatusesRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const nextOrders = res.data || [];

        nextOrders.forEach((order) => {
          const prevStatus = lastStatusesRef.current[order.id];
          if (prevStatus && prevStatus !== order.status) {
            if (order.status === "paid") {
              alert(`Đơn hàng #${order.id} thanh toán thành công`);
            }
            if (order.status === "payment_rejected") {
              alert(`Đơn hàng #${order.id} thanh toán thất bại`);
            }
          }
          lastStatusesRef.current[order.id] = order.status;
        });

        setOrders(nextOrders);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOrders();
    const timer = setInterval(fetchOrders, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="container">
      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", margin: "50px 0 30px" }}>
        Đơn hàng của bạn
      </h2>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>Bạn chưa có đơn hàng nào.</p>
          <button onClick={() => navigate("/home")} className="btn" style={{ marginTop: "20px" }}>
            Khám phá món ăn ngay
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "25px", marginBottom: "50px" }}>
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);

            return (
              <div key={order.id} className="card" style={{ padding: "0", overflow: "hidden" }}>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "15px 25px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#333" }}>Đơn hàng #{order.id}</div>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginTop: "4px" }}>{order.createdAt}</div>
                  </div>
                  <span
                    style={{
                      ...statusStyle,
                      padding: "5px 15px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: 600
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div style={{ padding: "20px 25px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.id || item.foodId}`}
                        style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: 12 }}
                      >
                        <span style={{ color: "#555" }}>
                          {item.name} <span style={{ color: "#999", fontSize: "0.9rem" }}>x{item.quantity}</span>
                        </span>
                        <span style={{ fontWeight: 500 }}>₫{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {order.status === "payment_rejected" && (
                    <div style={{ marginBottom: "15px", padding: "12px 16px", borderRadius: "12px", background: "#fdecef", color: "#842029", fontWeight: 600 }}>
                      Thanh toán thất bại. Vui lòng thanh toán lại.
                    </div>
                  )}

                  {order.status === "payment_expired" && (
                    <div style={{ marginBottom: "15px", padding: "12px 16px", borderRadius: "12px", background: "#fdecef", color: "#842029", fontWeight: 600 }}>
                      Rất tiếc, thời gian thanh toán cho đơn hàng đã hết hạn.
                    </div>
                  )}

                  {order.status === "paid" && (
                    <div style={{ marginBottom: "15px", padding: "12px 16px", borderRadius: "12px", background: "#e9f7ef", color: "#0f5132", fontWeight: 600 }}>
                      Thanh toán thành công.
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: "1px dashed #eee",
                      paddingTop: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <span style={{ color: "#666", marginRight: "10px" }}>Tổng thanh toán:</span>
                      <span style={{ color: "#4caf50", fontSize: "1.5rem", fontWeight: 800 }}>
                        ₫{Number(order.total || 0).toLocaleString()}
                      </span>
                    </div>

                    {(order.status === "pending_payment" || order.status === "payment_rejected" || order.status === "payment_expired") && (
                      <button onClick={() => navigate(`/payment/${order.id}`)} className="btn">
                        Thanh toán
                      </button>
                    )}

                    {order.status === "awaiting_approval" && (
                      <div style={{ color: "#856404", fontWeight: 700 }}>
                        Đã mở trang QR, đang chờ admin duyệt
                      </div>
                    )}

                    {order.status === "paid" && (
                      <div style={{ color: "#0f5132", fontWeight: 700 }}>
                        Phương thức: QR
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
