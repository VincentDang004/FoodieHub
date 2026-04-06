import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const initialFoodForm = { name: "", price: "", image: "" };
const initialCategoryForm = { name: "" };
const initialRestaurantForm = { name: "", address: "" };

const sectionTitleStyle = {
  color: "white",
  fontSize: "2.5rem",
  textAlign: "center",
  margin: "20px 0 30px"
};

const tabs = [
  { key: "restaurants", label: "Quản lý nhà hàng" },
  { key: "categories", label: "Quản lý danh mục" },
  { key: "foods", label: "Quản lý món ăn" },
  { key: "orders", label: "Duyệt đơn hàng" }
];

export default function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [foodForm, setFoodForm] = useState(initialFoodForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [restaurantForm, setRestaurantForm] = useState(initialRestaurantForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [savingFood, setSavingFood] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [activeTab, setActiveTab] = useState("restaurants");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const reloadFoods = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/food");
      setFoods(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const reloadCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/categories");
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const reloadRestaurants = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/restaurants");
      setRestaurants(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");

    const loadOrders = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/orders/admin/pending", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadOrders();
    reloadFoods();
    reloadCategories();
    reloadRestaurants();

    const timer = setInterval(loadOrders, 1000);
    return () => clearInterval(timer);
  }, [navigate, user.role]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const updateOrderStatus = async (orderId, status) => {
    const token = localStorage.getItem("token");

    try {
      await axios.patch(
        `http://localhost:3001/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.filter((order) => String(order.id) !== String(orderId)));
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật đơn hàng");
    }
  };

  const startCreateFood = () => {
    setEditingFoodId(null);
    setFoodForm(initialFoodForm);
    setSelectedFile(null);
  };

  const startEditFood = (food) => {
    setEditingFoodId(food.id);
    setFoodForm({ name: food.name || "", price: food.price || "", image: food.image || "" });
    setSelectedFile(null);
  };

  const startCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(initialCategoryForm);
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name || "" });
  };

  const startCreateRestaurant = () => {
    setEditingRestaurantId(null);
    setRestaurantForm(initialRestaurantForm);
  };

  const startEditRestaurant = (restaurant) => {
    setEditingRestaurantId(restaurant.id);
    setRestaurantForm({
      name: restaurant.name || "",
      address: restaurant.address || ""
    });
  };

  const uploadImageIfNeeded = async (token) => {
    if (!selectedFile) {
      return foodForm.image || "";
    }

    const uploadForm = new FormData();
    uploadForm.append("image", selectedFile);

    const res = await axios.post("http://localhost:3001/api/upload", uploadForm, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    return `uploads/${res.data.file}`;
  };

  const submitFood = async () => {
    if (!foodForm.name.trim() || foodForm.price === "") {
      alert("Vui lòng nhập tên món ăn và giá tiền");
      return;
    }

    const token = localStorage.getItem("token");
    setSavingFood(true);

    try {
      const imagePath = await uploadImageIfNeeded(token);
      const payload = {
        name: foodForm.name.trim(),
        price: Number(foodForm.price),
        image: imagePath
      };

      if (editingFoodId) {
        await axios.put(`http://localhost:3001/api/food/${editingFoodId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Cập nhật món ăn thành công");
      } else {
        await axios.post("http://localhost:3001/api/food", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Thêm món ăn thành công");
      }

      startCreateFood();
      reloadFoods();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu món ăn");
    } finally {
      setSavingFood(false);
    }
  };

  const submitCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }

    const token = localStorage.getItem("token");
    setSavingCategory(true);

    try {
      const payload = { name: categoryForm.name.trim() };

      if (editingCategoryId) {
        await axios.put(`http://localhost:3001/api/categories/${editingCategoryId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Cập nhật danh mục thành công");
      } else {
        await axios.post("http://localhost:3001/api/categories", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Thêm danh mục thành công");
      }

      startCreateCategory();
      reloadCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu danh mục");
    } finally {
      setSavingCategory(false);
    }
  };

  const submitRestaurant = async () => {
    if (!restaurantForm.name.trim()) {
      alert("Vui lòng nhập tên nhà hàng");
      return;
    }

    const token = localStorage.getItem("token");
    setSavingRestaurant(true);

    try {
      const payload = {
        name: restaurantForm.name.trim(),
        address: restaurantForm.address.trim()
      };

      if (editingRestaurantId) {
        await axios.put(`http://localhost:3001/api/restaurants/${editingRestaurantId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Cập nhật nhà hàng thành công");
      } else {
        await axios.post("http://localhost:3001/api/restaurants", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Thêm nhà hàng thành công");
      }

      startCreateRestaurant();
      reloadRestaurants();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu nhà hàng");
    } finally {
      setSavingRestaurant(false);
    }
  };

  const deleteFood = async (foodId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Bạn có chắc muốn xóa món ăn này không?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/food/${foodId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Xóa món ăn thành công");
      if (editingFoodId === foodId) startCreateFood();
      reloadFoods();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa món ăn");
    }
  };

  const deleteCategory = async (categoryId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này không?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Xóa danh mục thành công");
      if (editingCategoryId === categoryId) startCreateCategory();
      reloadCategories();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Bạn có chắc muốn xóa nhà hàng này không?")) return;

    try {
      await axios.delete(`http://localhost:3001/api/restaurants/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Xóa nhà hàng thành công");
      if (editingRestaurantId === restaurantId) startCreateRestaurant();
      reloadRestaurants();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa nhà hàng");
    }
  };

  const tabButtonStyle = (key) => ({
    border: "none",
    borderRadius: 999,
    padding: "12px 18px",
    fontSize: "0.98rem",
    fontWeight: 700,
    cursor: "pointer",
    background: activeTab === key ? "linear-gradient(135deg, #ff6b6b, #ff8e53)" : "#fff4f5",
    color: activeTab === key ? "white" : "#444",
    boxShadow: activeTab === key ? "0 10px 24px rgba(255,107,107,0.25)" : "none"
  });

  return (
    <div className="container">
      <div className="hero-section">
        <h1 style={{ fontSize: "3rem", marginBottom: 10, textShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>
          Trang Quản trị FoodieHub
        </h1>
        <p style={{ fontSize: "1.2rem", marginBottom: 30, opacity: 0.92 }}>
          Xin chào {user.name || "Administrator"}. Chọn một mục quản lý để làm việc tập trung hơn.
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 30,
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={tabButtonStyle(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            
            <button onClick={logout} className="btn btn-danger">
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {activeTab === "restaurants" && (
        <>
          <h2 style={sectionTitleStyle}>Quản lý nhà hàng</h2>

          <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>{editingRestaurantId ? "Cập nhật nhà hàng" : "Thêm nhà hàng mới"}</h3>
                {editingRestaurantId && (
                  <button onClick={startCreateRestaurant} className="btn btn-danger">
                    Hủy sửa
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
                <input
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên nhà hàng"
                  className="input-field"
                  style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee", fontSize: 16 }}
                />
                <input
                  value={restaurantForm.address}
                  onChange={(e) => setRestaurantForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Địa chỉ"
                  className="input-field"
                  style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee", fontSize: 16 }}
                />
                <button onClick={submitRestaurant} className="btn" disabled={savingRestaurant}>
                  {savingRestaurant ? "Đang lưu..." : editingRestaurantId ? "Cập nhật nhà hàng" : "Thêm nhà hàng"}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0 }}>Danh sách nhà hàng</h3>
              {restaurants.length === 0 ? (
                <p style={{ color: "#666", marginBottom: 0 }}>Chưa có nhà hàng nào.</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 14,
                        padding: 16,
                        borderRadius: 16,
                        background: "#fff7f8"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#333" }}>{restaurant.name}</div>
                        <div style={{ color: "#666", marginTop: 6 }}>{restaurant.address || "Chưa có địa chỉ"}</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => startEditRestaurant(restaurant)} className="btn">
                          Sửa
                        </button>
                        <button onClick={() => deleteRestaurant(restaurant.id)} className="btn btn-danger">
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <>
          <h2 style={sectionTitleStyle}>Quản lý danh mục</h2>

          <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>{editingCategoryId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
                {editingCategoryId && (
                  <button onClick={startCreateCategory} className="btn btn-danger">
                    Hủy sửa
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  placeholder="Tên danh mục"
                  className="input-field"
                  style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee", fontSize: 16 }}
                />
                <button onClick={submitCategory} className="btn" disabled={savingCategory}>
                  {savingCategory ? "Đang lưu..." : editingCategoryId ? "Cập nhật danh mục" : "Thêm danh mục"}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0 }}>Danh sách danh mục</h3>
              {categories.length === 0 ? (
                <p style={{ color: "#666", marginBottom: 0 }}>Chưa có danh mục nào.</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 14,
                        padding: 16,
                        borderRadius: 16,
                        background: "#fff7f8"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#333" }}>{category.name}</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => startEditCategory(category)} className="btn">
                          Sửa
                        </button>
                        <button onClick={() => deleteCategory(category.id)} className="btn btn-danger">
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "foods" && (
        <>
          <h2 style={sectionTitleStyle}>Quản lý món ăn</h2>

          <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0 }}>{editingFoodId ? "Cập nhật món ăn" : "Thêm món ăn mới"}</h3>
                {editingFoodId && (
                  <button onClick={startCreateFood} className="btn btn-danger">
                    Hủy sửa
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
                <input
                  value={foodForm.name}
                  onChange={(e) => setFoodForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Tên món ăn"
                  className="input-field"
                  style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee", fontSize: 16 }}
                />
                <input
                  value={foodForm.price}
                  onChange={(e) => setFoodForm((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="Giá tiền"
                  type="number"
                  className="input-field"
                  style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee", fontSize: 16 }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  style={{ width: "100%", padding: 10, borderRadius: 16, border: "2px dashed #f3b3be", background: "#fff7f8" }}
                />
                {foodForm.image && !selectedFile && (
                  <img
                    src={`http://localhost:3001/${foodForm.image}`}
                    alt="Xem trước món ăn"
                    style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 16 }}
                  />
                )}
                {selectedFile && <div style={{ color: "#666", fontWeight: 600 }}>Ảnh mới: {selectedFile.name}</div>}
                <button onClick={submitFood} className="btn" disabled={savingFood}>
                  {savingFood ? "Đang lưu..." : editingFoodId ? "Cập nhật món ăn" : "Thêm món ăn"}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginTop: 0 }}>Danh sách món ăn</h3>
              {foods.length === 0 ? (
                <p style={{ color: "#666", marginBottom: 0 }}>Chưa có món ăn nào.</p>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: food.image ? "92px 1fr" : "1fr",
                        gap: 14,
                        padding: 14,
                        borderRadius: 16,
                        background: "#fff7f8",
                        alignItems: "center"
                      }}
                    >
                      {food.image && (
                        <img
                          src={`http://localhost:3001/${food.image}`}
                          alt={food.name}
                          style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 14 }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#333" }}>{food.name}</div>
                        <div className="price" style={{ margin: "6px 0 10px 0", fontSize: "1.2rem" }}>
                          ₫{Number(food.price || 0).toLocaleString()}
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button onClick={() => startEditFood(food)} className="btn">
                            Sửa
                          </button>
                          <button onClick={() => deleteFood(food.id)} className="btn btn-danger">
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === "orders" && (
        <>
          <h2 style={sectionTitleStyle}>Đơn hàng chờ duyệt thanh toán</h2>

          {orders.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: 40, marginBottom: 50 }}>
              <p style={{ fontSize: "1.1rem", color: "#666", marginBottom: 0 }}>
                Hiện tại không có đơn hàng nào đang chờ duyệt.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 24, marginBottom: 50 }}>
              {orders.map((order) => (
                <div key={order.id} className="card" style={{ padding: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap"
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Đơn hàng #{order.id}</h3>
                      <div style={{ color: "#666", marginBottom: 6 }}>Người đặt: {order.userName}</div>
                      <div style={{ color: "#666", marginBottom: 6 }}>Email: {order.userEmail}</div>
                      <div style={{ color: "#666", marginBottom: 6 }}>Tạo lúc: {order.createdAt}</div>
                      <div style={{ color: "#666" }}>Gửi thanh toán: {order.paymentRequestedAt || "Chưa có"}</div>
                    </div>
                    <div className="price" style={{ margin: 0 }}>
                      ₫{Number(order.total || 0).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
                    {order.items.map((item) => (
                      <div
                        key={`${order.id}-${item.id || item.foodId}`}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 16px",
                          borderRadius: 14,
                          background: "#fff7f8"
                        }}
                      >
                        <span style={{ color: "#444", fontWeight: 600 }}>
                          {item.name} x{item.quantity}
                        </span>
                        <strong style={{ color: "#ff6b6b" }}>₫{(item.price * item.quantity).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                    <button onClick={() => updateOrderStatus(order.id, "payment_rejected")} className="btn btn-danger">
                      Từ chối
                    </button>
                    <button onClick={() => updateOrderStatus(order.id, "paid")} className="btn">
                      Xác nhận duyệt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
