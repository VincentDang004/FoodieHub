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
        alert(error.response?.data?.message || "Khong the mo trang thanh toan");
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
          alert(`Don hang #${orderId} thanh toan thanh cong`);
          navigate("/orders");
          return;
        }

        if (latestOrder.status === "payment_rejected") {
          alert(`Don hang #${orderId} thanh toan that bai`);
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
          alert("Rat tiec, thoi gian thanh toan cho don hang da het han.");
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
    return <div className="loading">Dang mo trang thanh toan...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: 900 }}>
      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", margin: "40px 0 30px" }}>
        Thanh toan QR
      </h2>

      <div className="card" style={{ padding: "30px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Don hang #{order.id}</h3>
            <p style={{ color: "#666" }}>Ngay tao: {order.createdAt}</p>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#4caf50" }}>{Number(order.total || 0).toLocaleString()} VND</div>
        </div>

        <div
          style={{
            marginTop: "16px",
            padding: "14px 16px",
            borderRadius: "14px",
            background: "#eef6ff",
            color: "#0b5394",
            lineHeight: 1.6
          }}
        >
          Dia chi giao hang: {order.shippingAddress || "Chua co"}
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 8, color: "#555" }}>
          <div>Tam tinh: {Number(order.subtotal || order.total || 0).toLocaleString()} VND</div>
          <div>Voucher: {order.voucherCode || "Khong dung"}</div>
          <div>Giam gia: {Number(order.discountAmount || 0).toLocaleString()} VND</div>
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
              <strong>{(item.price * item.quantity).toLocaleString()} VND</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: "30px", textAlign: "center" }}>
        <h3 style={{ marginTop: 0 }}>Quet ma QR de thanh toan</h3>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          He thong chi giu trang thanh toan trong 30 giay. Sau khi admin duyet, ban se duoc quay lai trang don hang.
        </p>

        <img
          src="/payment-qr.png"
          alt="QR thanh toan"
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
          Thoi gian con lai: {formatCountdown(remainingMs)}
        </div>

        <div style={{ marginTop: "16px", padding: "16px", borderRadius: "16px", background: "#eef6ff", color: "#0b5394", fontWeight: 600 }}>
          Don hang dang cho admin kiem tra thanh toan.
        </div>

        <div style={{ marginTop: "24px" }}>
          <button onClick={() => navigate("/orders")} className="btn btn-danger">
            Quay lai don hang
          </button>
        </div>
      </div>
    </div>
  );
}
