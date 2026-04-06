import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PAYMENT_WINDOW_MS = 30000;

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `00:${seconds}`;
}

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [remainingMs, setRemainingMs] = useState(PAYMENT_WINDOW_MS);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const startPayment = async () => {
      try {
        const res = await axios.post(
          `http://localhost:3001/api/orders/${orderId}/start-payment`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(res.data);
      } catch (error) {
        alert(error.response?.data?.message || "Không thể mở trang thanh toán");
        navigate("/orders");
      }
    };

    startPayment();
  }, [navigate, orderId]);

  const expiresAt = useMemo(() => {
    if (!order?.paymentExpiresAt) {
      return Date.now() + PAYMENT_WINDOW_MS;
    }

    return new Date(order.paymentExpiresAt).getTime();
  }, [order]);

  useEffect(() => {
    if (!order) {
      return undefined;
    }

    const token = localStorage.getItem("token");

    const syncTimer = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const latestOrder = res.data;

        if (latestOrder.status === "paid") {
          alert(`Đơn hàng #${orderId} thanh toán thành công`);
          navigate("/orders");
          return;
        }

        if (latestOrder.status === "payment_rejected") {
          alert(`Đơn hàng #${orderId} thanh toán thất bại`);
          navigate("/orders");
          return;
        }

        const nextRemainingMs = new Date(latestOrder.paymentExpiresAt).getTime() - Date.now();
        if (nextRemainingMs <= 0) {
          await axios.post(
            `http://localhost:3001/api/orders/${orderId}/expire`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Rất tiếc, thời gian thanh toán cho đơn hàng đã hết hạn.");
          navigate("/orders");
          return;
        }

        setRemainingMs(nextRemainingMs);
        setOrder(latestOrder);
      } catch (error) {
        console.error(error);
      }
    }, 1000);

    return () => clearInterval(syncTimer);
  }, [navigate, order, orderId]);

  useEffect(() => {
    if (!order) {
      return;
    }

    setRemainingMs(Math.max(0, expiresAt - Date.now()));
  }, [expiresAt, order]);

  if (!order) {
    return <div className="loading">Đang mở trang thanh toán...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", margin: "40px 0 30px" }}>
        Thanh toán QR
      </h2>

      <div className="card" style={{ padding: "30px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Đơn hàng #{order.id}</h3>
            <p style={{ color: "#666" }}>Ngày tạo: {order.createdAt}</p>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#4caf50" }}>
            ₫{Number(order.total || 0).toLocaleString()}
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          {order.items.map((item) => (
            <div
              key={`${order.id}-${item.id || item.foodId}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid #eee",
                gap: 12
              }}
            >
              <span>
                {item.name} x{item.quantity}
              </span>
              <strong>₫{(item.price * item.quantity).toLocaleString()}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "30px", textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Quét mã QR để thanh toán</h3>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Hệ thống chỉ giữ trang thanh toán trong 30 giây. Sau khi admin duyệt, bạn sẽ được quay lại trang đơn hàng.
        </p>

        <img
          src="/payment-qr.png"
          alt="QR thanh toán"
          style={{
            width: "100%",
            maxWidth: 380,
            borderRadius: 20,
            border: "1px solid #eee",
            background: "#fff",
            padding: 12
          }}
        />

        <div style={{ marginTop: "20px", padding: "16px", borderRadius: "16px", background: "#fff8e1", color: "#7c5c00", fontWeight: 700, fontSize: "1.1rem" }}>
          Thời gian còn lại: {formatCountdown(remainingMs)}
        </div>

        <div style={{ marginTop: "16px", padding: "16px", borderRadius: "16px", background: "#eef6ff", color: "#0b5394", fontWeight: 600 }}>
          Đơn hàng đang chờ admin kiểm tra thanh toán.
        </div>

        <div style={{ marginTop: "24px" }}>
          <button onClick={() => navigate("/orders")} className="btn btn-danger">
            Quay lại đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
