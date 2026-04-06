import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/");
      return;
    }

    const fetchFoods = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/food", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFoods(res.data || []);
      } catch (err) {
        console.error("Lỗi:", err);
        alert("Lỗi tải danh sách đồ ăn");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [nav]);

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

  if (loading) return <div className="loading">Đang tải món ăn ngon...</div>;

  return (
    <div className="container">
      <div className="hero-section">
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', textShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>🍽️ Chào mừng đến với FoodieHub</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.9 }}>Khám phá những món ăn ngon nhất từ các nhà hàng hàng đầu</p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => nav("/restaurants")} className="btn" style={{ fontSize: '1.1rem' }}>🏪 Xem Nhà Hàng</button>
          <button onClick={() => nav("/categories")} className="btn btn-danger" style={{ fontSize: '1.1rem' }}>📂 Danh Mục</button>
        </div>
      </div>

      <h2 style={{ color: 'white', fontSize: '2.5rem', textAlign: 'center', margin: '50px 0 30px' }}>🍔 Danh sách món ăn tuyệt vời</h2>

      {foods.length === 0 ? (
        <p style={{ color: 'white', textAlign: 'center' }}>Chưa có món ăn nào</p>
      ) : (
        <div className="grid">
          {foods.map(f => (
            <div key={f.id} className="card">
              {f.image && <img src={`http://localhost:3001/${f.image}`} alt={f.name} style={{ width: "100%", height: 220, objectFit: "cover" }} />}
              <div style={{ padding: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '1.3rem' }}>{f.name}</h3>
                <p className="price">₫{f.price?.toLocaleString()}</p>
                <button onClick={() => addToCart(f)} className="btn" style={{ width: '100%', marginTop: '15px' }}>🛒 Thêm vào giỏ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
