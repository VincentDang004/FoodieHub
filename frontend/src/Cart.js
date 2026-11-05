
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  clearCart,
  fetchCart,
  removeCartItem,
  syncLegacyLocalCart,
  updateCartItem
} from "./cartApi";

const API_URL = "http://localhost:3001";

function calculateDiscount(subtotal, voucher) {
  if (!voucher) return 0;

  return Math.round(
    (Number(subtotal || 0) * Number(voucher.discount || 0)) / 100
  );
}

function getImageUrl(image) {
  if (!image) return "";

  if (image.startsWith("http")) return image;

  return `${API_URL}/${image.replace(/^\/+/, "")}`;
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

export default function Cart() {
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    totalItems: 0
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [activeVoucher, setActiveVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Tải giỏ hàng, địa chỉ và voucher
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        const [nextCart, addressRes, voucherRes] = await Promise.all([
          syncLegacyLocalCart(),
          axios.get(`${API_URL}/api/addresses/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }),
          axios.get(`${API_URL}/api/vouchers`)
        ]);

        if (!isMounted) return;

        const rows = addressRes.data || [];

        setCart(nextCart);
        setAddresses(rows);

        if (rows.length > 0) {
          setSelectedAddressId(String(rows[0].id));
        }

        setVouchers(voucherRes.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu giỏ hàng:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Tải lại giỏ hàng
  const reloadCart = async () => {
    const latest = await fetchCart();
    setCart(latest);
    return latest;
  };

  // Địa chỉ đang chọn
  const getSelectedAddress = () =>
    addresses.find(
      (row) => String(row.id) === String(selectedAddressId)
    );

  // Tính tiền
  const subtotal = Number(cart.total || 0);

  const discountAmount = useMemo(
    () => calculateDiscount(subtotal, activeVoucher),
    [activeVoucher, subtotal]
  );

  const total = Math.max(0, subtotal - discountAmount);

  const totalQuantity = cart.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // Danh sách voucher theo thứ tự
  const availableVouchers = [
    "GIAM5",
    "FREESHIP5",
    "GIAM20",
    "GIAM10"
  ]
    .map((code) =>
      vouchers.find(
        (voucher) =>
          String(voucher.code).toUpperCase() === code
      )
    )
    .filter(Boolean);

  // Mở modal voucher
  const openVoucherModal = () => {
    setSelectedVoucherCode(activeVoucher?.code || "");
    setShowVoucherModal(true);
  };

  // Áp dụng voucher
  const applyVoucher = async (codeToApply = selectedVoucherCode) => {
    if (!codeToApply.trim()) {
      alert("Vui lòng chọn voucher");
      return;
    }

    setApplyingVoucher(true);

    try {
      const res = await axios.get(
        `${API_URL}/api/vouchers/validate`,
        {
          params: {
            code: codeToApply.trim()
          }
        }
      );

      setActiveVoucher(res.data);
      setShowVoucherModal(false);

      alert(`Đã áp dụng voucher ${res.data.code}`);
    } catch (error) {
      setActiveVoucher(null);

      alert(
        error.response?.data?.message ||
        "Không thể áp dụng voucher"
      );
    } finally {
      setApplyingVoucher(false);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (itemId, nextQuantity) => {
    try {
      const nextCart = await updateCartItem(itemId, nextQuantity);
      setCart(nextCart);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể cập nhật số lượng"
      );
    }
  };

  // Xóa món ăn
  const removeItem = async (itemId) => {
    try {
      const nextCart = await removeCartItem(itemId);
      setCart(nextCart);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể xóa món"
      );
    }
  };

  // Tạo đơn hàng
  const createOrder = async (orderItems) => {
    const token = localStorage.getItem("token");
    const selectedAddress = getSelectedAddress();

    if (!selectedAddress?.address) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return null;
    }

    const res = await axios.post(
      `${API_URL}/api/orders`,
      {
        items: orderItems.map((item) => ({
          foodId: item.foodId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        shippingAddress: selectedAddress.address,
        voucherCode: activeVoucher?.code || ""
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.data;
  };

  // Đặt một món
  const placeOrderForItem = async (item) => {
    try {
      setSubmitting(true);

      const created = await createOrder([item]);

      if (!created) return;

      await removeCartItem(item.id);
      setCart(await fetchCart());

      alert("Đặt hàng thành công");
      navigate("/orders");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể đặt hàng"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Đặt tất cả món
  const placeAllOrders = async () => {
    if (!cart.items.length) {
      alert("Giỏ hàng trống");
      return;
    }

    try {
      setSubmitting(true);

      const created = await createOrder(cart.items);

      if (!created) return;

      await clearCart();
      await reloadCart();

      alert("Đã chuyển đơn hàng sang trang đơn hàng");
      navigate("/orders");
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Không thể đặt hàng"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="tf-cart-loading">
        <div className="tf-cart-spinner"></div>
        <h3>Đang tải giỏ hàng...</h3>
        <p>Chờ một chút nha!</p>
      </div>
    );
  }

  return (
    <div className="tf-cart">
      <style>{`
        .tf-cart {
          min-height: 100vh;
          background: #f5f6fa;
          padding: 32px 40px 60px;
          color: #252b3b;
          box-sizing: border-box;
        }

        .tf-cart * {
          box-sizing: border-box;
        }

        .tf-cart-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* HEADER */

        .tf-cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .tf-cart-header h1 {
          margin: 0 0 7px;
          color: #202638;
          font-size: 27px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .tf-cart-header p {
          margin: 0;
          color: #9299a9;
          font-size: 14px;
        }

        .tf-cart-count {
          padding: 10px 15px;
          border: 1px solid #e9ebf1;
          border-radius: 11px;
          background: #fff;
          color: #697184;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* MAIN LAYOUT */

        .tf-cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.85fr);
          gap: 22px;
          align-items: start;
        }

        .tf-cart-left,
        .tf-cart-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .tf-cart-right {
          position: sticky;
          top: 20px;
        }

        /* SECTION */

        .tf-cart-section {
          padding: 22px;
          border: 1px solid #e9ebf1;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 4px 16px rgba(30, 40, 70, 0.035);
          min-width: 0;
        }

        .tf-cart-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 19px;
        }

        .tf-cart-section-header h2 {
          margin: 0;
          color: #252b3b;
          font-size: 17px;
          font-weight: 800;
        }

        .tf-cart-section-header span {
          color: #9299a9;
          font-size: 12px;
        }

        /* ADDRESS */

        .tf-cart-address-select {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #e1e4eb;
          border-radius: 10px;
          background: #fff;
          color: #424a5b;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }

        .tf-cart-address-select:focus {
          border-color: #ed737d;
          box-shadow: 0 0 0 3px rgba(233, 79, 96, 0.08);
        }

        .tf-cart-address-note {
          margin: 12px 0 0;
          color: #9299a9;
          font-size: 12px;
          line-height: 1.6;
        }

        /* CART ITEMS */

        .tf-cart-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 0;
          border-bottom: 1px solid #eff0f4;
          min-width: 0;
        }

        .tf-cart-item:first-child {
          padding-top: 0;
        }

        .tf-cart-item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }

        .tf-cart-item-image {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 12px;
          object-fit: cover;
          background: #f0f1f5;
        }

        .tf-cart-item-placeholder {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #f0f1f5;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 35px;
        }

        .tf-cart-item-info {
          flex: 1;
          min-width: 0;
        }

        .tf-cart-item-name {
          margin-bottom: 7px;
          color: #252b3b;
          font-size: 15px;
          font-weight: 800;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .tf-cart-item-unit-price {
          color: #9299a9;
          font-size: 12px;
        }

        .tf-cart-item-total {
          margin-top: 9px;
          color: #e94f60;
          font-size: 15px;
          font-weight: 800;
        }

        /* QUANTITY */

        .tf-cart-quantity {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding: 4px;
          border: 1px solid #eceef3;
          border-radius: 9px;
          background: #fafbfc;
        }

        .tf-cart-quantity button {
          width: 27px;
          height: 27px;
          border: none;
          border-radius: 7px;
          background: #fff;
          color: #555e70;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .tf-cart-quantity button:hover {
          background: #fff0f1;
          color: #e94f60;
        }

        .tf-cart-quantity strong {
          min-width: 14px;
          color: #333b4d;
          font-size: 13px;
          text-align: center;
        }

        /* ITEM ACTIONS */

        .tf-cart-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 9px;
        }

        .tf-cart-remove {
          border: none;
          border-radius: 8px;
          padding: 8px 11px;
          background: #fff0f1;
          color: #e94f60;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .tf-cart-remove:hover {
          background: #ffe1e4;
        }

        .tf-cart-order-one {
          border: none;
          border-radius: 8px;
          padding: 9px 12px;
          background: #e94f60;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .tf-cart-order-one:hover:not(:disabled) {
          background: #d83e50;
        }

        .tf-cart-order-one:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* VOUCHER */

        .tf-cart-voucher-button {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid #e9ebf1;
          border-radius: 11px;
          background: #fff;
          color: #555e70;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .tf-cart-voucher-button:hover {
          border-color: #ed737d;
          background: #fffafa;
        }

        .tf-cart-voucher-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tf-cart-voucher-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #fff0f1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .tf-cart-voucher-arrow {
          color: #9299a9;
          font-size: 22px;
        }

        .tf-cart-voucher-active {
          margin-top: 13px;
          padding: 13px;
          border-radius: 11px;
          border: 1px solid #d9efe0;
          background: #f0faf3;
          color: #268449;
          font-size: 12px;
          line-height: 1.7;
        }

        .tf-cart-voucher-active strong {
          display: block;
          font-size: 13px;
        }

        .tf-cart-voucher-remove {
          margin-top: 5px;
          padding: 0;
          border: none;
          background: transparent;
          color: #e94f60;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        /* SUMMARY */

        .tf-cart-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #858d9e;
          font-size: 13px;
        }

        .tf-cart-summary-row strong {
          color: #3d4556;
          font-size: 13px;
          text-align: right;
        }

        .tf-cart-summary-discount {
          color: #269b59 !important;
        }

        .tf-cart-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding-top: 18px;
          margin-top: 18px;
          border-top: 1px dashed #dfe2e9;
        }

        .tf-cart-summary-total strong {
          color: #252b3b;
          font-size: 14px;
        }

        .tf-cart-total-price {
          color: #e94f60;
          font-size: 23px;
          font-weight: 800;
          text-align: right;
        }

        .tf-cart-checkout {
          width: 100%;
          margin-top: 22px;
          padding: 15px;
          border: none;
          border-radius: 11px;
          background: #e94f60;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .tf-cart-checkout:hover:not(:disabled) {
          background: #d83e50;
          transform: translateY(-2px);
          box-shadow: 0 7px 17px rgba(233, 79, 96, 0.18);
        }

        .tf-cart-checkout:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tf-cart-summary-note {
          margin: 12px 0 0;
          color: #a0a6b3;
          font-size: 11px;
          line-height: 1.6;
          text-align: center;
        }

        /* EMPTY */

        .tf-cart-empty {
          padding: 65px 20px;
          border: 1px solid #e9ebf1;
          border-radius: 17px;
          background: #fff;
          text-align: center;
        }

        .tf-cart-empty-icon {
          margin-bottom: 15px;
          font-size: 55px;
        }

        .tf-cart-empty h2 {
          margin: 0 0 9px;
          color: #252b3b;
          font-size: 20px;
        }

        .tf-cart-empty p {
          margin: 0;
          color: #9299a9;
          font-size: 13px;
        }

        .tf-cart-back-button {
          margin-top: 22px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          background: #e94f60;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .tf-cart-back-button:hover {
          background: #d83e50;
        }

        /* MODAL */

        .tf-voucher-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 16px;
          background: rgba(25, 31, 45, 0.48);
          backdrop-filter: blur(3px);
        }

        .tf-voucher-modal {
          width: 100%;
          max-width: 450px;
          max-height: 85vh;
          overflow-y: auto;
          padding: 23px;
          border: 1px solid #e9ebf1;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 15px 50px rgba(0,0,0,0.16);
          animation: tf-voucher-show 0.2s ease;
        }

        @keyframes tf-voucher-show {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tf-voucher-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .tf-voucher-header h2 {
          margin: 0;
          color: #252b3b;
          font-size: 19px;
          font-weight: 800;
        }

        .tf-voucher-close {
          width: 33px;
          height: 33px;
          border: none;
          border-radius: 9px;
          background: #f3f4f7;
          color: #697184;
          font-size: 23px;
          cursor: pointer;
        }

        .tf-voucher-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 15px;
          margin-bottom: 11px;
          border: 1px solid #e9ebf1;
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          transition: 0.2s;
        }

        .tf-voucher-option:hover {
          border-color: #ed9ba2;
        }

        .tf-voucher-option.selected {
          border: 1.5px solid #e94f60;
          background: #fff6f6;
        }

        .tf-voucher-option strong {
          color: #303849;
          font-size: 14px;
        }

        .tf-voucher-option p {
          margin: 5px 0 0;
          color: #9299a9;
          font-size: 12px;
        }

        .tf-voucher-radio {
          width: 18px;
          height: 18px;
          accent-color: #e94f60;
          cursor: pointer;
          flex-shrink: 0;
        }

        .tf-voucher-empty {
          padding: 30px 10px;
          color: #9299a9;
          font-size: 13px;
          text-align: center;
        }

        .tf-voucher-apply {
          width: 100%;
          padding: 13px;
          margin-top: 8px;
          border: none;
          border-radius: 10px;
          background: #e94f60;
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .tf-voucher-apply:hover:not(:disabled) {
          background: #d83e50;
        }

        .tf-voucher-apply:disabled {
          background: #c9cbd2;
          cursor: not-allowed;
        }

        /* LOADING */

        .tf-cart-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #f5f6fa;
          color: #252b3b;
        }

        .tf-cart-loading h3 {
          margin: 18px 0 5px;
          font-size: 17px;
        }

        .tf-cart-loading p {
          color: #9299a9;
          font-size: 13px;
        }

        .tf-cart-spinner {
          width: 38px;
          height: 38px;
          border: 4px solid #f5dfe2;
          border-top-color: #e94f60;
          border-radius: 50%;
          animation: tf-cart-spin 0.8s linear infinite;
        }

        @keyframes tf-cart-spin {
          to { transform: rotate(360deg); }
        }

        /* RESPONSIVE */

        @media (max-width: 950px) {
          .tf-cart-layout {
            grid-template-columns: 1fr;
          }

          .tf-cart-right {
            position: static;
          }
        }

        @media (max-width: 650px) {
          .tf-cart {
            padding: 22px 16px 40px;
          }

          .tf-cart-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .tf-cart-header h1 {
            font-size: 23px;
          }

          .tf-cart-section {
            padding: 17px;
          }

          .tf-cart-item {
            flex-wrap: wrap;
            gap: 12px;
          }

          .tf-cart-item-image,
          .tf-cart-item-placeholder {
            width: 76px;
            height: 76px;
          }

          .tf-cart-item-info {
            flex: 1;
            min-width: 0;
          }

          .tf-cart-item-actions {
            width: 100%;
            flex-direction: row;
            justify-content: flex-end;
            align-items: center;
          }

          .tf-cart-total-price {
            font-size: 20px;
          }
        }

        @media (max-width: 360px) {
          .tf-cart-item-image,
          .tf-cart-item-placeholder {
            width: 65px;
            height: 65px;
          }

          .tf-cart-item-name {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="tf-cart-container">

        {/* HEADER */}
        <div className="tf-cart-header">
          <div>
            <h1>Giỏ hàng của bạn</h1>
            <p>Kiểm tra món ăn và hoàn tất đơn hàng của bạn.</p>
          </div>

          <div className="tf-cart-count">
            {totalQuantity} sản phẩm
          </div>
        </div>

        {cart.items.length === 0 ? (
          /* EMPTY CART */
          <div className="tf-cart-empty">
            <div className="tf-cart-empty-icon">🛒</div>

            <h2>Giỏ hàng đang trống</h2>

            <p>
              Bạn chưa có món ăn nào. Hãy khám phá thực đơn TFOOD nhé!
            </p>

            <button
              type="button"
              className="tf-cart-back-button"
              onClick={() => navigate("/home")}
            >
              Khám phá món ăn
            </button>
          </div>
        ) : (
          <div className="tf-cart-layout">

            {/* LEFT COLUMN */}
            <div className="tf-cart-left">

              {/* ADDRESS */}
              <section className="tf-cart-section">
                <div className="tf-cart-section-header">
                  <h2>Địa chỉ giao hàng</h2>
                </div>

                {addresses.length === 0 ? (
                  <>
                    <p className="tf-cart-address-note">
                      Bạn chưa có địa chỉ giao hàng.
                      Vui lòng thêm địa chỉ trước khi đặt hàng.
                    </p>

                    <button
                      type="button"
                      className="tf-cart-back-button"
                      onClick={() => navigate("/profile")}
                    >
                      Thêm địa chỉ giao hàng
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      value={selectedAddressId}
                      onChange={(e) =>
                        setSelectedAddressId(e.target.value)
                      }
                      className="tf-cart-address-select"
                    >
                      {addresses.map((row) => (
                        <option key={row.id} value={row.id}>
                          {row.address}
                        </option>
                      ))}
                    </select>

                    <p className="tf-cart-address-note">
                      Đơn hàng sẽ được giao đến địa chỉ bạn đã chọn.
                    </p>
                  </>
                )}
              </section>

              {/* FOOD LIST */}
              <section className="tf-cart-section">
                <div className="tf-cart-section-header">
                  <h2>Danh sách món ăn</h2>
                  <span>{cart.items.length} món</span>
                </div>

                {cart.items.map((item) => (
                  <div key={item.id} className="tf-cart-item">

                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="tf-cart-item-image"
                      />
                    ) : (
                      <div className="tf-cart-item-placeholder">
                        🍽️
                      </div>
                    )}

                    <div className="tf-cart-item-info">
                      <div className="tf-cart-item-name">
                        {item.name}
                      </div>

                      <div className="tf-cart-item-unit-price">
                        Đơn giá: {formatMoney(item.price)}
                      </div>

                      <div className="tf-cart-quantity">
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <div className="tf-cart-item-total">
                        {formatMoney(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        )}
                      </div>
                    </div>

                    <div className="tf-cart-item-actions">
                      <button
                        type="button"
                        className="tf-cart-remove"
                        disabled={submitting}
                        onClick={() => removeItem(item.id)}
                      >
                        Xóa món
                      </button>

                      <button
                        type="button"
                        className="tf-cart-order-one"
                        disabled={submitting || addresses.length === 0}
                        onClick={() => placeOrderForItem(item)}
                      >
                        Đặt món này
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="tf-cart-right">

              {/* VOUCHER */}
              <section className="tf-cart-section">
                <div className="tf-cart-section-header">
                  <h2>Ưu đãi dành cho bạn</h2>
                </div>

                <button
                  type="button"
                  className="tf-cart-voucher-button"
                  onClick={openVoucherModal}
                >
                  <span className="tf-cart-voucher-left">
                    <span className="tf-cart-voucher-icon">
                      %
                    </span>

                    <span>
                      {activeVoucher
                        ? `Voucher ${activeVoucher.code}`
                        : "Chọn mã giảm giá"}
                    </span>
                  </span>

                  <span className="tf-cart-voucher-arrow">
                    ›
                  </span>
                </button>

                {activeVoucher && (
                  <div className="tf-cart-voucher-active">
                    <strong>
                      Đã áp dụng: {activeVoucher.code}
                    </strong>

                    Giảm {Number(activeVoucher.discount)}%

                    <br />

                    <button
                      type="button"
                      className="tf-cart-voucher-remove"
                      onClick={() => {
                        setActiveVoucher(null);
                        setSelectedVoucherCode("");
                      }}
                    >
                      Bỏ voucher
                    </button>
                  </div>
                )}
              </section>

              {/* PAYMENT SUMMARY */}
              <section className="tf-cart-section">
                <div className="tf-cart-section-header">
                  <h2>Chi tiết thanh toán</h2>
                </div>

                <div className="tf-cart-summary-row">
                  <span>Số lượng món</span>
                  <strong>{totalQuantity}</strong>
                </div>

                <div className="tf-cart-summary-row">
                  <span>Tạm tính</span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>

                <div className="tf-cart-summary-row">
                  <span>Giảm giá</span>

                  <strong className="tf-cart-summary-discount">
                    −{formatMoney(discountAmount)}
                  </strong>
                </div>

                <div className="tf-cart-summary-total">
                  <strong>Tổng thanh toán</strong>

                  <div className="tf-cart-total-price">
                    {formatMoney(total)}
                  </div>
                </div>

                <button
                  type="button"
                  className="tf-cart-checkout"
                  onClick={placeAllOrders}
                  disabled={submitting || addresses.length === 0}
                >
                  {submitting
                    ? "ĐANG XỬ LÝ..."
                    : "ĐẶT TẤT CẢ ĐƠN HÀNG"}
                </button>

                {addresses.length === 0 && (
                  <p className="tf-cart-summary-note">
                    Vui lòng thêm địa chỉ giao hàng trước khi đặt hàng.
                  </p>
                )}

                <p className="tf-cart-summary-note">
                  Vui lòng kiểm tra thông tin trước khi đặt hàng.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* VOUCHER MODAL */}
      {showVoucherModal && (
        <div
          className="tf-voucher-overlay"
          onClick={() => setShowVoucherModal(false)}
        >
          <div
            className="tf-voucher-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tf-voucher-header">
              <h2>Chọn Voucher</h2>

              <button
                type="button"
                className="tf-voucher-close"
                onClick={() => setShowVoucherModal(false)}
              >
                ×
              </button>
            </div>

            {availableVouchers.length === 0 ? (
              <div className="tf-voucher-empty">
                Không tìm thấy voucher trong danh sách.
              </div>
            ) : (
              availableVouchers.map((voucher) => (
                <label
                  key={voucher.id || voucher.code}
                  className={`tf-voucher-option ${
                    selectedVoucherCode === voucher.code
                      ? "selected"
                      : ""
                  }`}
                >
                  <div>
                    <strong>{voucher.code}</strong>

                    <p>
                      Giảm {Number(voucher.discount)}%
                    </p>
                  </div>

                  <input
                    type="radio"
                    name="selectedVoucher"
                    className="tf-voucher-radio"
                    value={voucher.code}
                    checked={
                      selectedVoucherCode === voucher.code
                    }
                    onChange={() =>
                      setSelectedVoucherCode(voucher.code)
                    }
                  />
                </label>
              ))
            )}

            <button
              type="button"
              className="tf-voucher-apply"
              disabled={
                !selectedVoucherCode ||
                applyingVoucher ||
                availableVouchers.length === 0
              }
              onClick={() => applyVoucher(selectedVoucherCode)}
            >
              {applyingVoucher
                ? "Đang kiểm tra..."
                : "Áp dụng Voucher"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
