import { useEffect, useState } from "react";
import axios from "axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Lỗi tải danh mục");
      }
    };
    fetch();
  }, []);

  const fetchFoods = async (categoryName) => {
    setLoadingFoods(true);
    try {
      const res = await axios.get("http://localhost:3001/api/food", {
        params: { category: categoryName },
      });
      setFoods(res.data || []);
      setSelectedCategory(categoryName);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải món ăn theo danh mục");
    } finally {
      setLoadingFoods(false);
    }
  };

  const addToCart = (food) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(item => item.foodId === food.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ foodId: food.id, name: food.name, price: food.price, image: food.image, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartChange"));
    alert(`${food.name} đã được thêm vào giỏ`);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setFoods([]);
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <h2>Danh mục</h2>
        {selectedCategory && (
          <button onClick={clearCategory} className="btn btn-danger" style={{ minWidth: 180 }}>
            Xem tất cả danh mục
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <p>Chưa có danh mục nào.</p>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 16 }}>
          {categories.map(cat => (
            <button
              key={cat.id || cat.name}
              onClick={() => fetchFoods(cat.name)}
              style={{
                textAlign: "left",
                padding: 20,
                border: "1px solid #ddd",
                borderRadius: 16,
                background: selectedCategory === cat.name ? "#ff6b6b" : "#fff",
                color: selectedCategory === cat.name ? "#fff" : "#333",
                cursor: "pointer",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{cat.name}</div>
              </div>
              <div style={{ marginTop: 12, opacity: 0.7 }}>
                Nhấn để xem món ăn trong danh mục này
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedCategory && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 20 }}>Món ăn trong danh mục: {selectedCategory}</h3>

          {loadingFoods ? (
            <p>Đang tải món ăn...</p>
          ) : foods.length === 0 ? (
            <p>Không tìm thấy món ăn cho danh mục này.</p>
          ) : (
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {foods.map(food => (
                <div key={food.id} className="card" style={{ overflow: "hidden", minHeight: 360, display: "flex", flexDirection: "column" }}>
                  {food.image && (
                    <img
                      src={`http://localhost:3001/${food.image}`}
                      alt={food.name}
                      style={{ width: "100%", height: 180, objectFit: "cover" }}
                    />
                  )}
                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ margin: "0 0 12px 0" }}>{food.name}</h4>
                      <p style={{ margin: 0, color: "#ff6b6b", fontWeight: 700 }}>{food.price?.toLocaleString ? `₫${food.price.toLocaleString()}` : food.price}</p>
                    </div>
                    <button onClick={() => addToCart(food)} className="btn" style={{ marginTop: 16 }}>
                      🛒 Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
