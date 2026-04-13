import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { addCartItem, syncLegacyLocalCart } from "./cartApi";

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "\u2605".repeat(safeRating) + "\u2606".repeat(5 - safeRating);
}

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [reviewsByFood, setReviewsByFood] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedFoodId, setExpandedFoodId] = useState(null);
  const [expandedReviewFoodId, setExpandedReviewFoodId] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/");
      return;
    }

    let isMounted = true;

    const fetchFoodsAndReviews = async (showLoading = false) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const foodRes = await axios.get("http://localhost:3001/api/food", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const nextFoods = foodRes.data || [];
        if (!isMounted) return;
        setFoods(nextFoods);

        const reviewEntries = await Promise.all(
          nextFoods.map(async (food) => {
            try {
              const reviewRes = await axios.get(`http://localhost:3001/api/reviews/food/${food.id}`);
              return [food.id, reviewRes.data || []];
            } catch (error) {
              console.error(error);
              return [food.id, []];
            }
          })
        );

        if (!isMounted) return;
        setReviewsByFood(Object.fromEntries(reviewEntries));
      } catch (err) {
        console.error("Loi:", err);
        if (showLoading) {
          alert("Loi tai danh sach do an");
        }
      } finally {
        if (showLoading && isMounted) {
          setLoading(false);
        }
      }
    };

    const initialize = async () => {
      try {
        await syncLegacyLocalCart();
      } catch (error) {
        console.error(error);
      }

      await fetchFoodsAndReviews(true);
    };

    initialize();
    const timer = setInterval(() => {
      fetchFoodsAndReviews(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [nav]);

  const addToCart = async (food) => {
    try {
      await addCartItem(food.id, 1);
      alert(`${food.name} đã được thêm vào giỏ`);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể thêm vào giỏ");
    }
  };

  if (loading) return <div className="loading">Đang tải món ăn ngon...</div>;

  return (
    <div className="container">
      <div className="hero-section">
        <h1 style={{ fontSize: "3rem", marginBottom: "10px", textShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
          Chào mừng đến với FoodieHub
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: "30px", opacity: 0.9 }}>
          Khám phá những món ăn ngon nhất từ các nhà hàng hàng đầu
        </p>
        <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => nav("/restaurants")} className="btn" style={{ fontSize: "1.1rem" }}>
            Xem nhà hàng
          </button>
          <button onClick={() => nav("/categories")} className="btn btn-danger" style={{ fontSize: "1.1rem" }}>
            Danh mục
          </button>
        </div>
      </div>

      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", margin: "50px 0 30px" }}>
        Danh sách món ăn
      </h2>

      {foods.length === 0 ? (
        <p style={{ color: "white", textAlign: "center" }}>Chưa có món ăn nào</p>
      ) : (
        <div className="grid">
          {foods.map((food) => {
            const reviews = reviewsByFood[food.id] || [];
            const averageRating = reviews.length
              ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
              : 0;
            const previewReviews = reviews.slice(0, 3);
            const isFoodExpanded = expandedFoodId === food.id;
            const isReviewExpanded = expandedReviewFoodId === food.id;

            return (
              <div key={food.id} className="card" style={{ overflow: "hidden" }}>
                {food.image && (
                  <img
                    src={`http://localhost:3001/${food.image}`}
                    alt={food.name}
                    style={{ width: "100%", height: 220, objectFit: "cover" }}
                  />
                )}

                <div
                  style={{ padding: "25px", cursor: "pointer" }}
                  onClick={() => setExpandedFoodId((current) => (current === food.id ? null : food.id))}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <div>
                      <h3 style={{ margin: "0 0 10px 0", color: "#333", fontSize: "1.3rem" }}>{food.name}</h3>
                      <div style={{ color: "#666", fontWeight: 600 }}>
                        {food.Restaurant?.name || "Chưa có nhà hàng"}
                      </div>
                    </div>
                    <div style={{ color: "#d63384", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {isFoodExpanded ? "Ẩn nhà hàng" : "Xem nhà hàng"}
                    </div>
                  </div>
                  <p className="price">{food.price?.toLocaleString()} VND</p>

                  {isFoodExpanded && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 14,
                        borderRadius: 14,
                        background: "#eef6ff",
                        border: "1px solid #d3e6ff",
                        color: "#0b5394"
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>
                        Nhà hàng: {food.Restaurant?.name || "Chưa có thông tin"}
                      </div>
                      <div style={{ marginTop: 6, lineHeight: 1.6 }}>
                        Địa chỉ: {food.Restaurant?.address || "Chưa có địa chỉ"}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 12,
                      padding: 14,
                      borderRadius: 14,
                      background: "#fff7f8",
                      border: "1px solid #f6d9de"
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#333" }}>
                      Đánh giá: {reviews.length ? averageRating.toFixed(1) : "Chưa có"} / 5
                    </div>
                    <div style={{ color: "#ff8a00", marginTop: 4 }}>
                      {reviews.length ? renderStars(averageRating) : "Chưa có review"}
                    </div>
                    <div
                      style={{
                        color: "#666",
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        flexWrap: "wrap"
                      }}
                    >
                      <span>Số review: {reviews.length}</span>
                      {reviews.length > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setExpandedReviewFoodId((current) => (current === food.id ? null : food.id));
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#d63384",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: 0
                          }}
                        >
                          {isReviewExpanded ? "Ẩn bình luận" : "Xem bình luận"}
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      addToCart(food);
                    }}
                    className="btn"
                    style={{ width: "100%", marginTop: "15px" }}
                  >
                    Them vao gio
                  </button>
                </div>

                {isReviewExpanded && previewReviews.length > 0 && (
                  <div
                    style={{
                      padding: "0 25px 25px",
                      borderTop: "1px solid #f1d4db",
                      background: "linear-gradient(180deg, rgba(255,247,248,0.98), rgba(255,255,255,0.98))"
                    }}
                  >
                    <div style={{ paddingTop: 18, display: "grid", gap: 12 }}>
                      {previewReviews.map((review) => (
                        <div
                          key={review.id}
                          style={{
                            padding: 14,
                            borderRadius: 14,
                            background: "#fff",
                            border: "1px solid #f0d7dd",
                            boxShadow: "0 10px 24px rgba(0,0,0,0.06)"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                              flexWrap: "wrap"
                            }}
                          >
                            <div style={{ fontWeight: 700, color: "#444" }}>
                              {review.User?.name || "Khách hàng"}
                            </div>
                            <div style={{ color: "#ff8a00", fontWeight: 700 }}>
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <div style={{ color: "#666", marginTop: 8, lineHeight: 1.6 }}>
                            {review.comment || "Không có nội dung"}
                          </div>
                          {review.admin_reply && (
                            <div
                              style={{
                                marginTop: 10,
                                padding: 12,
                                borderRadius: 12,
                                background: "#eef6ff",
                                border: "1px solid #d3e6ff",
                                color: "#0b5394"
                              }}
                            >
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>Phản hồi từ admin</div>
                              <div style={{ lineHeight: 1.6 }}>{review.admin_reply}</div>
                            </div>
                          )}
                        </div>
                      ))}

                      {reviews.length > previewReviews.length && (
                        <div style={{ color: "#666", fontSize: "0.95rem" }}>
                          Con {reviews.length - previewReviews.length} bình luận khác.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
