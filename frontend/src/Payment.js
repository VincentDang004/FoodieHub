
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PAYMENT_WINDOW_MS = 30000;

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `00:${seconds}`;
}

function formatMoney(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + " đ";
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
        alert(
          error.response?.data?.message ||
          "Không thể mở trang thanh toán"
        );
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
    if (!order) return undefined;

    const token = localStorage.getItem("token");

    const syncTimer = setInterval(async () => {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

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

        const nextRemainingMs =
          new Date(latestOrder.paymentExpiresAt).getTime() -
          Date.now();

        if (nextRemainingMs <= 0) {
          await axios.post(
            `http://localhost:3001/api/orders/${orderId}/expire`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert(
            "Rất tiếc, thời gian thanh toán cho đơn hàng đã hết hạn."
          );

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
    if (!order) return;

    setRemainingMs(
      Math.max(0, expiresAt - Date.now())
    );
  }, [expiresAt, order]);

  if (!order) {
    return (
      <div className="payment-loading">
        Đang mở trang thanh toán...
        <style>{`
          .payment-loading {
            min-height: 70vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f5f6fa;
            color: #737c8b;
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <style>{`
        .payment-page {
          min-height: 100vh;
          padding: 35px 0 55px;
          background: #f5f6fa;
          color: #343a40;
        }

        .payment-container {
          width: min(1150px, calc(100% - 40px));
          margin: 0 auto;
        }

        .payment-heading {
          margin-bottom: 25px;
        }

        .payment-heading h2 {
          margin: 0 0 7px;
          color: #252b36;
          font-size: 27px;
          font-weight: 800;
        }

        .payment-heading p {
          margin: 0;
          color: #8a919e;
          font-size: 14px;
        }

        .payment-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(340px, 0.85fr);
          align-items: start;
          gap: 22px;
        }

        .payment-card {
          overflow: hidden;
          border: 1px solid #edf0f4;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 3px 14px rgba(30, 40, 60, 0.045);
        }

        .payment-card-header {
          padding: 19px 22px;
          border-bottom: 1px solid #f0f1f4;
        }

        .payment-card-header h3 {
          margin: 0;
          color: #343b48;
          font-size: 16px;
          font-weight: 800;
        }

        .payment-card-body {
          padding: 22px;
        }

        .payment-order-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .payment-order-id {
          color: #343b48;
          font-size: 17px;
          font-weight: 800;
        }

        .payment-order-date {
          margin-top: 6px;
          color: #9aa0aa;
          font-size: 12px;
        }

        .payment-total {
          color: #e74c3c;
          font-size: 22px;
          font-weight: 800;
        }

        .payment-address {
          margin-top: 20px;
          padding: 14px 15px;
          border: 1px solid #e9edf3;
          border-radius: 10px;
          background: #f8f9fc;
          color: #687181;
          font-size: 13px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }

        .payment-address strong {
          color: #343b48;
        }

        .payment-items-title {
          margin-top: 23px;
          margin-bottom: 10px;
          color: #343b48;
          font-size: 14px;
          font-weight: 800;
        }

        .payment-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f1f4;
          color: #535d6b;
          font-size: 13px;
        }

        .payment-item:last-child {
          border-bottom: none;
        }

        .payment-item strong {
          flex-shrink: 0;
          color: #343b48;
        }

        .payment-summary {
          display: grid;
          gap: 11px;
          margin-top: 15px;
          padding-top: 17px;
          border-top: 1px dashed #e5e7eb;
          color: #737c8b;
          font-size: 13px;
        }

        .payment-summary-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .payment-summary-row strong {
          color: #414956;
          text-align: right;
        }

        .payment-summary-total {
          margin-top: 5px;
          padding-top: 13px;
          border-top: 1px solid #f0f1f4;
        }

        .payment-summary-total strong {
          color: #e74c3c;
          font-size: 21px;
          font-weight: 800;
        }

        .payment-qr-card {
          position: sticky;
          top: 20px;
          text-align: center;
        }

        .payment-qr-body {
          padding: 24px 22px;
        }

        .payment-qr-title {
          margin: 0 0 8px;
          color: #343b48;
          font-size: 18px;
          font-weight: 800;
        }

        .payment-qr-description {
          margin: 0 auto 19px;
          color: #8a919e;
          font-size: 13px;
          line-height: 1.7;
        }

        .payment-qr-frame {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 350px;
          padding: 12px;
          border: 1px solid #edf0f4;
          border-radius: 13px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(30, 40, 60, 0.05);
        }

        .payment-qr-image {
          display: block;
          width: 100%;
          border-radius: 8px;
          object-fit: contain;
        }

        .payment-countdown {
          margin-top: 20px;
          padding: 16px;
          border: 1px solid #f3e2b9;
          border-radius: 11px;
          background: #fff9eb;
          color: #9a6b16;
        }

        .payment-countdown-label {
          margin-bottom: 7px;
          font-size: 12px;
          font-weight: 700;
        }

        .payment-countdown-time {
          font-size: 30px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .payment-waiting {
          margin-top: 13px;
          padding: 13px 14px;
          border: 1px solid #dce8f8;
          border-radius: 10px;
          background: #f2f7ff;
          color: #315d91;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.6;
        }

        .payment-back-btn {
          width: 100%;
          margin-top: 17px;
          padding: 12px 18px;
          border: none;
          border-radius: 8px;
          background: #e74c3c;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .payment-back-btn:hover {
          background: #d83b2e;
        }

        @media (max-width: 850px) {
          .payment-layout {
            grid-template-columns: minmax(0, 1fr) minmax(280px, 0.85fr);
            gap: 15px;
          }

          .payment-card-body,
          .payment-qr-body {
            padding: 18px;
          }
        }

        @media (max-width: 700px) {
          .payment-page {
            padding: 25px 0 40px;
          }

          .payment-container {
            width: calc(100% - 24px);
          }

          .payment-heading h2 {
            font-size: 23px;
          }

          .payment-layout {
            grid-template-columns: 1fr;
          }

          .payment-qr-card {
            position: static;
          }

          .payment-qr-image {
            max-width: 330px;
          }
        }
      `}</style>

      <div className="payment-container">
        <div className="payment-heading">
          <h2>Thanh toán đơn hàng</h2>
          <p>
            Kiểm tra thông tin đơn hàng và quét mã QR để thanh toán.
          </p>
        </div>

        <div className="payment-layout">
          {/* CỘT TRÁI: THÔNG TIN ĐƠN HÀNG */}
          <div className="payment-card">
            <div className="payment-card-header">
              <h3>Thông tin đơn hàng</h3>
            </div>

            <div className="payment-card-body">
              <div className="payment-order-top">
                <div>
                  <div className="payment-order-id">
                    Đơn hàng #{order.id}
                  </div>

                  <div className="payment-order-date">
                    Ngày tạo: {order.createdAt}
                  </div>
                </div>

                <div className="payment-total">
                  {formatMoney(order.total)}
                </div>
              </div>

              <div className="payment-address">
                <strong>Địa chỉ giao hàng</strong>
                <div>{order.shippingAddress || "Chưa có"}</div>
              </div>

              <div className="payment-items-title">
                Danh sách món ăn
              </div>

              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.id || item.foodId}`}
                  className="payment-item"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>

                  <strong>
                    {formatMoney(item.price * item.quantity)}
                  </strong>
                </div>
              ))}

              <div className="payment-summary">
                <div className="payment-summary-row">
                  <span>Tạm tính</span>
                  <strong>
                    {formatMoney(
                      order.subtotal || order.total || 0
                    )}
                  </strong>
                </div>

                <div className="payment-summary-row">
                  <span>Voucher</span>
                  <strong>
                    {order.voucherCode || "Không dùng"}
                  </strong>
                </div>

                <div className="payment-summary-row">
                  <span>Giảm giá</span>
                  <strong>
                    {formatMoney(order.discountAmount || 0)}
                  </strong>
                </div>

                <div className="payment-summary-row payment-summary-total">
                  <span>Tổng thanh toán</span>
                  <strong>{formatMoney(order.total)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THANH TOÁN QR */}
          <div className="payment-card payment-qr-card">
            <div className="payment-card-header">
              <h3>Thanh toán QR</h3>
            </div>

            <div className="payment-qr-body">
              <h3 className="payment-qr-title">
                Quét mã QR để thanh toán
              </h3>

              <p className="payment-qr-description">
                Sử dụng ứng dụng ngân hàng để quét mã QR bên dưới.
              </p>

              <div className="payment-qr-frame">
                <img
                  src="/payment-qr.png"
                  alt="QR thanh toán"
                  className="payment-qr-image"
                />
              </div>

              <div className="payment-countdown">
                <div className="payment-countdown-label">
                  THỜI GIAN THANH TOÁN CÒN LẠI
                </div>

                <div className="payment-countdown-time">
                  {formatCountdown(remainingMs)}
                </div>
              </div>

              <div className="payment-waiting">
                Đơn hàng đang chờ admin kiểm tra và xác nhận thanh toán.
              </div>

              <button
                onClick={() => navigate("/orders")}
                className="payment-back-btn"
              >
                Quay lại đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
