
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Utensils,
  Tags,
  TicketPercent,
  MessageSquare,
  CreditCard,
  LogOut,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  Clock3,
  CircleCheck,
  CircleX,
  Wallet,
  Users,
  Package,
  Star,
  MapPin,
  CalendarDays,
  ImagePlus,
  ChevronRight,
  Menu,
  XCircle
} from "lucide-react";
import "./Admin.css";

const API = "http://localhost:3001/api";

const tabs = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, group: "Chung" },
  { key: "orders", label: "Đơn hàng", icon: ShoppingBag, group: "Quản lý" },
  { key: "restaurants", label: "Nhà hàng", icon: Store, group: "Quản lý" },
  { key: "foods", label: "Món ăn", icon: Utensils, group: "Quản lý" },
  { key: "categories", label: "Danh mục", icon: Tags, group: "Quản lý" },
  { key: "vouchers", label: "Khuyến mãi", icon: TicketPercent, group: "Quản lý" },
  { key: "reviews", label: "Đánh giá", icon: MessageSquare, group: "Hệ thống" },
  { key: "payments", label: "Thanh toán", icon: CreditCard, group: "Hệ thống" }
];

const initialFoodForm = {
  name: "",
  price: "",
  image: "",
  category_id: "",
  restaurant_id: ""
};

const initialCategoryForm = { name: "" };
const initialRestaurantForm = { name: "", address: "" };
const initialVoucherForm = { code: "", discount: "" };

const money = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} đ`;

const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();

  const statusMap = {
    pending: ["Chờ xử lý", "warning"],
    waiting: ["Chờ xử lý", "warning"],
    paid: ["Đã thanh toán", "success"],
    payment_rejected: ["Đã từ chối", "danger"],
    completed: ["Hoàn thành", "success"],
    cancelled: ["Đã hủy", "danger"],
    failed: ["Thất bại", "danger"],
    approved: ["Đã duyệt", "success"],
    rejected: ["Đã từ chối", "danger"]
  };

  const [label, type] = statusMap[normalized] || [status || "Chưa xác định", "neutral"];

  return <span className={`admin-status admin-status--${type}`}>{label}</span>;
}

function EmptyState({ title = "Chưa có dữ liệu", description = "Dữ liệu sẽ hiển thị tại đây khi có bản ghi." }) {
  return (
    <div className="admin-empty">
      <Package size={28} strokeWidth={1.6} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Admin() {
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const user = storedUser && typeof storedUser === "object" ? storedUser : {};
  const token = localStorage.getItem("token");
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
  const [loadingOrders, setLoadingOrders] = useState(false);

  const activePage = tabs.find((tab) => tab.key === activeTab);

  const reloadFoods = async () => {
    try {
      const response = await axios.get(`${API}/food`);
      setFoods(response.data || []);
    } catch (error) {
      console.error("Không thể tải món ăn:", error);
    }
  };

  const reloadCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Không thể tải danh mục:", error);
    }
  };

  const reloadRestaurants = async () => {
    try {
      const response = await axios.get(`${API}/restaurants`);
      setRestaurants(response.data || []);
    } catch (error) {
      console.error("Không thể tải nhà hàng:", error);
    }
  };

  const reloadReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews`, authConfig);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Không thể tải đánh giá:", error);
    }
  };

  const reloadVouchers = async () => {
    try {
      const response = await axios.get(`${API}/vouchers`);
      setVouchers(response.data || []);
    } catch (error) {
      console.error("Không thể tải khuyến mãi:", error);
    }
  };

  const reloadPayments = async () => {
    try {
      const response = await axios.get(`${API}/payments`, authConfig);
      setPayments(response.data || []);
    } catch (error) {
      console.error("Không thể tải thanh toán:", error);
    }
  };

  const reloadOrders = async () => {
    if (loadingOrders) return;

    setLoadingOrders(true);
    try {
      const response = await axios.get(
        `${API}/orders/admin/pending`,
        authConfig
      );
      setOrders(response.data || []);
    } catch (error) {
      console.error("Không thể tải đơn hàng:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    const loadInitialData = async () => {
      const requests = [
        axios.get(`${API}/food`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/restaurants`),
        axios.get(`${API}/reviews`, authConfig),
        axios.get(`${API}/vouchers`),
        axios.get(`${API}/payments`, authConfig)
      ];

      const results = await Promise.allSettled(requests);
      const setters = [
        setFoods,
        setCategories,
        setRestaurants,
        setReviews,
        setVouchers,
        setPayments
      ];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          setters[index](result.value.data || []);
        } else {
          console.error("Không thể tải dữ liệu:", result.reason);
        }
      });
    };

    reloadOrders();
    loadInitialData();

    const timer = setInterval(reloadOrders, 5000);
    return () => clearInterval(timer);
  }, [navigate, token, user.role]);

  useEffect(() => {
    if (user.role !== "admin") return;

    if (activeTab === "reviews") reloadReviews();
    if (activeTab === "vouchers") reloadVouchers();
    if (activeTab === "payments") reloadPayments();
    if (activeTab === "orders") reloadOrders();
  }, [activeTab, token, user.role]);

  useEffect(() => {
    if (user.role !== "admin" || activeTab !== "reviews") return;

    const timer = setInterval(reloadReviews, 10000);
    return () => clearInterval(timer);
  }, [activeTab, token, user.role]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  const changeTab = (key) => {
    setActiveTab(key);
    setSearchTerm("");
    setMobileMenuOpen(false);
  };

  const removeByApi = async (url, message, reload) => {
    if (!window.confirm(message)) return;

    try {
      await axios.delete(url, authConfig);
      await reload();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể xóa dữ liệu"));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const message =
      status === "paid"
        ? "Xác nhận đơn hàng đã thanh toán?"
        : "Bạn có chắc muốn từ chối thanh toán đơn hàng này?";

    if (!window.confirm(message)) return;

    try {
      await axios.patch(
        `${API}/orders/${orderId}/status`,
        { status },
        authConfig
      );

      setOrders((previous) =>
        previous.filter((order) => String(order.id) !== String(orderId))
      );

      reloadPayments();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể cập nhật đơn hàng"));
    }
  };

  const uploadImageIfNeeded = async () => {
    if (!selectedFile) return foodForm.image || "";

    const uploadForm = new FormData();
    uploadForm.append("image", selectedFile);

    const response = await axios.post(`${API}/upload`, uploadForm, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    return `uploads/${response.data.file}`;
  };

  const submitFood = async (event) => {
    event.preventDefault();

    if (!foodForm.name.trim() || foodForm.price === "") {
      return alert("Vui lòng nhập tên món ăn và giá tiền");
    }

    setSavingFood(true);

    try {
      const payload = {
        name: foodForm.name.trim(),
        price: Number(foodForm.price),
        image: await uploadImageIfNeeded(),
        category_id: foodForm.category_id ? Number(foodForm.category_id) : null,
        restaurant_id: foodForm.restaurant_id ? Number(foodForm.restaurant_id) : null
      };

      if (editingFoodId) {
        await axios.put(`${API}/food/${editingFoodId}`, payload, authConfig);
      } else {
        await axios.post(`${API}/food`, payload, authConfig);
      }

      setEditingFoodId(null);
      setFoodForm(initialFoodForm);
      setSelectedFile(null);
      await reloadFoods();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể lưu món ăn"));
    } finally {
      setSavingFood(false);
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      return alert("Vui lòng nhập tên danh mục");
    }

    setSavingCategory(true);

    try {
      const payload = { name: categoryForm.name.trim() };

      if (editingCategoryId) {
        await axios.put(
          `${API}/categories/${editingCategoryId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API}/categories`, payload, authConfig);
      }

      setEditingCategoryId(null);
      setCategoryForm(initialCategoryForm);
      await reloadCategories();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể lưu danh mục"));
    } finally {
      setSavingCategory(false);
    }
  };

  const submitRestaurant = async (event) => {
    event.preventDefault();

    if (!restaurantForm.name.trim()) {
      return alert("Vui lòng nhập tên nhà hàng");
    }

    setSavingRestaurant(true);

    try {
      const payload = {
        name: restaurantForm.name.trim(),
        address: restaurantForm.address.trim()
      };

      if (editingRestaurantId) {
        await axios.put(
          `${API}/restaurants/${editingRestaurantId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API}/restaurants`, payload, authConfig);
      }

      setEditingRestaurantId(null);
      setRestaurantForm(initialRestaurantForm);
      await reloadRestaurants();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể lưu nhà hàng"));
    } finally {
      setSavingRestaurant(false);
    }
  };

  const submitVoucher = async (event) => {
    event.preventDefault();

    if (!voucherForm.code.trim() || voucherForm.discount === "") {
      return alert("Vui lòng nhập mã voucher và phần trăm giảm");
    }

    setSavingVoucher(true);

    try {
      const payload = {
        code: voucherForm.code.trim().toUpperCase(),
        discount: Number(voucherForm.discount)
      };

      if (editingVoucherId) {
        await axios.put(
          `${API}/vouchers/${editingVoucherId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API}/vouchers`, payload, authConfig);
      }

      setEditingVoucherId(null);
      setVoucherForm(initialVoucherForm);
      await reloadVouchers();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể lưu voucher"));
    } finally {
      setSavingVoucher(false);
    }
  };

  const getReviewReplyValue = (review) =>
    Object.prototype.hasOwnProperty.call(reviewReplyForms, review.id)
      ? reviewReplyForms[review.id]
      : review.admin_reply || "";

  const submitReviewReply = async (review) => {
    setSavingReplyId(review.id);

    try {
      const admin_reply = getReviewReplyValue(review).trim();

      await axios.patch(
        `${API}/reviews/admin/${review.id}/reply`,
        { admin_reply },
        authConfig
      );

      setReviewReplyForms((previous) => ({
        ...previous,
        [review.id]: admin_reply
      }));

      await reloadReviews();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể lưu phản hồi đánh giá"));
    } finally {
      setSavingReplyId(null);
    }
  };

  const clearReviewReply = async (reviewId) => {
    if (!window.confirm("Bạn muốn xóa phản hồi này?")) return;

    setSavingReplyId(reviewId);

    try {
      await axios.patch(
        `${API}/reviews/admin/${reviewId}/reply`,
        { admin_reply: "" },
        authConfig
      );

      setReviewReplyForms((previous) => ({
        ...previous,
        [reviewId]: ""
      }));

      await reloadReviews();
    } catch (error) {
      alert(getErrorMessage(error, "Không thể xóa phản hồi"));
    } finally {
      setSavingReplyId(null);
    }
  };

  const startEditFood = (food) => {
    setEditingFoodId(food.id);
    setFoodForm({
      name: food.name || "",
      price: food.price || "",
      image: food.image || "",
      category_id: food.category_id || food.Category?.id || "",
      restaurant_id: food.restaurant_id || food.Restaurant?.id || ""
    });
    setSelectedFile(null);
  };

  const startEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name || "" });
  };

  const startEditRestaurant = (restaurant) => {
    setEditingRestaurantId(restaurant.id);
    setRestaurantForm({
      name: restaurant.name || "",
      address: restaurant.address || ""
    });
  };

  const startEditVoucher = (voucher) => {
    setEditingVoucherId(voucher.id);
    setVoucherForm({
      code: voucher.code || "",
      discount: voucher.discount || ""
    });
  };

  const filtered = (items, fields) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) =>
      fields.some((field) =>
        String(field(item) ?? "").toLowerCase().includes(keyword)
      )
    );
  };

  const renderActions = (onEdit, onDelete, deleteLabel = "bản ghi này") => (
    <div className="admin-row-actions">
      {onEdit && (
        <button
          type="button"
          className="admin-icon-button"
          title="Chỉnh sửa"
          onClick={onEdit}
        >
          <Pencil size={15} />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          className="admin-icon-button admin-icon-button--danger"
          title="Xóa"
          onClick={onDelete}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );

  const renderSearch = (placeholder = "Tìm kiếm...") => (
    <div className="admin-search">
      <Search size={17} />
      <input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder={placeholder}
      />
      {searchTerm && (
        <button type="button" onClick={() => setSearchTerm("")} aria-label="Xóa tìm kiếm">
          <X size={15} />
        </button>
      )}
    </div>
  );

  const renderTable = (headers, rows, emptyTitle) => (
    <div className="admin-table-wrap">
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      )}
    </div>
  );

  const renderDashboard = () => {
    const stats = [
      { label: "Đơn chờ xử lý", value: orders.length, icon: ShoppingBag, tone: "orange" },
      { label: "Nhà hàng", value: restaurants.length, icon: Store, tone: "blue" },
      { label: "Món ăn", value: foods.length, icon: Utensils, tone: "purple" },
      { label: "Danh mục", value: categories.length, icon: Tags, tone: "green" },
      { label: "Khuyến mãi", value: vouchers.length, icon: TicketPercent, tone: "pink" },
      { label: "Đánh giá", value: reviews.length, icon: Star, tone: "yellow" },
      { label: "Thanh toán", value: payments.length, icon: Wallet, tone: "cyan" }
    ];

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">TỔNG QUAN</span>
            <h2>Tổng quan hệ thống</h2>
            <p>Theo dõi nhanh tình hình hoạt động của FoodieHub.</p>
          </div>
          <button type="button" className="admin-button admin-button--light" onClick={() => {
            reloadOrders();
            reloadFoods();
            reloadCategories();
            reloadRestaurants();
            reloadReviews();
            reloadVouchers();
            reloadPayments();
          }}>
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>

        <div className="admin-stats-grid">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div className="admin-stat-card" key={label}>
              <div className={`admin-stat-icon admin-stat-icon--${tone}`}>
                <Icon size={19} />
              </div>
              <div className="admin-stat-info">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            </div>
          ))}
        </div>

        <section className="admin-panel admin-dashboard-panel">
          <div className="admin-panel-heading">
            <div>
              <h3>Công việc cần xử lý</h3>
              <p>Các mục cần quản trị viên chú ý.</p>
            </div>
          </div>

          <button type="button" className="admin-task-row" onClick={() => changeTab("orders")}>
            <span className="admin-task-icon admin-task-icon--orange"><ShoppingBag size={18} /></span>
            <span className="admin-task-content">
              <strong>Đơn hàng chờ duyệt</strong>
              <small>Kiểm tra và xác nhận thanh toán của khách hàng</small>
            </span>
            <span className="admin-task-count">{orders.length}</span>
            <ChevronRight size={17} />
          </button>

          <button type="button" className="admin-task-row" onClick={() => changeTab("payments")}>
            <span className="admin-task-icon admin-task-icon--blue"><CreditCard size={18} /></span>
            <span className="admin-task-content">
              <strong>Giao dịch thanh toán</strong>
              <small>Theo dõi thông tin và trạng thái giao dịch</small>
            </span>
            <span className="admin-task-count">{payments.length}</span>
            <ChevronRight size={17} />
          </button>
        </section>

        <p className="admin-footnote">
          Số liệu phản ánh số bản ghi API hiện đang trả về, không mặc định là tổng số liệu toàn thời gian.
        </p>
      </>
    );
  };

  const renderRestaurants = () => {
    const list = filtered(restaurants, [
      (item) => item.name,
      (item) => item.address
    ]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">QUẢN LÝ</span>
            <h2>Nhà hàng</h2>
            <p>Quản lý thông tin các nhà hàng trên hệ thống.</p>
          </div>
        </div>

        <div className="admin-management-layout">
          <section className="admin-panel admin-form-panel">
            <div className="admin-panel-heading">
              <div>
                <h3>{editingRestaurantId ? "Cập nhật nhà hàng" : "Thêm nhà hàng"}</h3>
                <p>Nhập thông tin nhà hàng.</p>
              </div>
              {editingRestaurantId && (
                <button type="button" className="admin-icon-button" onClick={() => {
                  setEditingRestaurantId(null);
                  setRestaurantForm(initialRestaurantForm);
                }}>
                  <X size={17} />
                </button>
              )}
            </div>

            <form onSubmit={submitRestaurant} className="admin-form">
              <Field label="Tên nhà hàng">
                <input
                  className="admin-input"
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nhập tên nhà hàng"
                />
              </Field>
              <Field label="Địa chỉ">
                <input
                  className="admin-input"
                  value={restaurantForm.address}
                  onChange={(e) => setRestaurantForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Nhập địa chỉ"
                />
              </Field>
              <button className="admin-button admin-button--primary" disabled={savingRestaurant}>
                <Plus size={16} /> {savingRestaurant ? "Đang lưu..." : editingRestaurantId ? "Cập nhật" : "Thêm nhà hàng"}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading admin-panel-heading--list">
              <div>
                <h3>Danh sách nhà hàng</h3>
                <p>{restaurants.length} nhà hàng</p>
              </div>
              {renderSearch("Tìm nhà hàng...")}
            </div>

            {renderTable(
              ["Nhà hàng", "Địa chỉ", "Thao tác"],
              list.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td>
                    <div className="admin-primary-cell">
                      <span className="admin-table-avatar"><Store size={17} /></span>
                      <strong>{restaurant.name}</strong>
                    </div>
                  </td>
                  <td><span className="admin-secondary-cell">{restaurant.address || "Chưa có địa chỉ"}</span></td>
                  <td>
                    {renderActions(
                      () => startEditRestaurant(restaurant),
                      () => removeByApi(`${API}/restaurants/${restaurant.id}`, "Bạn có chắc muốn xóa nhà hàng này không?", reloadRestaurants)
                    )}
                  </td>
                </tr>
              )),
              "Không tìm thấy nhà hàng"
            )}
          </section>
        </div>
      </>
    );
  };

  const renderCategories = () => {
    const list = filtered(categories, [(item) => item.name]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">QUẢN LÝ</span>
            <h2>Danh mục</h2>
            <p>Phân loại món ăn theo từng danh mục.</p>
          </div>
        </div>

        <div className="admin-management-layout">
          <section className="admin-panel admin-form-panel">
            <div className="admin-panel-heading">
              <div>
                <h3>{editingCategoryId ? "Cập nhật danh mục" : "Thêm danh mục"}</h3>
                <p>Nhập tên danh mục.</p>
              </div>
              {editingCategoryId && (
                <button type="button" className="admin-icon-button" onClick={() => {
                  setEditingCategoryId(null);
                  setCategoryForm(initialCategoryForm);
                }}>
                  <X size={17} />
                </button>
              )}
            </div>

            <form onSubmit={submitCategory} className="admin-form">
              <Field label="Tên danh mục">
                <input
                  className="admin-input"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  placeholder="Ví dụ: Món chính"
                />
              </Field>
              <button className="admin-button admin-button--primary" disabled={savingCategory}>
                <Plus size={16} /> {savingCategory ? "Đang lưu..." : editingCategoryId ? "Cập nhật" : "Thêm danh mục"}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading admin-panel-heading--list">
              <div>
                <h3>Danh sách danh mục</h3>
                <p>{categories.length} danh mục</p>
              </div>
              {renderSearch("Tìm danh mục...")}
            </div>

            {renderTable(
              ["Danh mục", "Mã", "Thao tác"],
              list.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="admin-primary-cell">
                      <span className="admin-table-avatar"><Tags size={17} /></span>
                      <strong>{category.name}</strong>
                    </div>
                  </td>
                  <td><span className="admin-secondary-cell">#{category.id}</span></td>
                  <td>
                    {renderActions(
                      () => startEditCategory(category),
                      () => removeByApi(`${API}/categories/${category.id}`, "Bạn có chắc muốn xóa danh mục này không?", reloadCategories)
                    )}
                  </td>
                </tr>
              )),
              "Không tìm thấy danh mục"
            )}
          </section>
        </div>
      </>
    );
  };

  const renderFoods = () => {
    const list = filtered(foods, [
      (item) => item.name,
      (item) => item.Category?.name,
      (item) => item.Restaurant?.name
    ]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">QUẢN LÝ</span>
            <h2>Món ăn</h2>
            <p>Quản lý thực đơn và thông tin món ăn.</p>
          </div>
        </div>

        <div className="admin-management-layout">
          <section className="admin-panel admin-form-panel">
            <div className="admin-panel-heading">
              <div>
                <h3>{editingFoodId ? "Cập nhật món ăn" : "Thêm món ăn"}</h3>
                <p>Thông tin món ăn và hình ảnh.</p>
              </div>
              {editingFoodId && (
                <button type="button" className="admin-icon-button" onClick={() => {
                  setEditingFoodId(null);
                  setFoodForm(initialFoodForm);
                  setSelectedFile(null);
                }}>
                  <X size={17} />
                </button>
              )}
            </div>

            <form onSubmit={submitFood} className="admin-form">
              <Field label="Tên món ăn">
                <input
                  className="admin-input"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Nhập tên món ăn"
                />
              </Field>

              <Field label="Giá bán (VND)">
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  value={foodForm.price}
                  onChange={(e) => setFoodForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="Nhập giá bán"
                />
              </Field>

              <Field label="Danh mục">
                <select
                  className="admin-input"
                  value={foodForm.category_id}
                  onChange={(e) => setFoodForm((p) => ({ ...p, category_id: e.target.value }))}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Nhà hàng">
                <select
                  className="admin-input"
                  value={foodForm.restaurant_id}
                  onChange={(e) => setFoodForm((p) => ({ ...p, restaurant_id: e.target.value }))}
                >
                  <option value="">Chọn nhà hàng</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Hình ảnh món ăn">
                <label className="admin-file-input">
                  <ImagePlus size={20} />
                  <span>{selectedFile ? selectedFile.name : "Chọn hình ảnh từ thiết bị"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
              </Field>

              {foodForm.image && !selectedFile && (
                <div className="admin-current-image">
                  <img src={`${API.replace("/api", "")}/${foodForm.image}`} alt="Món ăn hiện tại" />
                  <span>Ảnh hiện tại</span>
                </div>
              )}

              <button className="admin-button admin-button--primary" disabled={savingFood}>
                <Plus size={16} /> {savingFood ? "Đang lưu..." : editingFoodId ? "Cập nhật món ăn" : "Thêm món ăn"}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading admin-panel-heading--list">
              <div>
                <h3>Danh sách món ăn</h3>
                <p>{foods.length} món ăn</p>
              </div>
              {renderSearch("Tìm món ăn...")}
            </div>

            {renderTable(
              ["Món ăn", "Danh mục", "Nhà hàng", "Giá bán", "Thao tác"],
              list.map((food) => (
                <tr key={food.id}>
                  <td>
                    <div className="admin-primary-cell">
                      {food.image ? (
                        <img
                          className="admin-food-thumb"
                          src={`${API.replace("/api", "")}/${food.image}`}
                          alt={food.name}
                        />
                      ) : (
                        <span className="admin-table-avatar"><Utensils size={17} /></span>
                      )}
                      <strong>{food.name}</strong>
                    </div>
                  </td>
                  <td><span className="admin-secondary-cell">{food.Category?.name || "Chưa phân loại"}</span></td>
                  <td><span className="admin-secondary-cell">{food.Restaurant?.name || "Chưa gán"}</span></td>
                  <td><strong className="admin-money">{money(food.price)}</strong></td>
                  <td>
                    {renderActions(
                      () => startEditFood(food),
                      () => removeByApi(`${API}/food/${food.id}`, "Bạn có chắc muốn xóa món ăn này không?", reloadFoods)
                    )}
                  </td>
                </tr>
              )),
              "Không tìm thấy món ăn"
            )}
          </section>
        </div>
      </>
    );
  };

  const renderVouchers = () => {
    const list = filtered(vouchers, [(item) => item.code]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">QUẢN LÝ</span>
            <h2>Khuyến mãi</h2>
            <p>Tạo và quản lý mã giảm giá.</p>
          </div>
        </div>

        <div className="admin-management-layout">
          <section className="admin-panel admin-form-panel">
            <div className="admin-panel-heading">
              <div>
                <h3>{editingVoucherId ? "Cập nhật voucher" : "Thêm voucher"}</h3>
                <p>Thiết lập mã và phần trăm giảm.</p>
              </div>
              {editingVoucherId && (
                <button type="button" className="admin-icon-button" onClick={() => {
                  setEditingVoucherId(null);
                  setVoucherForm(initialVoucherForm);
                }}>
                  <X size={17} />
                </button>
              )}
            </div>

            <form onSubmit={submitVoucher} className="admin-form">
              <Field label="Mã voucher">
                <input
                  className="admin-input admin-code-input"
                  value={voucherForm.code}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="Ví dụ: FOOD20"
                />
              </Field>
              <Field label="Phần trăm giảm (%)">
                <input
                  className="admin-input"
                  type="number"
                  min="0"
                  max="100"
                  value={voucherForm.discount}
                  onChange={(e) => setVoucherForm((p) => ({ ...p, discount: e.target.value }))}
                  placeholder="Nhập phần trăm giảm"
                />
              </Field>
              <button className="admin-button admin-button--primary" disabled={savingVoucher}>
                <Plus size={16} /> {savingVoucher ? "Đang lưu..." : editingVoucherId ? "Cập nhật" : "Thêm voucher"}
              </button>
            </form>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading admin-panel-heading--list">
              <div>
                <h3>Danh sách voucher</h3>
                <p>{vouchers.length} mã khuyến mãi</p>
              </div>
              {renderSearch("Tìm mã voucher...")}
            </div>

            {renderTable(
              ["Mã voucher", "Mức giảm", "Thao tác"],
              list.map((voucher) => (
                <tr key={voucher.id}>
                  <td>
                    <div className="admin-primary-cell">
                      <span className="admin-table-avatar admin-table-avatar--voucher"><TicketPercent size={17} /></span>
                      <strong className="admin-code">{voucher.code}</strong>
                    </div>
                  </td>
                  <td><span className="admin-discount">{Number(voucher.discount || 0)}%</span></td>
                  <td>
                    {renderActions(
                      () => startEditVoucher(voucher),
                      () => removeByApi(`${API}/vouchers/${voucher.id}`, "Bạn có chắc muốn xóa voucher này không?", reloadVouchers)
                    )}
                  </td>
                </tr>
              )),
              "Không tìm thấy voucher"
            )}
          </section>
        </div>
      </>
    );
  };

  const renderReviews = () => {
    const list = filtered(reviews, [
      (item) => item.User?.name,
      (item) => item.User?.email,
      (item) => item.Food?.name,
      (item) => item.comment
    ]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">HỆ THỐNG</span>
            <h2>Đánh giá</h2>
            <p>Theo dõi nhận xét và phản hồi của khách hàng.</p>
          </div>
          <span className="admin-total-label">{reviews.length} đánh giá</span>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-heading admin-panel-heading--list">
            <div>
              <h3>Danh sách đánh giá</h3>
              <p>Phản hồi trực tiếp các nhận xét của khách hàng.</p>
            </div>
            {renderSearch("Tìm khách hàng, món ăn...")}
          </div>

          {list.length === 0 ? (
            <EmptyState title="Chưa có đánh giá" />
          ) : (
            <div className="admin-review-list">
              {list.map((review) => (
                <article className="admin-review-item" key={review.id}>
                  <div className="admin-review-top">
                    <div className="admin-review-user">
                      <span className="admin-review-avatar">
                        {(review.User?.name || "K").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{review.User?.name || "Người dùng không rõ"}</strong>
                        <span>{review.User?.email || "Chưa có email"}</span>
                      </div>
                    </div>
                    <div className="admin-review-rating">
                      <Star size={15} fill="currentColor" />
                      <strong>{Number(review.rating || 0)}/5</strong>
                    </div>
                  </div>

                  <div className="admin-review-food">
                    <Utensils size={14} />
                    {review.Food?.name || "Món ăn không rõ"}
                  </div>

                  <p className="admin-review-comment">
                    {review.comment || "Khách hàng không để lại nội dung."}
                  </p>

                  {review.admin_reply && (
                    <div className="admin-review-existing-reply">
                      <strong>Phản hồi của cửa hàng</strong>
                      <p>{review.admin_reply}</p>
                    </div>
                  )}

                  <div className="admin-review-reply">
                    <textarea
                      className="admin-input"
                      rows={3}
                      value={getReviewReplyValue(review)}
                      onChange={(e) => setReviewReplyForms((previous) => ({
                        ...previous,
                        [review.id]: e.target.value
                      }))}
                      placeholder="Nhập phản hồi cho khách hàng..."
                    />
                    <div className="admin-review-actions">
                      <button
                        type="button"
                        className="admin-button admin-button--primary"
                        disabled={savingReplyId === review.id}
                        onClick={() => submitReviewReply(review)}
                      >
                        <Check size={15} />
                        {savingReplyId === review.id ? "Đang lưu..." : review.admin_reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
                      </button>

                      {review.admin_reply && (
                        <button
                          type="button"
                          className="admin-button admin-button--light"
                          disabled={savingReplyId === review.id}
                          onClick={() => clearReviewReply(review.id)}
                        >
                          <X size={15} /> Xóa phản hồi
                        </button>
                      )}

                      <button
                        type="button"
                        className="admin-button admin-button--danger"
                        onClick={() => removeByApi(`${API}/reviews/admin/${review.id}`, "Bạn có chắc muốn xóa đánh giá này không?", reloadReviews)}
                      >
                        <Trash2 size={15} /> Xóa đánh giá
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  const renderPayments = () => {
    const list = filtered(payments, [
      (item) => item.id,
      (item) => item.order_id,
      (item) => item.Order?.User?.name,
      (item) => item.Order?.User?.email,
      (item) => item.method,
      (item) => item.status
    ]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">HỆ THỐNG</span>
            <h2>Thanh toán</h2>
            <p>Theo dõi các giao dịch thanh toán trên hệ thống.</p>
          </div>
          <span className="admin-total-label">{payments.length} giao dịch</span>
        </div>

        <section className="admin-panel">
          <div className="admin-panel-heading admin-panel-heading--list">
            <div>
              <h3>Lịch sử giao dịch</h3>
              <p>Thông tin giao dịch và trạng thái đơn hàng.</p>
            </div>
            {renderSearch("Tìm mã đơn, khách hàng...")}
          </div>

          {renderTable(
            ["Giao dịch", "Khách hàng", "Phương thức", "Trạng thái", "Thời gian"],
            list.map((payment) => (
              <tr key={payment.id}>
                <td>
                  <div className="admin-primary-cell">
                    <span className="admin-table-avatar"><CreditCard size={17} /></span>
                    <div>
                      <strong>#{payment.id}</strong>
                      <small>Đơn hàng #{payment.order_id}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="admin-table-text">
                    <strong>{payment.Order?.User?.name || "Không rõ"}</strong>
                    <small>{payment.Order?.User?.email || "Chưa có email"}</small>
                  </div>
                </td>
                <td>{payment.method || "—"}</td>
                <td><StatusBadge status={payment.status} /></td>
                <td><span className="admin-secondary-cell">{dateTime(payment.requested_at)}</span></td>
              </tr>
            )),
            "Chưa có giao dịch thanh toán"
          )}
        </section>
      </>
    );
  };

  const renderOrders = () => {
    const list = filtered(orders, [
      (item) => item.id,
      (item) => item.userName,
      (item) => item.userEmail,
      (item) => item.shippingAddress
    ]);

    return (
      <>
        <div className="admin-page-intro">
          <div>
            <span className="admin-overline">QUẢN LÝ</span>
            <h2>Đơn hàng chờ duyệt</h2>
            <p>Kiểm tra thông tin và xác nhận thanh toán đơn hàng.</p>
          </div>
          <button
            type="button"
            className="admin-button admin-button--light"
            onClick={reloadOrders}
            disabled={loadingOrders}
          >
            <RefreshCw size={15} className={loadingOrders ? "admin-spin" : ""} />
            Làm mới
          </button>
        </div>

        <div className="admin-order-summary">
          <div>
            <span>Đơn hàng đang chờ</span>
            <strong>{orders.length}</strong>
          </div>
          <Clock3 size={23} />
        </div>

        {list.length === 0 ? (
          <section className="admin-panel">
            <EmptyState
              title="Không có đơn hàng chờ duyệt"
              description="Khi có đơn hàng cần xác nhận, thông tin sẽ xuất hiện tại đây."
            />
          </section>
        ) : (
          <div className="admin-order-list">
            {list.map((order) => (
              <article className="admin-panel admin-order-card" key={order.id}>
                <div className="admin-order-header">
                  <div>
                    <span className="admin-overline">MÃ ĐƠN HÀNG</span>
                    <h3>#{order.id}</h3>
                  </div>
                  <div className="admin-order-total">
                    <span>Tổng thanh toán</span>
                    <strong>{money(order.total)}</strong>
                  </div>
                </div>

                <div className="admin-order-info">
                  <div>
                    <Users size={16} />
                    <span>{order.userName || "Không rõ người đặt"}</span>
                  </div>
                  <div>
                    <MessageSquare size={16} />
                    <span>{order.userEmail || "Chưa có email"}</span>
                  </div>
                  <div>
                    <MapPin size={16} />
                    <span>{order.shippingAddress || "Chưa có địa chỉ giao hàng"}</span>
                  </div>
                  <div>
                    <CalendarDays size={16} />
                    <span>{dateTime(order.createdAt)}</span>
                  </div>
                </div>

                <div className="admin-order-costs">
                  <div><span>Tạm tính</span><strong>{money(order.subtotal || order.total)}</strong></div>
                  <div><span>Voucher</span><strong>{order.voucherCode || "Không sử dụng"}</strong></div>
                  <div><span>Giảm giá</span><strong>{money(order.discountAmount)}</strong></div>
                </div>

                <div className="admin-order-items">
                  <h4>Sản phẩm trong đơn</h4>
                  {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                    <div className="admin-order-item" key={`${order.id}-${item.id || item.foodId || index}`}>
                      <span>{item.name} <b>× {item.quantity}</b></span>
                      <strong>{money(Number(item.price || 0) * Number(item.quantity || 0))}</strong>
                    </div>
                  ))}
                </div>

                <div className="admin-order-actions">
                  <button
                    type="button"
                    className="admin-button admin-button--danger"
                    onClick={() => updateOrderStatus(order.id, "payment_rejected")}
                  >
                    <XCircle size={16} /> Từ chối
                  </button>
                  <button
                    type="button"
                    className="admin-button admin-button--success"
                    onClick={() => updateOrderStatus(order.id, "paid")}
                  >
                    <CircleCheck size={16} /> Xác nhận thanh toán
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    );
  };

  if (user.role !== "admin") return null;

  return (
    <div className="admin-shell">
      {mobileMenuOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Đóng menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-text">
            <strong>TFOOD</strong>
            <span>ADMINISTRATION</span>
          </div>
          <button
            type="button"
            className="admin-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Đóng menu"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="admin-navigation">
          {["Chung", "Quản lý", "Hệ thống"].map((group) => {
            const groupTabs = tabs.filter((tab) => tab.group === group);
            return (
              <div className="admin-nav-group" key={group}>
                <span className="admin-nav-heading">{group}</span>
                {groupTabs.map(({ key, label, icon: Icon }) => (
                  <button
                    type="button"
                    key={key}
                    className={`admin-nav-item ${activeTab === key ? "is-active" : ""}`}
                    onClick={() => changeTab(key)}
                    aria-current={activeTab === key ? "page" : undefined}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{label}</span>
                    {key === "orders" && orders.length > 0 && (
                      <span className="admin-nav-count">{orders.length}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-account">
            <div className="admin-account-avatar">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="admin-account-info">
              <strong>{user.name || "Administrator"}</strong>
              <span>Quản trị viên</span>
            </div>
          </div>
          <button type="button" className="admin-logout" onClick={logout}>
            <LogOut size={17} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={21} />
            </button>
            <div>
              <span className="admin-breadcrumb">FoodieHub / Quản trị</span>
              <h1>{activePage?.label || "Trang quản trị"}</h1>
            </div>
          </div>

          <div className="admin-topbar-user">
            <span className="admin-online-dot" />
            <span>Đang hoạt động</span>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "restaurants" && renderRestaurants()}
          {activeTab === "foods" && renderFoods()}
          {activeTab === "categories" && renderCategories()}
          {activeTab === "vouchers" && renderVouchers()}
          {activeTab === "reviews" && renderReviews()}
          {activeTab === "payments" && renderPayments()}
        </div>
      </main>
    </div>
  );
}

export default Admin;
