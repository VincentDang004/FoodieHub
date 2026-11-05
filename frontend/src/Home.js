
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { addCartItem, syncLegacyLocalCart } from "./cartApi";

const API_URL = "http://localhost:3001";

function renderStars(rating) {
  const safeRating = Math.max(
    0,
    Math.min(5, Math.round(Number(rating) || 0))
  );

  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

// Chọn biểu tượng theo tên danh mục
function getCategoryIcon(name) {
  const value = String(name || "").toLowerCase();

  if (value.includes("cơm")) return "🍚";
  if (value.includes("gà")) return "🍗";
  if (
    value.includes("phở") ||
    value.includes("bún") ||
    value.includes("mì")
  ) return "🍜";
  if (value.includes("bánh")) return "🥐";
  if (value.includes("nước") || value.includes("uống")) return "🥤";
  if (value.includes("tráng miệng") || value.includes("ngọt")) return "🍰";
  if (value.includes("hải sản")) return "🦐";
  if (value.includes("pizza")) return "🍕";
  if (value.includes("burger") || value.includes("hamburger")) return "🍔";

  return "🍽️";
}

// Xử lý đường dẫn hình ảnh
function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http")) {
    return image;
  }

  return `${API_URL}/${image.replace(/^\/+/, "")}`;
}

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [reviewsByFood, setReviewsByFood] = useState({});
  const [loading, setLoading] = useState(true);

  const [expandedFoodId, setExpandedFoodId] = useState(null);
  const [expandedReviewFoodId, setExpandedReviewFoodId] = useState(null);

  const [addingFoodId, setAddingFoodId] = useState(null);

  const nav = useNavigate();

  // Khởi tạo trang và đồng bộ giỏ hàng
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      nav("/");
      return;
    }

    let isMounted = true;

    const initialize = async () => {
      try {
        await syncLegacyLocalCart();
      } catch (error) {
        console.error("Lỗi đồng bộ giỏ hàng:", error);
      }

      try {
        const categoryRes = await axios.get(
          `${API_URL}/api/categories`
        );

        if (isMounted) {
          setCategories(categoryRes.data || []);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [nav]);

  // Tải món ăn và đánh giá theo danh mục
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    let isMounted = true;
    let isFetching = false;

    const fetchFoodsAndReviews = async (showLoading = false) => {
      if (isFetching) return;

      isFetching = true;

      try {
        if (showLoading) {
          setLoading(true);
        }

        const params = selectedCategory
          ? {
              category_id: selectedCategory.id,
              category_name: selectedCategory.name
            }
          : {};

        const foodRes = await axios.get(
          `${API_URL}/api/food`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params
          }
        );

        const nextFoods = foodRes.data || [];

        if (!isMounted) return;

        setFoods(nextFoods);

        // Tải đánh giá của từng món
        const reviewEntries = await Promise.all(
          nextFoods.map(async (food) => {
            try {
              const reviewRes = await axios.get(
                `${API_URL}/api/reviews/food/${food.id}`
              );

              return [food.id, reviewRes.data || []];
            } catch (error) {
              console.error("Lỗi tải đánh giá:", error);
              return [food.id, []];
            }
          })
        );

        if (!isMounted) return;

        setReviewsByFood(Object.fromEntries(reviewEntries));
      } catch (error) {
        console.error("Lỗi tải món ăn:", error);

        if (showLoading && isMounted) {
          alert("Lỗi tải danh sách đồ ăn");
        }
      } finally {
        isFetching = false;

        if (showLoading && isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFoodsAndReviews(true);

    const timer = setInterval(() => {
      fetchFoodsAndReviews(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedCategory]);

  // Thêm món vào giỏ hàng
  const addToCart = async (food) => {
    try {
      setAddingFoodId(food.id);

      await addCartItem(food.id, 1);

      alert(`${food.name} đã được thêm vào giỏ`);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể thêm vào giỏ"
      );
    } finally {
      setAddingFoodId(null);
    }
  };

  // Chọn danh mục
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setExpandedFoodId(null);
    setExpandedReviewFoodId(null);
  };

  if (loading) {
    return (
      <div className="tf-home-loading">
        <div className="tf-loading-spinner"></div>
        <h3>Đang tải món ăn...</h3>
        <p>Chờ một chút nha!</p>
      </div>
    );
  }

  return (
    <div className="tf-home">
      <style>{`
        .tf-home {
          min-height: 100vh;
          background: #f5f6fa;
          padding: 32px 40px 60px;
          color: #252b3b;
          box-sizing: border-box;
        }

        .tf-home * {
          box-sizing: border-box;
        }

        .tf-home-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* HEADER */

        .tf-home-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }

        .tf-home-heading h1 {
          font-size: 27px;
          font-weight: 800;
          margin: 0 0 7px;
          color: #202638;
          letter-spacing: -0.5px;
        }

        .tf-home-heading p {
          color: #8990a2;
          font-size: 14px;
          margin: 0;
        }

        .tf-home-count {
          padding: 10px 16px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e9ebf1;
          color: #697184;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        /* HERO */

        .tf-home-hero {
          position: relative;
          overflow: hidden;
          min-height: 190px;
          padding: 35px 40px;
          border-radius: 20px;
          background: linear-gradient(115deg, #e94f60, #ff806d);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 38px;
          box-shadow: 0 12px 30px rgba(233, 79, 96, 0.14);
        }

        .tf-home-hero::before {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          right: 100px;
          top: -130px;
        }

        .tf-home-hero::after {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          right: -30px;
          bottom: -100px;
        }

        .tf-home-hero-content {
          position: relative;
          z-index: 1;
          max-width: 600px;
        }

        .tf-home-hero h2 {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          margin: 0 0 12px;
        }

        .tf-home-hero p {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
        }

        .tf-home-hero-icon {
          position: relative;
          z-index: 1;
          font-size: 75px;
          margin-right: 35px;
        }

        /* SECTION */

        .tf-home-section {
          margin-bottom: 35px;
        }

        .tf-home-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .tf-home-section-heading h2 {
          font-size: 19px;
          font-weight: 800;
          color: #252b3b;
          margin: 0;
        }

        .tf-home-section-heading p {
          color: #9299a9;
          font-size: 13px;
          margin: 5px 0 0;
        }

        /* CATEGORIES */

        .tf-home-categories {
          display: flex;
          gap: 13px;
          overflow-x: auto;
          padding: 3px 2px 15px;
          scrollbar-width: thin;
        }

        .tf-category {
          flex: 0 0 125px;
          min-height: 112px;
          padding: 17px 12px;
          border: 1px solid #e9ebf1;
          border-radius: 15px;
          background: #fff;
          color: #555e70;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .tf-category:hover {
          transform: translateY(-3px);
          border-color: #ff9a9f;
        }

        .tf-category.active {
          background: #fff0f1;
          border: 1.5px solid #f16b75;
          color: #e94f60;
          box-shadow: 0 5px 15px rgba(233,79,96,0.08);
        }

        .tf-category-icon {
          font-size: 30px;
          line-height: 1;
        }

        /* FOOD GRID */

        .tf-food-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 22px;
        }

        .tf-food-card {
          background: #fff;
          border: 1px solid #e9ebf1;
          border-radius: 17px;
          overflow: hidden;
          transition: all 0.22s ease;
          min-width: 0;
        }

        .tf-food-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(30, 40, 70, 0.08);
          border-color: #f1dadd;
        }

        .tf-food-image-wrap {
          position: relative;
          height: 205px;
          background: #f0f1f5;
          overflow: hidden;
        }

        .tf-food-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .tf-food-card:hover .tf-food-image {
          transform: scale(1.04);
        }

        .tf-food-image-placeholder {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 55px;
        }

        .tf-food-content {
          padding: 20px;
        }

        .tf-food-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .tf-food-name {
          color: #252b3b;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 800;
          margin: 0 0 7px;
        }

        .tf-food-restaurant {
          color: #9299a9;
          font-size: 12px;
          line-height: 1.5;
        }

        .tf-food-price {
          color: #e94f60;
          font-size: 17px;
          font-weight: 800;
          margin: 15px 0;
        }

        .tf-food-info-button {
          border: none;
          background: #fff0f1;
          color: #e94f60;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .tf-food-info-button:hover {
          background: #ffe1e4;
        }

        /* RESTAURANT INFO */

        .tf-restaurant-info {
          padding: 13px;
          border-radius: 11px;
          background: #f1f6ff;
          border: 1px solid #dce8fb;
          color: #42618b;
          font-size: 12px;
          line-height: 1.7;
          margin-bottom: 13px;
        }

        .tf-restaurant-info strong {
          display: block;
          font-size: 13px;
          margin-bottom: 4px;
        }

        /* REVIEW SUMMARY */

        .tf-review-summary {
          background: #faf7f7;
          border: 1px solid #f0e7e8;
          padding: 13px;
          border-radius: 11px;
          margin-top: 13px;
        }

        .tf-review-title {
          font-size: 12px;
          font-weight: 700;
          color: #4b5262;
        }

        .tf-review-stars {
          color: #f5a623;
          font-size: 15px;
          margin-top: 5px;
          letter-spacing: 1px;
        }

        .tf-review-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 9px;
          color: #8990a2;
          font-size: 11px;
        }

        .tf-review-toggle {
          border: none;
          background: transparent;
          padding: 0;
          color: #e94f60;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        /* ADD TO CART */

        .tf-add-cart {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 12px;
          margin-top: 14px;
          background: #e94f60;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tf-add-cart:hover {
          background: #d83e50;
          box-shadow: 0 5px 14px rgba(233,79,96,0.2);
        }

        .tf-add-cart:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* COMMENTS */

        .tf-review-list {
          padding: 16px 20px 20px;
          border-top: 1px solid #f0e7e8;
          background: #fffafa;
          display: grid;
          gap: 11px;
        }

        .tf-review-item {
          background: #fff;
          border: 1px solid #eee8e9;
          border-radius: 11px;
          padding: 13px;
        }

        .tf-review-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .tf-review-user {
          color: #444c5d;
          font-size: 12px;
          font-weight: 700;
        }

        .tf-review-comment {
          color: #737b8c;
          font-size: 12px;
          line-height: 1.7;
          margin-top: 8px;
          overflow-wrap: anywhere;
        }

        .tf-admin-reply {
          margin-top: 10px;
          padding: 11px;
          border-radius: 9px;
          background: #f1f6ff;
          border: 1px solid #dce8fb;
          color: #42618b;
          font-size: 12px;
          line-height: 1.7;
        }

        .tf-no-foods {
          background: #fff;
          border: 1px dashed #dfe2e9;
          border-radius: 15px;
          padding: 55px 20px;
          text-align: center;
          color: #9299a9;
        }

        .tf-no-foods-icon {
          font-size: 42px;
          margin-bottom: 12px;
        }

        /* LOADING */

        .tf-home-loading {
          min-height: 100vh;
          background: #f5f6fa;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: #252b3b;
        }

        .tf-home-loading h3 {
          font-size: 17px;
          margin: 18px 0 5px;
        }

        .tf-home-loading p {
          color: #9299a9;
          font-size: 13px;
        }

        .tf-loading-spinner {
          width: 38px;
          height: 38px;
          border: 4px solid #f5dfe2;
          border-top-color: #e94f60;
          border-radius: 50%;
          animation: tf-spin 0.8s linear infinite;
        }

        @keyframes tf-spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .tf-food-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .tf-home {
            padding: 22px 16px 40px;
          }

          .tf-home-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .tf-home-heading h1 {
            font-size: 23px;
          }

          .tf-home-hero {
            min-height: 155px;
            padding: 25px 22px;
            margin-bottom: 30px;
          }

          .tf-home-hero h2 {
            font-size: 21px;
          }

          .tf-home-hero p {
            font-size: 12px;
          }

          .tf-home-hero-icon {
            font-size: 48px;
            margin-right: 0;
          }

          .tf-food-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .tf-food-image-wrap {
            height: 210px;
          }

          .tf-home-section-heading h2 {
            font-size: 17px;
          }
        }

        @media (max-width: 380px) {
          .tf-home-hero-icon {
            display: none;
          }

          .tf-food-content {
            padding: 16px;
          }
        }
      `}</style>

      <div className="tf-home-container">

        {/* HEADER */}
        <div className="tf-home-header">
          <div className="tf-home-heading">
            <h1>Khám phá món ngon</h1>
            <p>
              Tìm kiếm và thưởng thức những món ăn yêu thích của bạn.
            </p>
          </div>

          <div className="tf-home-count">
            {foods.length} món ăn đang hiển thị
          </div>
        </div>

        {/* HERO */}
        <div className="tf-home-hero">
          <div className="tf-home-hero-content">
            <h2>Hôm nay bạn muốn ăn gì?</h2>
            <p>
              Khám phá thực đơn đa dạng, chọn món yêu thích
              và đặt hàng ngay trên TFOOD.
            </p>
          </div>

          <div className="tf-home-hero-icon">
            🍱
          </div>
        </div>

        {/* CATEGORIES */}
        <section className="tf-home-section">
          <div className="tf-home-section-heading">
            <div>
              <h2>Danh mục món ăn</h2>
              <p>Lựa chọn loại món ăn bạn yêu thích</p>
            </div>
          </div>

          <div className="tf-home-categories">

            <button
              type="button"
              onClick={() => selectCategory(null)}
              className={`tf-category ${
                selectedCategory === null ? "active" : ""
              }`}
            >
              <span className="tf-category-icon">🍽️</span>
              <span>Tất cả</span>
            </button>

            {categories.map((category) => {
              const isActive =
                selectedCategory?.id === category.id;

              return (
                <button
                  type="button"
                  key={category.id || category.name}
                  onClick={() => selectCategory(category)}
                  className={`tf-category ${
                    isActive ? "active" : ""
                  }`}
                >
                  <span className="tf-category-icon">
                    {getCategoryIcon(category.name)}
                  </span>

                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* FOOD LIST */}
        <section className="tf-home-section">
          <div className="tf-home-section-heading">
            <div>
              <h2>
                {selectedCategory
                  ? selectedCategory.name
                  : "Tất cả món ăn"}
              </h2>

              <p>
                {foods.length > 0
                  ? `Tìm thấy ${foods.length} món ăn`
                  : "Các món ăn hiện có trên hệ thống"}
              </p>
            </div>
          </div>

          {foods.length === 0 ? (
            <div className="tf-no-foods">
              <div className="tf-no-foods-icon">🍽️</div>

              <div>
                {selectedCategory
                  ? "Chưa có món ăn nào trong danh mục này"
                  : "Chưa có món ăn nào"}
              </div>
            </div>
          ) : (
            <div className="tf-food-grid">
              {foods.map((food) => {
                const reviews = reviewsByFood[food.id] || [];

                const averageRating = reviews.length
                  ? reviews.reduce(
                      (sum, review) =>
                        sum + Number(review.rating || 0),
                      0
                    ) / reviews.length
                  : 0;

                const previewReviews = reviews.slice(0, 3);

                const isFoodExpanded =
                  expandedFoodId === food.id;

                const isReviewExpanded =
                  expandedReviewFoodId === food.id;

                return (
                  <article
                    key={food.id}
                    className="tf-food-card"
                  >
                    {/* IMAGE */}
                    <div className="tf-food-image-wrap">
                      {food.image ? (
                        <img
                          src={getImageUrl(food.image)}
                          alt={food.name}
                          className="tf-food-image"
                        />
                      ) : (
                        <div className="tf-food-image-placeholder">
                          🍽️
                        </div>
                      )}
                    </div>

                    <div className="tf-food-content">

                      {/* FOOD INFORMATION */}
                      <div className="tf-food-top">
                        <div>
                          <h3 className="tf-food-name">
                            {food.name}
                          </h3>

                          <div className="tf-food-restaurant">
                            {food.Restaurant?.name ||
                              "Chưa có nhà hàng"}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="tf-food-info-button"
                          onClick={() =>
                            setExpandedFoodId((current) =>
                              current === food.id
                                ? null
                                : food.id
                            )
                          }
                        >
                          {isFoodExpanded
                            ? "Thu gọn"
                            : "Nhà hàng"}
                        </button>
                      </div>

                      <div className="tf-food-price">
                        {Number(food.price || 0).toLocaleString("vi-VN")} đ
                      </div>

                      {/* RESTAURANT DETAILS */}
                      {isFoodExpanded && (
                        <div className="tf-restaurant-info">
                          <strong>
                            {food.Restaurant?.name ||
                              "Chưa có thông tin nhà hàng"}
                          </strong>

                          <div>
                            Địa chỉ:{" "}
                            {food.Restaurant?.address ||
                              "Chưa có địa chỉ"}
                          </div>
                        </div>
                      )}

                      {/* REVIEW SUMMARY */}
                      <div className="tf-review-summary">
                        <div className="tf-review-title">
                          Đánh giá:{" "}
                          {reviews.length
                            ? averageRating.toFixed(1)
                            : "Chưa có"}{" "}
                          / 5
                        </div>

                        <div className="tf-review-stars">
                          {reviews.length
                            ? renderStars(averageRating)
                            : "Chưa có đánh giá"}
                        </div>

                        <div className="tf-review-bottom">
                          <span>
                            {reviews.length} lượt đánh giá
                          </span>

                          {reviews.length > 0 && (
                            <button
                              type="button"
                              className="tf-review-toggle"
                              onClick={() =>
                                setExpandedReviewFoodId(
                                  (current) =>
                                    current === food.id
                                      ? null
                                      : food.id
                                )
                              }
                            >
                              {isReviewExpanded
                                ? "Ẩn bình luận"
                                : "Xem bình luận"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ADD TO CART */}
                      <button
                        type="button"
                        className="tf-add-cart"
                        disabled={addingFoodId === food.id}
                        onClick={() => addToCart(food)}
                      >
                        {addingFoodId === food.id
                          ? "Đang thêm..."
                          : "+ Thêm vào giỏ hàng"}
                      </button>
                    </div>

                    {/* REVIEW COMMENTS */}
                    {isReviewExpanded &&
                      previewReviews.length > 0 && (
                        <div className="tf-review-list">
                          {previewReviews.map((review) => (
                            <div
                              key={review.id}
                              className="tf-review-item"
                            >
                              <div className="tf-review-item-header">
                                <div className="tf-review-user">
                                  {review.User?.name ||
                                    "Khách hàng"}
                                </div>

                                <div className="tf-review-stars">
                                  {renderStars(review.rating)}
                                </div>
                              </div>

                              <div className="tf-review-comment">
                                {review.comment ||
                                  "Không có nội dung"}
                              </div>

                              {review.admin_reply && (
                                <div className="tf-admin-reply">
                                  <strong>
                                    Phản hồi từ Admin
                                  </strong>

                                  <div>
                                    {review.admin_reply}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {reviews.length > previewReviews.length && (
                            <div className="tf-review-comment">
                              Còn{" "}
                              {reviews.length - previewReviews.length}{" "}
                              bình luận khác.
                            </div>
                          )}
                        </div>
                      )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
