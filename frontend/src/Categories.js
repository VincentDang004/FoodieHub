import { useEffect, useState } from "react";
import axios from "axios";
import { addCartItem } from "./cartApi";

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
        alert("L\u1ed7i t\u1ea3i danh m\u1ee5c");
      }
    };
    fetch();
  }, []);

  const fetchFoods = async (category) => {
    setLoadingFoods(true);
    try {
      const res = await axios.get("http://localhost:3001/api/food", {
        params: { category_id: category.id, category_name: category.name }
      });
      setFoods(res.data || []);
      setSelectedCategory(category);
    } catch (err) {
      console.error(err);
      alert("L\u1ed7i t\u1ea3i m\u00f3n \u0103n theo danh m\u1ee5c");
    } finally {
      setLoadingFoods(false);
    }
  };

  const addToCart = async (food) => {
    try {
      await addCartItem(food.id, 1);
      alert(`${food.name} \u0111\u00e3 \u0111\u01b0\u1ee3c th\u00eam v\u00e0o gi\u1ecf`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Kh\u00f4ng th\u1ec3 th\u00eam v\u00e0o gi\u1ecf");
    }
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    setFoods([]);
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <h2>{"Danh m\u1ee5c"}</h2>
        {selectedCategory && (
          <button onClick={clearCategory} className="btn btn-danger" style={{ minWidth: 180 }}>
            {"Xem t\u1ea5t c\u1ea3 danh m\u1ee5c"}
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <p>{"Ch\u01b0a c\u00f3 danh m\u1ee5c n\u00e0o."}</p>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 16 }}>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.name}
              onClick={() => fetchFoods(cat)}
              style={{
                textAlign: "left",
                padding: 20,
                border: "1px solid #ddd",
                borderRadius: 16,
                background: selectedCategory?.id === cat.id ? "#ff6b6b" : "#fff",
                color: selectedCategory?.id === cat.id ? "#fff" : "#333",
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
                {"Nh\u1ea5n \u0111\u1ec3 xem m\u00f3n \u0103n trong danh m\u1ee5c n\u00e0y"}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedCategory && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 20 }}>{"M\u00f3n \u0103n trong danh m\u1ee5c: "}{selectedCategory.name}</h3>

          {loadingFoods ? (
            <p>{"\u0110ang t\u1ea3i m\u00f3n \u0103n..."}</p>
          ) : foods.length === 0 ? (
            <p>{"Kh\u00f4ng t\u00ecm th\u1ea5y m\u00f3n \u0103n cho danh m\u1ee5c n\u00e0y."}</p>
          ) : (
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {foods.map((food) => (
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
                      <p style={{ margin: 0, color: "#ff6b6b", fontWeight: 700 }}>
                        {food.price?.toLocaleString ? `${food.price.toLocaleString()} VND` : food.price}
                      </p>
                    </div>
                    <button onClick={() => addToCart(food)} className="btn" style={{ marginTop: 16 }}>
                      {"Th\u00eam v\u00e0o gi\u1ecf"}
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
