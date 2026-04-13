import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function getStatusLabel(status) {
  if (status === "pending_payment") return "Ch\u01b0a thanh to\u00e1n";
  if (status === "awaiting_approval") return "Ch\u1edd admin duy\u1ec7t";
  if (status === "payment_rejected") return "Thanh to\u00e1n th\u1ea5t b\u1ea1i";
  if (status === "payment_expired") return "H\u1ebft h\u1ea1n thanh to\u00e1n";
  if (status === "paid") return "Thanh to\u00e1n th\u00e0nh c\u00f4ng";
  return status;
}

function getStatusStyle(status) {
  if (status === "paid") return { background: "#d1e7dd", color: "#0f5132" };
  if (status === "payment_rejected" || status === "payment_expired") {
    return { background: "#f8d7da", color: "#842029" };
  }
  return { background: "#fff3cd", color: "#856404" };
}

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [savingReviewKey, setSavingReviewKey] = useState("");
  const navigate = useNavigate();
  const lastStatusesRef = useRef({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchAll = async () => {
      try {
        const [ordersRes, reviewsRes] = await Promise.all([
          axios.get("http://localhost:3001/api/orders", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:3001/api/reviews/me", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const nextOrders = ordersRes.data || [];
        const nextReviews = reviewsRes.data || [];

        nextOrders.forEach((order) => {
          const prevStatus = lastStatusesRef.current[order.id];
          if (prevStatus && prevStatus !== order.status) {
            if (order.status === "paid") {
              alert(`\u0110\u01a1n h\u00e0ng #${order.id} thanh to\u00e1n th\u00e0nh c\u00f4ng`);
            }
            if (order.status === "payment_rejected") {
              alert(`\u0110\u01a1n h\u00e0ng #${order.id} thanh to\u00e1n th\u1ea5t b\u1ea1i`);
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
        console.error(error);
      }
    };

    fetchAll();
    const timer = setInterval(fetchAll, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const token = localStorage.getItem("token");

  const getReviewForFood = (foodId) => myReviews.find((review) => String(review.food_id) === String(foodId));

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
    const res = await axios.get("http://localhost:3001/api/reviews/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const nextReviews = res.data || [];
    setMyReviews(nextReviews);
  };

  const submitReview = async (foodId) => {
    const existing = getReviewForFood(foodId);
    const form = getReviewForm(foodId);
    const reviewKey = String(foodId);

    if (!form.rating) {
      alert("Vui l\u00f2ng ch\u1ecdn s\u1ed1 sao");
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
        await axios.put(`http://localhost:3001/api/reviews/${existing.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("C\u1eadp nh\u1eadt review th\u00e0nh c\u00f4ng");
      } else {
        await axios.post("http://localhost:3001/api/reviews", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Th\u00eam review th\u00e0nh c\u00f4ng");
      }

      await reloadMyReviews();
    } catch (error) {
      alert(error.response?.data?.message || "Kh\u00f4ng th\u1ec3 l\u01b0u review");
    } finally {
      setSavingReviewKey("");
    }
  };

  const deleteReview = async (foodId) => {
    const existing = getReviewForFood(foodId);
    if (!existing) return;
    if (!window.confirm("B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a review n\u00e0y kh\u00f4ng?")) return;

    setSavingReviewKey(String(foodId));

    try {
      await axios.delete(`http://localhost:3001/api/reviews/${existing.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("X\u00f3a review th\u00e0nh c\u00f4ng");
      setReviewForms((prev) => ({
        ...prev,
        [String(foodId)]: { rating: "5", comment: "" }
      }));
      await reloadMyReviews();
    } catch (error) {
      alert(error.response?.data?.message || "Kh\u00f4ng th\u1ec3 x\u00f3a review");
    } finally {
      setSavingReviewKey("");
    }
  };

  return (
    <div className="container">
      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", margin: "50px 0 30px" }}>
        {"\u0110\u01a1n h\u00e0ng c\u1ee7a b\u1ea1n"}
      </h2>

      {orders.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>{"B\u1ea1n ch\u01b0a c\u00f3 \u0111\u01a1n h\u00e0ng n\u00e0o."}</p>
          <button onClick={() => navigate("/home")} className="btn" style={{ marginTop: "20px" }}>
            {"Kh\u00e1m ph\u00e1 m\u00f3n \u0103n ngay"}
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
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#333" }}>{"\u0110\u01a1n h\u00e0ng #"}{order.id}</div>
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
                  <div
                    style={{
                      marginBottom: "15px",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "#eef6ff",
                      color: "#0b5394"
                    }}
                  >
                    {"\u0110\u1ecba ch\u1ec9 giao h\u00e0ng: "}{order.shippingAddress || "Ch\u01b0a c\u00f3"}
                  </div>

                  <div style={{ marginBottom: "15px", display: "grid", gap: 16 }}>
                    {order.items.map((item) => {
                      const existingReview = getReviewForFood(item.foodId);
                      const form = getReviewForm(item.foodId);
                      const selectedRating = Number(form.rating) || 0;
                      const canReview = order.status === "paid" && item.foodId;
                      const isSaving = savingReviewKey === String(item.foodId);

                      return (
                        <div key={`${order.id}-${item.id || item.foodId}`} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: 12 }}>
                            <span style={{ color: "#555" }}>
                              {item.name} <span style={{ color: "#999", fontSize: "0.9rem" }}>x{item.quantity}</span>
                            </span>
                            <span style={{ fontWeight: 500 }}>{(item.price * item.quantity).toLocaleString()} VND</span>
                          </div>

                          {canReview && (
                            <div
                              style={{
                                marginTop: 10,
                                padding: 14,
                                borderRadius: 12,
                                background: "#fff7f8",
                                border: "1px solid #f2d7dc"
                              }}
                            >
                              <div style={{ fontWeight: 700, color: "#333", marginBottom: 8 }}>
                                {existingReview ? "Review c\u1ee7a b\u1ea1n" : "Vi\u1ebft review cho m\u00f3n n\u00e0y"}
                              </div>

                              {existingReview && (
                                <>
                                  <div style={{ color: "#ff8a00", marginBottom: 8 }}>
                                    {"Hi\u1ec7n t\u1ea1i: "}{renderStars(existingReview.rating)}
                                  </div>
                                  {existingReview.admin_reply && (
                                    <div
                                      style={{
                                        marginBottom: 10,
                                        padding: 12,
                                        borderRadius: 12,
                                        background: "#eef6ff",
                                        border: "1px solid #d3e6ff",
                                        color: "#0b5394"
                                      }}
                                    >
                                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Phản hồi từ admin</div>
                                      <div style={{ lineHeight: 1.6 }}>{existingReview.admin_reply}</div>
                                    </div>
                                  )}
                                </>
                              )}

                              <div style={{ display: "grid", gap: 10 }}>
                                <div>
                                  <div style={{ color: "#666", fontWeight: 600, marginBottom: 8 }}>
                                    Chọn số sao
                                  </div>
                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                      <button
                                        key={starValue}
                                        type="button"
                                        onClick={() => updateReviewForm(item.foodId, { rating: String(starValue) })}
                                        disabled={isSaving}
                                        aria-label={`Chọn ${starValue} sao`}
                                        style={{
                                          border: "none",
                                          background: "transparent",
                                          cursor: isSaving ? "not-allowed" : "pointer",
                                          padding: 0,
                                          fontSize: "2rem",
                                          lineHeight: 1,
                                          color: starValue <= selectedRating ? "#ffb400" : "#d7d7d7",
                                          transition: "transform 0.15s ease, color 0.15s ease"
                                        }}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <textarea
                                  value={form.comment}
                                  onChange={(e) => updateReviewForm(item.foodId, { comment: e.target.value })}
                                  rows={3}
                                  placeholder={"Chia s\u1ebb c\u1ea3m nh\u1eadn c\u1ee7a b\u1ea1n v\u1ec1 m\u00f3n \u0103n"}
                                  className="input-field"
                                  style={{ width: "100%", padding: 12, borderRadius: 10, border: "2px solid #eee", resize: "vertical" }}
                                />
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                  <button onClick={() => submitReview(item.foodId)} className="btn" disabled={isSaving}>
                                    {isSaving ? "\u0110ang l\u01b0u..." : existingReview ? "C\u1eadp nh\u1eadt review" : "G\u1eedi review"}
                                  </button>
                                  {existingReview && (
                                    <button onClick={() => deleteReview(item.foodId)} className="btn btn-danger" disabled={isSaving}>
                                      {"X\u00f3a review"}
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

                  {order.status === "payment_rejected" && (
                    <div style={{ marginBottom: "15px", padding: "12px 16px", borderRadius: "12px", background: "#fdecef", color: "#842029", fontWeight: 600 }}>
                      {"Thanh to\u00e1n th\u1ea5t b\u1ea1i. Vui l\u00f2ng thanh to\u00e1n l\u1ea1i."}
                    </div>
                  )}

                  {order.status === "payment_expired" && (
                    <div style={{ marginBottom: "15px", padding: "12px 16px", borderRadius: "12px", background: "#fdecef", color: "#842029", fontWeight: 600 }}>
                      {"R\u1ea5t ti\u1ebfc, th\u1eddi gian thanh to\u00e1n cho \u0111\u01a1n h\u00e0ng \u0111\u00e3 h\u1ebft h\u1ea1n."}
                    </div>
                  )}

                  {order.status === "paid" && (
                    <div style={{ marginBottom: "15px", padding: "12px 16px", borderRadius: "12px", background: "#e9f7ef", color: "#0f5132", fontWeight: 600 }}>
                      {"Thanh to\u00e1n th\u00e0nh c\u00f4ng."}
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
                      <div style={{ color: "#666", marginBottom: 4 }}>
                        {"T\u1ea1m t\u00ednh: "}{Number(order.subtotal || order.total || 0).toLocaleString()} VND
                      </div>
                      <div style={{ color: "#666", marginBottom: 4 }}>
                        {"Voucher: "}{order.voucherCode || "Kh\u00f4ng d\u00f9ng"}
                      </div>
                      <div style={{ color: "#666", marginBottom: 6 }}>
                        {"Gi\u1ea3m gi\u00e1: "}{Number(order.discountAmount || 0).toLocaleString()} VND
                      </div>
                      <span style={{ color: "#666", marginRight: "10px" }}>{"T\u1ed5ng thanh to\u00e1n:"}</span>
                      <span style={{ color: "#4caf50", fontSize: "1.5rem", fontWeight: 800 }}>
                        {Number(order.total || 0).toLocaleString()} VND
                      </span>
                    </div>

                    {(order.status === "pending_payment" || order.status === "payment_rejected") && (
                      <button onClick={() => navigate(`/payment/${order.id}`)} className="btn">
                        {"Thanh to\u00e1n"}
                      </button>
                    )}

                    {order.status === "awaiting_approval" && (
                      <div style={{ color: "#856404", fontWeight: 700 }}>{"\u0110\u00e3 m\u1edf trang QR, \u0111ang ch\u1edd admin duy\u1ec7t"}</div>
                    )}

                    {order.status === "paid" && <div style={{ color: "#0f5132", fontWeight: 700 }}>{"Ph\u01b0\u01a1ng th\u1ee9c: QR"}</div>}
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
