
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:3001";

const HIDDEN_STATUSES = [
  "payment_rejected",
  "payment_expired"
];

function getStatusLabel(status) {
  const labels = {
    pending_payment: "Chờ thanh toán",
    awaiting_approval: "Chờ xác nhận thanh toán",
    paid: "Thanh toán thành công",
    payment_rejected: "Thanh toán bị từ chối",
    payment_expired: "Hết hạn thanh toán"
  };

  return labels[status] || status;
}

function getStatusStyle(status) {
  const styles = {
    paid: {
      background: "#e8f7ee",
      color: "#198754",
      border: "1px solid #c8ead5"
    },
    pending_payment: {
      background: "#fff7e6",
      color: "#b7791f",
      border: "1px solid #f4dfb0"
    },
    awaiting_approval: {
      background: "#eef5ff",
      color: "#2563a6",
      border: "1px solid #d4e4fa"
    }
  };

  return styles[status] || {
    background: "#f1f3f5",
    color: "#666",
    border: "1px solid #e5e7eb"
  };
}

function renderStars(rating) {
  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );

  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

const formatMoney = (amount) =>
  Number(amount || 0).toLocaleString("vi-VN") + " đ";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [savingReviewKey, setSavingReviewKey] = useState("");

  const navigate = useNavigate();
  const lastStatusesRef = useRef({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchAll = async () => {
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          axios.get(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/reviews/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const nextOrders = ordersRes.data || [];
        const nextReviews = reviewsRes.data || [];

        nextOrders.forEach((order) => {
          const prevStatus = lastStatusesRef.current[order.id];

          if (prevStatus && prevStatus !== order.status) {
            if (order.status === "paid") {
              alert(`Đơn hàng thanh toán thành công`);
            }

            if (order.status === "payment_rejected") {
              alert(`Đơn hàng thanh toán bị từ chối`);
            }
          }

          lastStatusesRef.current[order.id] = order.status;
        });

        setOrders(nextOrders);
        setMyReviews(nextReviews);

        setReviewForms((prev) => {
          const next = { ...prev };

          nextReviews.forEach((review) => {
            const key = String(review.food_id);

            if (!next[key]) {
              next[key] = {
                rating: String(review.rating || 5),
                comment: review.comment || ""
              };
            }
          });

          return next;
        });
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      }
    };

    fetchAll();

    const timer = setInterval(fetchAll, 1000);

    return () => clearInterval(timer);
  }, [navigate, token]);

  // Chỉ hiển thị đơn chưa kết thúc
  const activeOrders = orders.filter(
    (order) => !HIDDEN_STATUSES.includes(order.status)
  );

  const getReviewForFood = (foodId) =>
    myReviews.find(
      (review) => String(review.food_id) === String(foodId)
    );

  const getReviewForm = (foodId) =>
    reviewForms[String(foodId)] || {
      rating: "5",
      comment: ""
    };

  const updateReviewForm = (foodId, patch) => {
    setReviewForms((prev) => ({
      ...prev,
      [String(foodId)]: {
        ...getReviewForm(foodId),
        ...patch
      }
    }));
  };

  const reloadMyReviews = async () => {
    const res = await axios.get(
      `${API_URL}/api/reviews/me`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setMyReviews(res.data || []);
  };

  const submitReview = async (foodId) => {
    const existing = getReviewForFood(foodId);
    const form = getReviewForm(foodId);
    const reviewKey = String(foodId);

    if (!form.rating) {
      alert("Vui lòng chọn số sao");
      return;
    }

    setSavingReviewKey(reviewKey);

    try {
      const payload = {
        foodId,
        rating: Number(form.rating),
        comment: form.comment.trim()
      };

      if (existing) {
        await axios.put(
          `${API_URL}/api/reviews/${existing.id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        alert("Cập nhật review thành công");
      } else {
        await axios.post(
          `${API_URL}/api/reviews`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        alert("Thêm review thành công");
      }

      await reloadMyReviews();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể lưu review"
      );
    } finally {
      setSavingReviewKey("");
    }
  };

  const deleteReview = async (foodId) => {
    const existing = getReviewForFood(foodId);

    if (!existing) return;

    if (!window.confirm("Bạn có chắc muốn xóa review này không?")) {
      return;
    }

    setSavingReviewKey(String(foodId));

    try {
      await axios.delete(
        `${API_URL}/api/reviews/${existing.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Xóa review thành công");

      setReviewForms((prev) => ({
        ...prev,
        [String(foodId)]: {
          rating: "5",
          comment: ""
        }
      }));

      await reloadMyReviews();
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể xóa review"
      );
    } finally {
      setSavingReviewKey("");
    }
  };

  return (
    <div className="orders-page">
      <style>{`
        .orders-page {
          min-height: 100vh;
          padding: 35px 0 60px;
          background: #f5f6fa;
          color: #343a40;
        }

        .orders-container {
          width: min(1100px, calc(100% - 40px));
          margin: 0 auto;
        }

        .orders-heading {
          margin-bottom: 28px;
        }

        .orders-heading h2 {
          margin: 0 0 8px;
          color: #252b36;
          font-size: 28px;
          font-weight: 800;
        }

        .orders-heading p {
          margin: 0;
          color: #8a919e;
          font-size: 14px;
        }

        .orders-count {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 16px;
          padding: 8px 13px;
          border-radius: 8px;
          background: #fff0f0;
          color: #e74c3c;
          font-size: 13px;
          font-weight: 700;
        }

        .orders-list {
          display: grid;
          gap: 22px;
        }

        .order-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #edf0f4;
          border-radius: 14px;
          box-shadow: 0 3px 14px rgba(30, 40, 60, 0.045);
        }

        .order-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          padding: 20px 24px;
          border-bottom: 1px solid #f0f1f4;
        }

        .order-id {
          color: #292f3a;
          font-size: 16px;
          font-weight: 800;
        }

        .order-date {
          margin-top: 5px;
          color: #9aa0aa;
          font-size: 12px;
        }

        .order-status {
          display: inline-flex;
          align-items: center;
          padding: 7px 13px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .order-body {
          padding: 22px 24px;
        }

        .order-address {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #e9edf3;
          border-radius: 10px;
          background: #f8f9fc;
          color: #5f6877;
          font-size: 13px;
          line-height: 1.6;
        }

        .order-address strong {
          color: #343b48;
        }

        .order-items {
          display: grid;
          gap: 18px;
        }

        .order-item {
          padding-bottom: 18px;
          border-bottom: 1px solid #f0f1f4;
        }

        .order-item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .order-item-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 10px;
        }

        .order-item-name {
          color: #414956;
          font-size: 14px;
          font-weight: 600;
        }

        .order-item-quantity {
          margin-left: 7px;
          color: #9aa0aa;
          font-size: 13px;
          font-weight: 400;
        }

        .order-item-price {
          flex-shrink: 0;
          color: #343b48;
          font-size: 14px;
          font-weight: 700;
        }

        .review-box {
          margin-top: 14px;
          padding: 17px;
          border: 1px solid #f1dfe0;
          border-radius: 11px;
          background: #fffafa;
        }

        .review-title {
          margin-bottom: 10px;
          color: #343b48;
          font-size: 14px;
          font-weight: 800;
        }

        .review-current {
          margin-bottom: 12px;
          color: #f0a500;
          font-size: 17px;
          letter-spacing: 2px;
        }

        .review-admin-reply {
          margin-bottom: 14px;
          padding: 12px 14px;
          border: 1px solid #dce8f8;
          border-radius: 9px;
          background: #f2f7ff;
          color: #315d91;
          font-size: 13px;
          line-height: 1.6;
        }

        .review-admin-reply strong {
          display: block;
          margin-bottom: 5px;
        }

        .review-label {
          margin-bottom: 7px;
          color: #687181;
          font-size: 13px;
          font-weight: 700;
        }

        .review-stars {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .review-star {
          padding: 0;
          border: none;
          background: transparent;
          font-size: 29px;
          line-height: 1;
          cursor: pointer;
          transition: transform 0.15s;
        }

        .review-star:hover {
          transform: scale(1.15);
        }

        .review-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 13px;
          border: 1px solid #e4e7ed;
          border-radius: 9px;
          outline: none;
          resize: vertical;
          color: #343b48;
          background: #fff;
          font-family: inherit;
          font-size: 13px;
          transition: border-color 0.2s;
        }

        .review-textarea:focus {
          border-color: #e74c3c;
        }

        .review-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .orders-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 17px;
          border: none;
          border-radius: 8px;
          background: #e74c3c;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .orders-btn:hover {
          background: #d83b2e;
          transform: translateY(-1px);
        }

        .orders-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .orders-btn-secondary {
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #687181;
        }

        .orders-btn-secondary:hover {
          background: #f7f8fa;
          color: #343b48;
        }

        .order-notice {
          margin-top: 20px;
          padding: 13px 15px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
        }

        .order-notice.success {
          background: #edf9f1;
          color: #198754;
          border: 1px solid #d0edda;
        }

        .order-notice.info {
          background: #eef5ff;
          color: #315d91;
          border: 1px solid #dce8f8;
        }

        .order-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 22px;
          padding-top: 19px;
          border-top: 1px dashed #e5e7eb;
        }

        .order-summary {
          display: grid;
          gap: 8px;
          color: #737c8b;
          font-size: 13px;
        }

        .order-summary-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .order-total {
          margin-top: 5px;
          color: #e74c3c;
          font-size: 21px;
          font-weight: 800;
        }

        .order-payment-note {
          color: #198754;
          font-size: 13px;
          font-weight: 700;
        }

        .orders-empty {
          padding: 65px 20px;
          border: 1px solid #edf0f4;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 3px 14px rgba(30, 40, 60, 0.045);
          text-align: center;
        }

        .orders-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          margin: 0 auto 18px;
          border-radius: 50%;
          background: #fff0f0;
          color: #e74c3c;
          font-size: 30px;
        }

        .orders-empty h3 {
          margin: 0 0 8px;
          color: #343b48;
          font-size: 18px;
        }

        .orders-empty p {
          margin: 0;
          color: #9299a5;
          font-size: 14px;
          line-height: 1.6;
        }

        .orders-empty button {
          margin-top: 22px;
        }

        @media (max-width: 600px) {
          .orders-page {
            padding: 25px 0 40px;
          }

          .orders-container {
            width: calc(100% - 24px);
          }

          .orders-heading h2 {
            font-size: 23px;
          }

          .order-header {
            padding: 16px;
          }

          .order-body {
            padding: 17px 15px;
          }

          .order-item-info {
            align-items: flex-start;
          }

          .order-item-price {
            font-size: 13px;
          }

          .order-footer {
            align-items: stretch;
          }

          .order-footer > * {
            width: 100%;
          }

          .order-footer > button {
            width: 100%;
          }

          .order-total {
            font-size: 19px;
          }

          .review-box {
            padding: 13px;
          }
        }
      `}</style>

      <div className="orders-container">
        <div className="orders-heading">
          <h2>Đơn hàng của bạn</h2>
          <p>Theo dõi trạng thái và quản lý các đơn hàng đang xử lý.</p>

          <div className="orders-count">
            <span>▣</span>
            {activeOrders.length} đơn hàng
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">▤</div>
            <h3>Hiện không có đơn hàng nào</h3>
            <p>
              Các đơn hàng đã kết thúc có thể xem lại trong lịch sử
              đơn hàng tại trang cá nhân.
            </p>

            <button
              onClick={() => navigate("/home")}
              className="orders-btn"
            >
              Khám phá món ăn
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {activeOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status);

              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <div className="order-id">
                        Đơn hàng 
                      </div>

                      <div className="order-date">
                        Ngày đặt: {order.createdAt}
                      </div>
                    </div>

                    <span
                      className="order-status"
                      style={statusStyle}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="order-body">
                    <div className="order-address">
                      <span>⌖</span>
                      <div>
                        <strong>Địa chỉ giao hàng</strong>
                        <div>
                          {order.shippingAddress || "Chưa có"}
                        </div>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item) => {
                        const existingReview = getReviewForFood(
                          item.foodId
                        );

                        const form = getReviewForm(item.foodId);
                        const selectedRating = Number(form.rating) || 0;

                        const canReview =
                          order.status === "paid" && item.foodId;

                        const isSaving =
                          savingReviewKey === String(item.foodId);

                        return (
                          <div
                            key={`${order.id}-${item.id || item.foodId}`}
                            className="order-item"
                          >
                            <div className="order-item-info">
                              <div className="order-item-name">
                                {item.name}
                                <span className="order-item-quantity">
                                  x{item.quantity}
                                </span>
                              </div>

                              <div className="order-item-price">
                                {formatMoney(item.price * item.quantity)}
                              </div>
                            </div>

                            {canReview && (
                              <div className="review-box">
                                <div className="review-title">
                                  {existingReview
                                    ? "Review của bạn"
                                    : "Đánh giá món ăn"}
                                </div>

                                {existingReview && (
                                  <>
                                    <div className="review-current">
                                      Hiện tại:{" "}
                                      {renderStars(existingReview.rating)}
                                    </div>

                                    {existingReview.admin_reply && (
                                      <div className="review-admin-reply">
                                        <strong>Phản hồi từ admin</strong>
                                        {existingReview.admin_reply}
                                      </div>
                                    )}
                                  </>
                                )}

                                <div style={{ display: "grid", gap: 13 }}>
                                  <div>
                                    <div className="review-label">
                                      Chọn số sao
                                    </div>

                                    <div className="review-stars">
                                      {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                          key={starValue}
                                          type="button"
                                          className="review-star"
                                          onClick={() =>
                                            updateReviewForm(item.foodId, {
                                              rating: String(starValue)
                                            })
                                          }
                                          disabled={isSaving}
                                          aria-label={`Chọn ${starValue} sao`}
                                          style={{
                                            color:
                                              starValue <= selectedRating
                                                ? "#ffb400"
                                                : "#d7dce3"
                                          }}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <textarea
                                    value={form.comment}
                                    onChange={(e) =>
                                      updateReviewForm(item.foodId, {
                                        comment: e.target.value
                                      })
                                    }
                                    rows={3}
                                    placeholder="Chia sẻ cảm nhận của bạn về món ăn..."
                                    className="review-textarea"
                                    disabled={isSaving}
                                  />

                                  <div className="review-actions">
                                    <button
                                      onClick={() =>
                                        submitReview(item.foodId)
                                      }
                                      className="orders-btn"
                                      disabled={isSaving}
                                    >
                                      {isSaving
                                        ? "Đang lưu..."
                                        : existingReview
                                        ? "Cập nhật review"
                                        : "Gửi review"}
                                    </button>

                                    {existingReview && (
                                      <button
                                        onClick={() =>
                                          deleteReview(item.foodId)
                                        }
                                        className="orders-btn orders-btn-secondary"
                                        disabled={isSaving}
                                      >
                                        Xóa review
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {order.status === "paid" && (
                      <div className="order-notice success">
                        Thanh toán thành công.
                      </div>
                    )}

                    {order.status === "awaiting_approval" && (
                      <div className="order-notice info">
                        Đã mở trang QR, đang chờ admin xác nhận thanh toán.
                      </div>
                    )}

                    <div className="order-footer">
                      <div className="order-summary">
                        <div className="order-summary-row">
                          <span>Tạm tính:</span>
                          <strong>
                            {formatMoney(
                              order.subtotal || order.total || 0
                            )}
                          </strong>
                        </div>

                        <div className="order-summary-row">
                          <span>Voucher:</span>
                          <strong>
                            {order.voucherCode || "Không dùng"}
                          </strong>
                        </div>

                        <div className="order-summary-row">
                          <span>Giảm giá:</span>
                          <strong>
                            {formatMoney(order.discountAmount || 0)}
                          </strong>
                        </div>

                        <div>
                          <div style={{ marginTop: 5 }}>
                            Tổng thanh toán
                          </div>

                          <div className="order-total">
                            {formatMoney(order.total)}
                          </div>
                        </div>
                      </div>

                      {["pending_payment", "awaiting_approval"].includes(order.status) && (
                          <button
                            onClick={() => navigate(`/payment/${order.id}`)}
                            className="orders-btn"
                          >
                            Thanh toán ngay
                          </button>
                        )}

                      {order.status === "paid" && (
                        <div className="order-payment-note">
                          ✓ Phương thức: QR
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
    </div>
  );
}
