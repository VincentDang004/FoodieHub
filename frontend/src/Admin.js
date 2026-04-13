import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const tabs = [
  ["restaurants", "Quản lý nhà hàng"],
  ["addresses", "Quản lý địa chỉ"],
  ["reviews", "Quản lý review"],
  ["categories", "Quản lý danh mục"],
  ["foods", "Quản lý món ăn"],
  ["vouchers", "Quản lý voucher"],
  ["payments", "Quản lý thanh toán"],
  ["details", "Chi tiết đơn"],
  ["orders", "Duyệt đơn hàng"]
];

const sectionTitleStyle = { color: "white", fontSize: "2.5rem", textAlign: "center", margin: "20px 0 30px" };
const initialFoodForm = { name: "", price: "", image: "", category_id: "", restaurant_id: "" };
const initialCategoryForm = { name: "" };
const initialRestaurantForm = { name: "", address: "" };
const initialVoucherForm = { code: "", discount: "" };
const initialAddressForm = { id: "", user_id: "", address: "" };

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

export default function Admin() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [activeTab, setActiveTab] = useState("restaurants");
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);

  const [foodForm, setFoodForm] = useState(initialFoodForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [restaurantForm, setRestaurantForm] = useState(initialRestaurantForm);
  const [voucherForm, setVoucherForm] = useState(initialVoucherForm);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [reviewReplyForms, setReviewReplyForms] = useState({});

  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [editingVoucherId, setEditingVoucherId] = useState(null);

  const [savingFood, setSavingFood] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);
  const [savingVoucher, setSavingVoucher] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingReplyId, setSavingReplyId] = useState(null);

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

  const renderCollection = (rows, renderItem, emptyText) =>
    rows.length === 0 ? <p style={{ color: "#666", marginBottom: 0 }}>{emptyText}</p> : <div style={{ display: "grid", gap: 16 }}>{rows.map(renderItem)}</div>;

  const removeByApi = async (url, message, reload) => {
    if (!window.confirm(message)) return;
    try {
      await axios.delete(url, authConfig);
      await reload();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa");
    }
  };

  const reloadFoods = async () => {
    try { setFoods((await axios.get("http://localhost:3001/api/food")).data || []); } catch (error) { console.error(error); }
  };
  const reloadCategories = async () => {
    try { setCategories((await axios.get("http://localhost:3001/api/categories")).data || []); } catch (error) { console.error(error); }
  };
  const reloadRestaurants = async () => {
    try { setRestaurants((await axios.get("http://localhost:3001/api/restaurants")).data || []); } catch (error) { console.error(error); }
  };
  const reloadAddresses = async () => {
    try { setAddresses((await axios.get("http://localhost:3001/api/addresses", authConfig)).data || []); } catch (error) { console.error(error); }
  };
  const reloadReviews = async () => {
    try { setReviews((await axios.get("http://localhost:3001/api/reviews", authConfig)).data || []); } catch (error) { console.error(error); }
  };
  const reloadVouchers = async () => {
    try { setVouchers((await axios.get("http://localhost:3001/api/vouchers")).data || []); } catch (error) { console.error(error); }
  };
  const reloadPayments = async () => {
    try { setPayments((await axios.get("http://localhost:3001/api/payments", authConfig)).data || []); } catch (error) { console.error(error); }
  };
  useEffect(() => {
    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    const effectAuthConfig = { headers: { Authorization: `Bearer ${token}` } };

    const loadOrders = async () => {
      try { setOrders((await axios.get("http://localhost:3001/api/orders/admin/pending", effectAuthConfig)).data || []); } catch (error) { console.error(error); }
    };

    const loadInitialData = async () => {
      try {
        const [
          foodsRes,
          categoriesRes,
          restaurantsRes,
          addressesRes,
          reviewsRes,
          vouchersRes,
          paymentsRes,
          orderDetailsRes
        ] = await Promise.all([
          axios.get("http://localhost:3001/api/food"),
          axios.get("http://localhost:3001/api/categories"),
          axios.get("http://localhost:3001/api/restaurants"),
          axios.get("http://localhost:3001/api/addresses", effectAuthConfig),
          axios.get("http://localhost:3001/api/reviews", effectAuthConfig),
          axios.get("http://localhost:3001/api/vouchers"),
          axios.get("http://localhost:3001/api/payments", effectAuthConfig),
          axios.get("http://localhost:3001/api/order-details", effectAuthConfig)
        ]);

        setFoods(foodsRes.data || []);
        setCategories(categoriesRes.data || []);
        setRestaurants(restaurantsRes.data || []);
        setAddresses(addressesRes.data || []);
        setReviews(reviewsRes.data || []);
        setVouchers(vouchersRes.data || []);
        setPayments(paymentsRes.data || []);
        setOrderDetails(orderDetailsRes.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadOrders();
    loadInitialData();

    const timer = setInterval(loadOrders, 1000);
    return () => clearInterval(timer);
  }, [navigate, token, user.role]);

  useEffect(() => {
    if (user.role !== "admin") return;

    const effectAuthConfig = { headers: { Authorization: `Bearer ${token}` } };

    const loadActiveTabData = async () => {
      try {
        if (activeTab === "addresses") {
          setAddresses((await axios.get("http://localhost:3001/api/addresses", effectAuthConfig)).data || []);
        }
        if (activeTab === "reviews") {
          setReviews((await axios.get("http://localhost:3001/api/reviews", effectAuthConfig)).data || []);
        }
        if (activeTab === "vouchers") {
          setVouchers((await axios.get("http://localhost:3001/api/vouchers")).data || []);
        }
        if (activeTab === "payments") {
          setPayments((await axios.get("http://localhost:3001/api/payments", effectAuthConfig)).data || []);
        }
        if (activeTab === "details") {
          setOrderDetails((await axios.get("http://localhost:3001/api/order-details", effectAuthConfig)).data || []);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadActiveTabData();
  }, [activeTab, token, user.role]);

  useEffect(() => {
    if (user.role !== "admin" || activeTab !== "reviews") return;

    const effectAuthConfig = { headers: { Authorization: `Bearer ${token}` } };

    const refreshReviews = async () => {
      try {
        setReviews((await axios.get("http://localhost:3001/api/reviews", effectAuthConfig)).data || []);
      } catch (error) {
        console.error(error);
      }
    };

    const timer = setInterval(refreshReviews, 3000);
    return () => clearInterval(timer);
  }, [activeTab, token, user.role]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`http://localhost:3001/api/orders/${orderId}/status`, { status }, authConfig);
      setOrders((prev) => prev.filter((order) => String(order.id) !== String(orderId)));
      reloadPayments();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật đơn hàng");
    }
  };

  const uploadImageIfNeeded = async () => {
    if (!selectedFile) return foodForm.image || "";
    const uploadForm = new FormData();
    uploadForm.append("image", selectedFile);
    const res = await axios.post("http://localhost:3001/api/upload", uploadForm, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    });
    return `uploads/${res.data.file}`;
  };

  const submitFood = async () => {
    if (!foodForm.name.trim() || foodForm.price === "") return alert("Vui lòng nhập tên món ăn và giá tiền");
    setSavingFood(true);
    try {
      const payload = {
        name: foodForm.name.trim(),
        price: Number(foodForm.price),
        image: await uploadImageIfNeeded(),
        category_id: foodForm.category_id ? Number(foodForm.category_id) : null,
        restaurant_id: foodForm.restaurant_id ? Number(foodForm.restaurant_id) : null
      };
      if (editingFoodId) await axios.put(`http://localhost:3001/api/food/${editingFoodId}`, payload, authConfig);
      else await axios.post("http://localhost:3001/api/food", payload, authConfig);
      setEditingFoodId(null);
      setFoodForm(initialFoodForm);
      setSelectedFile(null);
      reloadFoods();
    } catch (error) { alert(error.response?.data?.message || "Không thể lưu món ăn"); } finally { setSavingFood(false); }
  };

  const submitCategory = async () => {
    if (!categoryForm.name.trim()) return alert("Vui lòng nhập tên danh mục");
    setSavingCategory(true);
    try {
      const payload = { name: categoryForm.name.trim() };
      if (editingCategoryId) await axios.put(`http://localhost:3001/api/categories/${editingCategoryId}`, payload, authConfig);
      else await axios.post("http://localhost:3001/api/categories", payload, authConfig);
      setEditingCategoryId(null);
      setCategoryForm(initialCategoryForm);
      reloadCategories();
    } catch (error) { alert(error.response?.data?.message || "Không thể lưu danh mục"); } finally { setSavingCategory(false); }
  };

  const submitRestaurant = async () => {
    if (!restaurantForm.name.trim()) return alert("Vui lòng nhập tên nhà hàng");
    setSavingRestaurant(true);
    try {
      const payload = { name: restaurantForm.name.trim(), address: restaurantForm.address.trim() };
      if (editingRestaurantId) await axios.put(`http://localhost:3001/api/restaurants/${editingRestaurantId}`, payload, authConfig);
      else await axios.post("http://localhost:3001/api/restaurants", payload, authConfig);
      setEditingRestaurantId(null);
      setRestaurantForm(initialRestaurantForm);
      reloadRestaurants();
    } catch (error) { alert(error.response?.data?.message || "Không thể lưu nhà hàng"); } finally { setSavingRestaurant(false); }
  };

  const submitVoucher = async () => {
    if (!voucherForm.code.trim() || voucherForm.discount === "") return alert("Vui lòng nhập mã voucher và phần trăm giảm");
    setSavingVoucher(true);
    try {
      const payload = { code: voucherForm.code.trim().toUpperCase(), discount: Number(voucherForm.discount) };
      if (editingVoucherId) await axios.put(`http://localhost:3001/api/vouchers/${editingVoucherId}`, payload, authConfig);
      else await axios.post("http://localhost:3001/api/vouchers", payload, authConfig);
      setEditingVoucherId(null);
      setVoucherForm(initialVoucherForm);
      reloadVouchers();
    } catch (error) { alert(error.response?.data?.message || "Không thể lưu voucher"); } finally { setSavingVoucher(false); }
  };

  const submitAddressByAdmin = async () => {
    if (!addressForm.id || !addressForm.user_id || !addressForm.address.trim()) {
      return alert("Vui lòng chọn địa chỉ cần sửa và nhập đủ dữ liệu");
    }
    setSavingAddress(true);
    try {
      await axios.put(`http://localhost:3001/api/addresses/admin/${addressForm.id}`, {
        user_id: Number(addressForm.user_id),
        address: addressForm.address.trim()
      }, authConfig);
      setAddressForm(initialAddressForm);
      reloadAddresses();
    } catch (error) { alert(error.response?.data?.message || "Không thể cập nhật địa chỉ"); } finally { setSavingAddress(false); }
  };

  const getReviewReplyValue = (review) =>
    Object.prototype.hasOwnProperty.call(reviewReplyForms, review.id)
      ? reviewReplyForms[review.id]
      : (review.admin_reply || "");

  const submitReviewReply = async (review) => {
    setSavingReplyId(review.id);
    try {
      const admin_reply = getReviewReplyValue(review).trim();
      await axios.patch(`http://localhost:3001/api/reviews/admin/${review.id}/reply`, { admin_reply }, authConfig);
      setReviewReplyForms((prev) => ({ ...prev, [review.id]: admin_reply }));
      await reloadReviews();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể lưu phản hồi review");
    } finally {
      setSavingReplyId(null);
    }
  };

  const clearReviewReply = async (reviewId) => {
    setSavingReplyId(reviewId);
    try {
      await axios.patch(`http://localhost:3001/api/reviews/admin/${reviewId}/reply`, { admin_reply: "" }, authConfig);
      setReviewReplyForms((prev) => ({ ...prev, [reviewId]: "" }));
      await reloadReviews();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xóa phản hồi review");
    } finally {
      setSavingReplyId(null);
    }
  };

  return (
    <div className="container">
      <div className="hero-section">
        <h1 style={{ fontSize: "3rem", marginBottom: 10, textShadow: "0 4px 8px rgba(0,0,0,0.2)" }}>Trang Quản trị FoodieHub</h1>
        <p style={{ fontSize: "1.2rem", marginBottom: 30, opacity: 0.92 }}>Xin chào {user.name || "Administrator"}.</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 30, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map(([key, label]) => <button key={key} onClick={() => setActiveTab(key)} style={tabButtonStyle(key)}>{label}</button>)}
          </div>
          <button onClick={logout} className="btn btn-danger">Đăng xuất</button>
        </div>
      </div>

      {activeTab === "restaurants" && <>
        <h2 style={sectionTitleStyle}>Quản lý nhà hàng</h2>
        <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
          <div className="card" style={{ padding: 24 }}>
            <h3>{editingRestaurantId ? "Cập nhật nhà hàng" : "Thêm nhà hàng mới"}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <input value={restaurantForm.name} onChange={(e) => setRestaurantForm((p) => ({ ...p, name: e.target.value }))} placeholder="Tên nhà hàng" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <input value={restaurantForm.address} onChange={(e) => setRestaurantForm((p) => ({ ...p, address: e.target.value }))} placeholder="Địa chỉ" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <button onClick={submitRestaurant} className="btn" disabled={savingRestaurant}>{savingRestaurant ? "Đang lưu..." : "Lưu nhà hàng"}</button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3>Danh sách nhà hàng</h3>
            {renderCollection(restaurants, (restaurant) => <div key={restaurant.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 16, borderRadius: 16, background: "#fff7f8" }}>
              <div><div style={{ fontWeight: 700 }}>{restaurant.name}</div><div style={{ color: "#666", marginTop: 6 }}>{restaurant.address || "Chưa có địa chỉ"}</div></div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => { setEditingRestaurantId(restaurant.id); setRestaurantForm({ name: restaurant.name || "", address: restaurant.address || "" }); }} className="btn">Sửa</button>
                <button onClick={() => removeByApi(`http://localhost:3001/api/restaurants/${restaurant.id}`, "Bạn có chắc muốn xóa nhà hàng này không?", reloadRestaurants)} className="btn btn-danger">Xóa</button>
              </div>
            </div>, "Chưa có nhà hàng nào.")}
          </div>
        </div>
      </>}

      {/* {activeTab === "addresses" && <>
        <h2 style={sectionTitleStyle}>Quản lý địa chỉ</h2>
        <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>

          <div className="card" style={{ padding: 24 }}>
            <h3>Danh sách địa chỉ</h3>
            {renderCollection(addresses, (row) => <div key={row.id} style={{ padding: 18, borderRadius: 16, background: "#fff7f8", display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 700 }}>{row.User?.name || "Người dùng không rõ"} (user #{row.user_id})</div>
              <div style={{ color: "#666" }}>Email: {row.User?.email || "Chưa có"}</div>
              <div style={{ color: "#333" }}>Địa chỉ: {row.address || "Chưa có địa chỉ"}</div>

            </div>, "Chưa có địa chỉ người dùng nào.")}
          </div>
        </div>
      </>} */}

      {activeTab === "addresses" && (
        /* Thêm div bọc ngoài cùng để căn giữa toàn bộ nội dung */
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
          <h2 style={sectionTitleStyle}>Quản lý địa chỉ</h2>
          <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
            <div className="card" style={{ padding: 24 }}>
              <h3>Danh sách địa chỉ</h3>
              {renderCollection(
                addresses,
                (row) => (
                  <div
                    key={row.id}
                    style={{
                      padding: 18,
                      borderRadius: 16,
                      background: "#fff7f8",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {row.User?.name || "Người dùng không rõ"} (user #{row.user_id})
                    </div>
                    <div style={{ color: "#666" }}>
                      Email: {row.User?.email || "Chưa có"}
                    </div>
                    <div style={{ color: "#333" }}>
                      Địa chỉ: {row.address || "Chưa có địa chỉ"}
                    </div>
                  </div>
                ),
                "Chưa có địa chỉ người dùng nào."
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && <>
        <h2 style={sectionTitleStyle}>Quản lý review</h2>
        <div className="card" style={{ padding: 24, marginBottom: 40 }}>
          <h3>Danh sách review</h3>
          {renderCollection(reviews, (review) => <div key={review.id} style={{ padding: 18, borderRadius: 16, background: "#fff7f8", display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>{review.User?.name || "Người dùng không rõ"} - {review.Food?.name || "Món ăn không rõ"}</div>
            <div style={{ color: "#666" }}>Email: {review.User?.email || "Chưa có"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ color: "#666" }}>Đánh giá:</span>
              <span style={{ color: "#ffb400", fontSize: "1.2rem", letterSpacing: 1 }}>
                {renderStars(review.rating)}
              </span>
            </div>
            <div style={{ color: "#333" }}>Nhận xét: {review.comment || "Không có nội dung"}</div>
            {review.admin_reply && <div style={{ padding: 12, borderRadius: 12, background: "#eef6ff", border: "1px solid #d3e6ff", color: "#0b5394" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Phản hồi hiện tại</div>
              <div style={{ lineHeight: 1.6 }}>{review.admin_reply}</div>
            </div>}
            <textarea
              value={getReviewReplyValue(review)}
              onChange={(e) => setReviewReplyForms((prev) => ({ ...prev, [review.id]: e.target.value }))}
              rows={3}
              placeholder="Nhập phản hồi cho review này"
              className="input-field"
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "2px solid #eee", resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => submitReviewReply(review)} className="btn" disabled={savingReplyId === review.id}>
                {savingReplyId === review.id ? "Đang lưu..." : review.admin_reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
              </button>
              {review.admin_reply && (
                <button onClick={() => clearReviewReply(review.id)} className="btn" disabled={savingReplyId === review.id}>
                  Xóa phản hồi
                </button>
              )}
              <button onClick={() => removeByApi(`http://localhost:3001/api/reviews/admin/${review.id}`, "Bạn có chắc muốn xóa review này không?", reloadReviews)} className="btn btn-danger">Xóa review</button>
            </div>
          </div>, "Chưa có review nào.")}
        </div>
      </>}

      {activeTab === "categories" && <>
        <h2 style={sectionTitleStyle}>Quản lý danh mục</h2>
        <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
          <div className="card" style={{ padding: 24 }}>
            <h3>{editingCategoryId ? "Cập nhật danh mục" : "Thêm danh mục mới"}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <input value={categoryForm.name} onChange={(e) => setCategoryForm({ name: e.target.value })} placeholder="Tên danh mục" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <button onClick={submitCategory} className="btn" disabled={savingCategory}>{savingCategory ? "Đang lưu..." : "Lưu danh mục"}</button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3>Danh sách danh mục</h3>
            {renderCollection(categories, (category) => <div key={category.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 16, borderRadius: 16, background: "#fff7f8" }}>
              <div style={{ fontWeight: 700 }}>{category.name}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => { setEditingCategoryId(category.id); setCategoryForm({ name: category.name || "" }); }} className="btn">Sửa</button>
                <button onClick={() => removeByApi(`http://localhost:3001/api/categories/${category.id}`, "Bạn có chắc muốn xóa danh mục này không?", reloadCategories)} className="btn btn-danger">Xóa</button>
              </div>
            </div>, "Chưa có danh mục nào.")}
          </div>
        </div>
      </>}

      {activeTab === "foods" && <>
        <h2 style={sectionTitleStyle}>Quản lý món ăn</h2>
        <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
          <div className="card" style={{ padding: 24 }}>
            <h3>{editingFoodId ? "Cập nhật món ăn" : "Thêm món ăn mới"}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <input value={foodForm.name} onChange={(e) => setFoodForm((p) => ({ ...p, name: e.target.value }))} placeholder="Tên món ăn" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <input value={foodForm.price} onChange={(e) => setFoodForm((p) => ({ ...p, price: e.target.value }))} placeholder="Giá tiền" type="number" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <select value={foodForm.category_id} onChange={(e) => setFoodForm((p) => ({ ...p, category_id: e.target.value }))} className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }}>
                <option value="">Chọn danh mục cho món ăn</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <select value={foodForm.restaurant_id} onChange={(e) => setFoodForm((p) => ({ ...p, restaurant_id: e.target.value }))} className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }}>
                <option value="">Chọn nhà hàng cho món ăn</option>
                {restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ width: "100%", padding: 10, borderRadius: 16, border: "2px dashed #f3b3be", background: "#fff7f8" }} />
              <button onClick={submitFood} className="btn" disabled={savingFood}>{savingFood ? "Đang lưu..." : "Lưu món ăn"}</button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3>Danh sách món ăn</h3>
            {renderCollection(foods, (food) => <div key={food.id} style={{ display: "grid", gridTemplateColumns: food.image ? "92px 1fr" : "1fr", gap: 14, padding: 14, borderRadius: 16, background: "#fff7f8", alignItems: "center" }}>
              {food.image && <img src={`http://localhost:3001/${food.image}`} alt={food.name} style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 14 }} />}
              <div>
                <div style={{ fontWeight: 700 }}>{food.name}</div>
                <div className="price" style={{ margin: "6px 0 10px 0" }}>{Number(food.price || 0).toLocaleString()} VND</div>
                <div style={{ color: "#666", marginBottom: 6 }}>Danh mục: {food.Category?.name || "Chưa gán danh mục"}</div>
                <div style={{ color: "#666", marginBottom: 10 }}>Nhà hàng: {food.Restaurant?.name || "Chưa gán nhà hàng"}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => { setEditingFoodId(food.id); setFoodForm({ name: food.name || "", price: food.price || "", image: food.image || "", category_id: food.category_id || food.Category?.id || "", restaurant_id: food.restaurant_id || food.Restaurant?.id || "" }); setSelectedFile(null); }} className="btn">Sửa</button>
                  <button onClick={() => removeByApi(`http://localhost:3001/api/food/${food.id}`, "Bạn có chắc muốn xóa món ăn này không?", reloadFoods)} className="btn btn-danger">Xóa</button>
                </div>
              </div>
            </div>, "Chưa có món ăn nào.")}
          </div>
        </div>
      </>}

      {activeTab === "vouchers" && <>
        <h2 style={sectionTitleStyle}>Quản lý voucher</h2>
        <div className="grid" style={{ marginBottom: 30, alignItems: "start" }}>
          <div className="card" style={{ padding: 24 }}>
            <h3>{editingVoucherId ? "Cập nhật voucher" : "Thêm voucher mới"}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              <input value={voucherForm.code} onChange={(e) => setVoucherForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="Mã voucher" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <input value={voucherForm.discount} onChange={(e) => setVoucherForm((p) => ({ ...p, discount: e.target.value }))} placeholder="Phần trăm giảm" type="number" className="input-field" style={{ width: "100%", padding: 14, borderRadius: 16, border: "2px solid #eee" }} />
              <button onClick={submitVoucher} className="btn" disabled={savingVoucher}>{savingVoucher ? "Đang lưu..." : "Lưu voucher"}</button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3>Danh sách voucher</h3>
            {renderCollection(vouchers, (voucher) => <div key={voucher.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 16, borderRadius: 16, background: "#fff7f8" }}>
              <div><div style={{ fontWeight: 700 }}>{voucher.code}</div><div style={{ color: "#666", marginTop: 6 }}>Giảm {Number(voucher.discount || 0).toLocaleString()}%</div></div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => { setEditingVoucherId(voucher.id); setVoucherForm({ code: voucher.code || "", discount: voucher.discount || "" }); }} className="btn">Sửa</button>
                <button onClick={() => removeByApi(`http://localhost:3001/api/vouchers/${voucher.id}`, "Bạn có chắc muốn xóa voucher này không?", reloadVouchers)} className="btn btn-danger">Xóa</button>
              </div>
            </div>, "Chưa có voucher nào.")}
          </div>
        </div>
      </>}

      {activeTab === "payments" && <>
        <h2 style={sectionTitleStyle}>Quản lý thanh toán</h2>
        <div className="card" style={{ padding: 24, marginBottom: 40 }}>
          <h3>Dữ liệu bảng payments</h3>
          {renderCollection(payments, (payment) => <div key={payment.id} style={{ padding: 18, borderRadius: 16, background: "#fff7f8", display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Thanh toán #{payment.id} cho đơn #{payment.order_id}</div>
            <div style={{ color: "#666" }}>Người dùng: {payment.Order?.User?.name || "Không rõ"} - {payment.Order?.User?.email || "Chưa có"}</div>
            <div style={{ color: "#666" }}>Phương thức: {payment.method || "Chưa có"}</div>
            <div style={{ color: "#666" }}>Trạng thái payment: {payment.status || "Chưa có"}</div>
            <div style={{ color: "#666" }}>Trạng thái order: {payment.Order?.status || "Chưa có"}</div>
            <div style={{ color: "#666" }}>Yêu cầu lúc: {payment.requested_at || "Chưa có"}</div>
            <div style={{ color: "#666" }}>Xử lý lúc: {payment.reviewed_at || "Chưa có"}</div>
            <div style={{ color: "#333" }}>Ghi chú: {payment.note || "Không có"}</div>
          </div>, "Chưa có bản ghi thanh toán nào.")}
        </div>
      </>}

      {activeTab === "details" && <>
        <h2 style={sectionTitleStyle}>Chi tiết đơn</h2>
        <div className="card" style={{ padding: 24, marginBottom: 40 }}>
          <h3>Dữ liệu bảng order_details</h3>
          {renderCollection(orderDetails, (detail) => <div key={detail.id} style={{ padding: 18, borderRadius: 16, background: "#fff7f8", display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Chi tiết #{detail.id} - Đơn #{detail.order_id}</div>
            <div style={{ color: "#666" }}>Food ID: {detail.food_id || "Chưa có"} - {detail.Food?.name || "Món không rõ"}</div>
            <div style={{ color: "#666" }}>Số lượng: {detail.quantity}</div>
            <div style={{ color: "#666" }}>Trạng thái đơn: {detail.Order?.status || "Chưa có"}</div>
            <div style={{ color: "#666" }}>Tổng đơn: {Number(detail.Order?.total || 0).toLocaleString()} VND</div>
          </div>, "Chưa có dòng order_details nào.")}
        </div>
      </>}

      {activeTab === "orders" && <>
        <h2 style={sectionTitleStyle}>Đơn hàng chờ duyệt thanh toán</h2>
        {orders.length === 0 ? <div className="card" style={{ textAlign: "center", padding: 40, marginBottom: 50 }}><p style={{ fontSize: "1.1rem", color: "#666", marginBottom: 0 }}>Hiện tại không có đơn hàng nào đang chờ duyệt.</p></div> :
          <div style={{ display: "grid", gap: 24, marginBottom: 50 }}>
            {orders.map((order) => <div key={order.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Đơn hàng #{order.id}</h3>
                  <div style={{ color: "#666", marginBottom: 6 }}>Người đặt: {order.userName}</div>
                  <div style={{ color: "#666", marginBottom: 6 }}>Email: {order.userEmail}</div>
                  <div style={{ color: "#666", marginBottom: 6 }}>Địa chỉ giao hàng: {order.shippingAddress || "Chưa có"}</div>
                  <div style={{ color: "#666", marginBottom: 6 }}>Tạm tính: {Number(order.subtotal || order.total || 0).toLocaleString()} VND</div>
                  <div style={{ color: "#666", marginBottom: 6 }}>Voucher: {order.voucherCode || "Không dùng"}</div>
                  <div style={{ color: "#666", marginBottom: 6 }}>Giảm giá: {Number(order.discountAmount || 0).toLocaleString()} VND</div>
                  <div style={{ color: "#666", marginBottom: 6 }}>Tạo lúc: {order.createdAt}</div>
                </div>
                <div className="price" style={{ margin: 0 }}>{Number(order.total || 0).toLocaleString()} VND</div>
              </div>
              <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
                {order.items.map((item) => <div key={`${order.id}-${item.id || item.foodId}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderRadius: 14, background: "#fff7f8" }}>
                  <span style={{ color: "#444", fontWeight: 600 }}>{item.name} x{item.quantity}</span>
                  <strong style={{ color: "#ff6b6b" }}>{(item.price * item.quantity).toLocaleString()} VND</strong>
                </div>)}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <button onClick={() => updateOrderStatus(order.id, "payment_rejected")} className="btn btn-danger">Từ chối</button>
                <button onClick={() => updateOrderStatus(order.id, "paid")} className="btn">Xác nhận duyệt</button>
              </div>
            </div>)}
          </div>}
      </>}
    </div>
  );
}
