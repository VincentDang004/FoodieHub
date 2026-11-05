import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const tabs = [
  ["dashboard", "Tổng quan"],
  ["orders", "Đơn hàng"],
  ["restaurants", "Nhà hàng"],
  ["foods", "Món ăn & danh mục"],
  ["vouchers", "Khuyến mãi"],
  ["reviews", "Đánh giá"],
  ["payments", "Thanh toán"]
];

const sectionTitleStyle = { color: "#172554", fontSize: "1.65rem", fontWeight: 800, textAlign: "left", margin: "8px 0 22px" };
const initialFoodForm = { name: "", price: "", image: "", category_id: "", restaurant_id: "" };
const initialCategoryForm = { name: "" };
const initialRestaurantForm = { name: "", address: "" };
const initialVoucherForm = { code: "", discount: "" };

function renderStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

export default function Admin() {
  const navigate = useNavigate();
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();
  const user = storedUser && typeof storedUser === "object" ? storedUser : {};
  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [foodForm, setFoodForm] = useState(initialFoodForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [restaurantForm, setRestaurantForm] = useState(initialRestaurantForm);
  const [voucherForm, setVoucherForm] = useState(initialVoucherForm);
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
  const [savingReplyId, setSavingReplyId] = useState(null);

  const tabButtonStyle = (key) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    fontSize: 14,
    fontWeight: activeTab === key ? 700 : 500,
    color: activeTab === key ? "#ffffff" : "#cbd5e1",
    background: activeTab === key ? "#2563eb" : "transparent",
    transition: "background 160ms ease, color 160ms ease"
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

    let loadingOrders = false;
    const loadOrders = async () => {
      if (loadingOrders) return;
      loadingOrders = true;
      try {
        setOrders((await axios.get("http://localhost:3001/api/orders/admin/pending", effectAuthConfig)).data || []);
      } catch (error) {
        console.error("Không thể tải đơn hàng chờ xử lý:", error);
      } finally {
        loadingOrders = false;
      }
    };

    const loadInitialData = async () => {
      const requests = [
        axios.get("http://localhost:3001/api/food"),
        axios.get("http://localhost:3001/api/categories"),
        axios.get("http://localhost:3001/api/restaurants"),
        axios.get("http://localhost:3001/api/reviews", effectAuthConfig),
        axios.get("http://localhost:3001/api/vouchers"),
        axios.get("http://localhost:3001/api/payments", effectAuthConfig)
      ];
      const results = await Promise.allSettled(requests);
      const setters = [setFoods, setCategories, setRestaurants, setReviews, setVouchers, setPayments];
      const labels = ["món ăn", "danh mục", "nhà hàng", "đánh giá", "khuyến mãi", "thanh toán"];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") setters[index](result.value.data || []);
        else console.error(`Không thể tải ${labels[index]}:`, result.reason);
      });
    };

    loadOrders();
    loadInitialData();

    const timer = setInterval(loadOrders, 5000);
    return () => clearInterval(timer);
  }, [navigate, token, user.role]);

  useEffect(() => {
    if (user.role !== "admin") return;

    const effectAuthConfig = { headers: { Authorization: `Bearer ${token}` } };

    const loadActiveTabData = async () => {
      try {
        if (activeTab === "reviews") {
          setReviews((await axios.get("http://localhost:3001/api/reviews", effectAuthConfig)).data || []);
        }
        if (activeTab === "vouchers") {
          setVouchers((await axios.get("http://localhost:3001/api/vouchers")).data || []);
        }
        if (activeTab === "payments") {
          setPayments((await axios.get("http://localhost:3001/api/payments", effectAuthConfig)).data || []);
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

    const timer = setInterval(refreshReviews, 10000);
    return () => clearInterval(timer);
  }, [activeTab, token, user.role]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
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
    <div className="admin-shell">
      <style>{`
        .admin-shell { min-height: 100vh; display: flex; background: #f1f5f9; color: #1e293b; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .admin-sidebar { width: 258px; flex: 0 0 258px; min-height: 100vh; box-sizing: border-box; padding: 24px 16px; background: #111d32; color: #fff; display: flex; flex-direction: column; }
        .admin-brand { display: flex; align-items: center; gap: 12px; padding: 0 10px 28px; border-bottom: 1px solid rgba(255,255,255,.12); margin-bottom: 24px; }
        .admin-brand-mark { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px; background: #2563eb; font-size: 19px; font-weight: 800; }
        .admin-brand-name { font-size: 17px; font-weight: 800; letter-spacing: .2px; }
        .admin-brand-sub { margin-top: 3px; color: #94a3b8; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; }
        .admin-nav-label { padding: 0 12px 10px; color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; }
        .admin-nav { display: grid; gap: 5px; }
        .admin-nav button:hover { background: rgba(255,255,255,.09) !important; color: #fff !important; }
        .admin-nav button:focus-visible, .admin-logout:focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px; }
        .admin-sidebar-bottom { margin-top: auto; padding-top: 20px; border-top: 1px solid rgba(255,255,255,.12); }
        .admin-user { padding: 0 10px 14px; color: #cbd5e1; font-size: 13px; overflow-wrap: anywhere; }
        .admin-logout { width: 100%; padding: 11px 14px; border: 1px solid rgba(248,113,113,.35); border-radius: 10px; color: #fecaca; background: rgba(239,68,68,.10); font-weight: 700; cursor: pointer; text-align: left; }
        .admin-main { min-width: 0; flex: 1; padding: 28px 34px 48px; }
        .admin-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
        .admin-eyebrow { margin: 0 0 5px; color: #64748b; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .admin-page-heading { margin: 0; color: #0f172a; font-size: 25px; font-weight: 800; }
        .admin-welcome { color: #64748b; font-size: 13px; }
        .admin-content { max-width: 1500px; margin: 0 auto; }
        .admin-shell .card { padding: 24px; border: 1px solid #e2e8f0; border-radius: 15px; background: #fff; box-shadow: 0 3px 12px rgba(15,23,42,.045); }
        .admin-shell .card h3 { margin-top: 0; color: #172554; font-size: 16px; font-weight: 750; }
        .admin-shell .grid { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(0, 1.5fr); gap: 20px; }
        .admin-shell .input-field { box-sizing: border-box; width: 100%; min-height: 44px; padding: 11px 13px !important; border: 1px solid #cbd5e1 !important; border-radius: 9px !important; background: #fff; color: #0f172a; font: inherit; }
        .admin-shell .input-field:focus { border-color: #3b82f6 !important; outline: 3px solid rgba(59,130,246,.13); }
        .admin-shell .btn { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 9px 14px; border: 1px solid #2563eb; border-radius: 9px; background: #2563eb; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
        .admin-shell .btn:hover { background: #1d4ed8; border-color: #1d4ed8; }
        .admin-shell .btn:disabled { opacity: .6; cursor: not-allowed; }
        .admin-shell .btn.btn-danger { border-color: #dc2626; background: #dc2626; color: #fff; }
        .admin-shell .btn.btn-danger:hover { background: #b91c1c; }
        .admin-shell .price { color: #1d4ed8 !important; font-weight: 800; }
        .admin-shell img { max-width: 100%; }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .admin-stat-card { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #fff; box-shadow: 0 3px 12px rgba(15,23,42,.04); }
        .admin-stat-icon { width: 42px; height: 42px; flex: 0 0 42px; display: grid; place-items: center; border-radius: 12px; background: #eff6ff; color: #2563eb; font-size: 20px; font-weight: 800; }
        .admin-stat-value { color: #0f172a; font-size: 25px; font-weight: 800; line-height: 1.2; }
        .admin-stat-label { margin-top: 4px; color: #64748b; font-size: 12px; }
        .admin-nav button[aria-current="page"] { box-shadow: inset 3px 0 #bfdbfe; }
        .admin-shell button { font-family: inherit; }
        .admin-shell .card { min-width: 0; }
        .admin-shell .card > div { min-width: 0; }
        @media (max-width: 900px) {
          .admin-sidebar { width: 220px; flex-basis: 220px; }
          .admin-main { padding: 24px 20px 40px; }
          .admin-shell .grid { grid-template-columns: 1fr; }
          .admin-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .admin-shell { display: block; }
          .admin-sidebar { width: 100%; min-height: auto; padding: 16px; }
          .admin-brand { padding-bottom: 14px; margin-bottom: 14px; }
          .admin-nav { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .admin-stats-grid { grid-template-columns: 1fr; }
          .admin-nav-label { padding-top: 4px; }
          .admin-sidebar-bottom { margin-top: 14px; padding-top: 12px; }
          .admin-main { padding: 20px 14px 32px; }
          .admin-topbar { align-items: flex-start; flex-direction: column; }
          .admin-page-heading { font-size: 21px; }
        }
      `}</style>

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-mark">F</div>
          <div>
            <div className="admin-brand-name">FoodieHub</div>
            <div className="admin-brand-sub">Admin workspace</div>
          </div>
        </div>
        <div className="admin-nav-label">Quản lý hệ thống</div>
        <nav className="admin-nav">
          {tabs.map(([key, label], index) => (
            <button key={key} type="button" aria-current={activeTab === key ? "page" : undefined} onClick={() => setActiveTab(key)} style={tabButtonStyle(key)}>
              <span style={{ width: 22, color: activeTab === key ? "#dbeafe" : "#94a3b8", fontSize: 15, textAlign: "center" }}>
                {["▦", "✓", "⌂", "◈", "％", "☆", "＄"][index]}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user">Đang đăng nhập<br /><strong>{user.name || "Administrator"}</strong></div>
          <button onClick={logout} className="admin-logout">↪ &nbsp; Đăng xuất</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">FoodieHub / Administration</p>
            <h1 className="admin-page-heading">Trang quản trị</h1>
          </div>
          <div className="admin-welcome">Xin chào, <strong>{user.name || "Administrator"}</strong></div>
        </header>
        <div className="admin-content">

      {activeTab === "dashboard" && <>
        <h2 style={sectionTitleStyle}>Tổng quan hệ thống</h2>
        <div className="admin-stats-grid">
          {[
            ["Đơn chờ xử lý", orders.length, "✓"],
            ["Nhà hàng", restaurants.length, "⌂"],
            ["Món ăn", foods.length, "◈"],
            ["Danh mục", categories.length, "▤"],
            ["Khuyến mãi", vouchers.length, "%"],
            ["Đánh giá", reviews.length, "☆"],
            ["Giao dịch thanh toán", payments.length, "$" ]
          ].map(([label, value, icon]) => (
            <div className="admin-stat-card" key={label}>
              <div className="admin-stat-icon">{icon}</div>
              <div><div className="admin-stat-value">{value}</div><div className="admin-stat-label">{label}</div></div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <h3>Việc cần xử lý</h3>
          <p style={{ color: "#64748b", marginBottom: 14 }}>Theo dõi nhanh các nghiệp vụ đang cần Admin chú ý.</p>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "13px 0", borderTop: "1px solid #e2e8f0" }}>
            <span>Đơn hàng đang chờ duyệt</span>
            <button className="btn" onClick={() => setActiveTab("orders")}>Xem đơn hàng ({orders.length})</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "13px 0", borderTop: "1px solid #e2e8f0" }}>
            <span>Giao dịch thanh toán cần kiểm tra</span>
            <button className="btn" onClick={() => setActiveTab("payments")}>Xem thanh toán</button>
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: 12, marginTop: 14 }}>Lưu ý: số liệu trên là số bản ghi API hiện đang trả về, không mặc định là tổng số liệu toàn thời gian.</p>
      </>}

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
            {renderCollection(restaurants, (restaurant) => <div key={restaurant.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 16, borderRadius: 16, background: "#f8fafc" }}>
              <div><div style={{ fontWeight: 700 }}>{restaurant.name}</div><div style={{ color: "#666", marginTop: 6 }}>{restaurant.address || "Chưa có địa chỉ"}</div></div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => { setEditingRestaurantId(restaurant.id); setRestaurantForm({ name: restaurant.name || "", address: restaurant.address || "" }); }} className="btn">Sửa</button>
                <button onClick={() => removeByApi(`http://localhost:3001/api/restaurants/${restaurant.id}`, "Bạn có chắc muốn xóa nhà hàng này không?", reloadRestaurants)} className="btn btn-danger">Xóa</button>
              </div>
            </div>, "Chưa có nhà hàng nào.")}
          </div>
        </div>
      </>}

      {activeTab === "reviews" && <>
        <h2 style={sectionTitleStyle}>Quản lý review</h2>
        <div className="card" style={{ padding: 24, marginBottom: 40 }}>
          <h3>Danh sách review</h3>
          {renderCollection(reviews, (review) => <div key={review.id} style={{ padding: 18, borderRadius: 16, background: "#f8fafc", display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>{review.User?.name || "Người dùng không rõ"} - {review.Food?.name || "Món ăn không rõ"}</div>
            <div style={{ color: "#666" }}>Email: {review.User?.email || "Chưa có"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ color: "#666" }}>Đánh giá:</span>
              <span style={{ color: "#ffb400", fontSize: "1.2rem", letterSpacing: 1 }}>
                {renderStars(review.rating)}
              </span>
            </div>
            <div style={{ color: "#333" }}>Nhận xét: {review.comment || "Không có nội dung"}</div>
            {review.admin_reply && <div style={{ padding: 12, borderRadius: 12, background: "#eff6ff", border: "1px solid #d3e6ff", color: "#1e40af" }}>
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

      {activeTab === "foods" && <>
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
            {renderCollection(categories, (category) => <div key={category.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 16, borderRadius: 16, background: "#f8fafc" }}>
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
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} style={{ width: "100%", padding: 10, borderRadius: 16, border: "2px dashed #f3b3be", background: "#f8fafc" }} />
              <button onClick={submitFood} className="btn" disabled={savingFood}>{savingFood ? "Đang lưu..." : "Lưu món ăn"}</button>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3>Danh sách món ăn</h3>
            {renderCollection(foods, (food) => <div key={food.id} style={{ display: "grid", gridTemplateColumns: food.image ? "92px 1fr" : "1fr", gap: 14, padding: 14, borderRadius: 16, background: "#f8fafc", alignItems: "center" }}>
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
            {renderCollection(vouchers, (voucher) => <div key={voucher.id} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: 16, borderRadius: 16, background: "#f8fafc" }}>
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
          {renderCollection(payments, (payment) => <div key={payment.id} style={{ padding: 18, borderRadius: 16, background: "#f8fafc", display: "grid", gap: 8 }}>
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
                {(Array.isArray(order.items) ? order.items : []).map((item, itemIndex) => <div key={`${order.id}-${item.id || item.foodId || itemIndex}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderRadius: 14, background: "#f8fafc" }}>
                  <span style={{ color: "#444", fontWeight: 600 }}>{item.name} x{item.quantity}</span>
                  <strong style={{ color: "#2563eb" }}>{(item.price * item.quantity).toLocaleString()} VND</strong>
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
      </main>
    </div>
  );
}
