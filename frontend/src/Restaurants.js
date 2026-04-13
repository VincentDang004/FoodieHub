import { useEffect, useState } from "react";
import axios from "axios";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/restaurants");
        setRestaurants(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Lỗi tải nhà hàng");
      }
    };
    fetch();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Nhà hàng</h2>
      {restaurants.length === 0 ? (
        <p>Chưa có nhà hàng nào.</p>
      ) : (
        <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
          {restaurants.map((r) => (
            <div key={r.id || r.name} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
              <h3>{r.name}</h3>
              {r.address && <div>Địa chỉ: {r.address}</div>}
              {r.phone && <div>Điện thoại: {r.phone}</div>}
              {r.email && <div>Email: {r.email}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
