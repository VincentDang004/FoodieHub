import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { clearCart, fetchCart, removeCartItem, syncLegacyLocalCart, updateCartItem } from "./cartApi";

function calculateDiscount(subtotal, voucher) {
  if (!voucher) return 0;
  return Math.round((Number(subtotal || 0) * Number(voucher.discount || 0)) / 100);
}

export default function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0, totalItems: 0 });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const [nextCart, addressRes, voucherRes] = await Promise.all([
          syncLegacyLocalCart(),
          axios.get("http://localhost:3001/api/addresses/me", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:3001/api/vouchers")
        ]);

        const rows = addressRes.data || [];
        setCart(nextCart);
        setAddresses(rows);
        if (rows.length > 0) {
          setSelectedAddressId(String(rows[0].id));
        }
        setVouchers(voucherRes.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [navigate]);

  const reloadCart = async () => {
    const latest = await fetchCart();
    setCart(latest);
    return latest;
  };

  const getSelectedAddress = () => addresses.find((row) => String(row.id) === String(selectedAddressId));

  const subtotal = Number(cart.total || 0);
  const discountAmount = useMemo(
    () => calculateDiscount(subtotal, activeVoucher),
    [activeVoucher, subtotal]
  );
  const total = Math.max(0, subtotal - discountAmount);

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setActiveVoucher(null);
      return;
    }

    setApplyingVoucher(true);
    try {
      const res = await axios.get("http://localhost:3001/api/vouchers/validate", {
        params: { code: voucherCode.trim() }
      });
      setActiveVoucher(res.data);
      alert(`Đã áp dụng voucher ${res.data.code}`);
    } catch (error) {
      setActiveVoucher(null);
      alert(error.response?.data?.message || "Không thể áp dụng voucher");
    } finally {
      setApplyingVoucher(false);
    }
  };

  const updateQuantity = async (itemId, nextQuantity) => {
    try {
      const nextCart = await updateCartItem(itemId, nextQuantity);
      setCart(nextCart);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể cập nhật số lượng");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const nextCart = await removeCartItem(itemId);
      setCart(nextCart);
    } catch (error) {
      alert(error.response?.data?.message || "Không thể xoá món");
    }
  };

  const createOrder = async (orderItems) => {
    const token = localStorage.getItem("token");
    const selectedAddress = getSelectedAddress();

    if (!selectedAddress?.address) {
      alert("Vui lòng chọn địa chỉ giao hàng");
      return null;
    }

    const res = await axios.post(
      "http://localhost:3001/api/orders",
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
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

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
      alert(error.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

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
      alert(error.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h2 style={{ color: "white", fontSize: "2.5rem", textAlign: "center", marginBottom: "30px" }}>
        Giỏ hàng của bạn
      </h2>
      {cart.items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>Giỏ hàng của bạn đang trống.Hãy thêm món ăn ngay nào.</p>
          <button onClick={() => navigate("/home")} className="btn" style={{ marginTop: "20px" }}>
            Quay lại trang chủ
          </button>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0 }}>Địa chỉ giao hàng</h3>
            {addresses.length === 0 ? (
              <>
                <p style={{ color: "#666" }}>Bạn chưa có địa chỉ nào. Cần thêm địa chỉ trước khi đặt hàng.</p>
                <button onClick={() => navigate("/profile")} className="btn">
                  Đến trang tài khoản để thêm địa chỉ
                </button>
              </>
            ) : (
              <>
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="input-field"
                  style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid #eee" }}
                >
                  {addresses.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.address}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: 12, color: "#555", lineHeight: 1.6 }}>
                  Dia chi da chon: {getSelectedAddress()?.address || "Chua chon"}
                </div>
              </>
            )}
          </div>

          <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0 }}>Voucher</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã giảm giá"
                className="input-field"
                style={{ flex: 1, minWidth: 220, padding: 14, borderRadius: 14, border: "2px solid #eee" }}
              />
              <button onClick={applyVoucher} className="btn" disabled={applyingVoucher}>
                {applyingVoucher ? "Đang kiểm tra..." : "Áp dụng"}
              </button>
              {activeVoucher && (
                <button
                  onClick={() => {
                    setActiveVoucher(null);
                    setVoucherCode("");
                  }}
                  className="btn btn-danger"
                >
                  Bo voucher
                </button>
              )}
            </div>
            {vouchers.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ marginBottom: 10, fontWeight: 700 }}>Voucher co san</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {vouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 14,
                        background: "#f8f9fa",
                        color: "#333"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{voucher.code}</div>
                        <div style={{ color: "#666" }}>Giam {Number(voucher.discount).toLocaleString()}%</div>
                      </div>
                      <button
                        onClick={() => {
                          setVoucherCode(voucher.code);
                          setActiveVoucher(voucher);
                        }}
                        className="btn"
                      >
                        Chon
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeVoucher && (
              <div style={{ marginTop: 12, color: "#0f5132", fontWeight: 700 }}>
                Đang áp dụng {activeVoucher.code} giảm {Number(activeVoucher.discount).toLocaleString()}%
              </div>
            )}
          </div>

          <div className="grid" style={{ marginBottom: "30px" }}>
            {cart.items.map((item) => (
              <div key={item.id} className="card" style={{ display: "flex", flexDirection: "column", padding: "20px" }}>
                {item.image && (
                  <img
                    src={`http://localhost:3001/${item.image}`}
                    alt={item.name}
                    style={{ width: "100%", height: 180, objectFit: "cover", marginBottom: "15px", borderRadius: "8px" }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "10px" }}>{item.name}</div>
                  <div style={{ color: "#666", marginBottom: "10px" }}>
                    Số lượng:
                    <div style={{ display: "inline-flex", gap: 8, marginLeft: 10, alignItems: "center" }}>
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="btn btn-danger">
                        -
                      </button>
                      <strong>{item.quantity}</strong>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="price">{Number(item.price || 0).toLocaleString()} VND</div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button
                    onClick={() => placeOrderForItem(item)}
                    className="btn"
                    style={{ flex: 1 }}
                    disabled={submitting || addresses.length === 0}
                  >
                    Dat hang
                  </button>
                  <button onClick={() => removeItem(item.id)} className="btn btn-danger" style={{ flex: 1 }}>
                    Xoa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{ textAlign: "center", padding: "30px" }}>
            <div style={{ color: "#666", marginBottom: 10 }}>Tạm tính: {subtotal.toLocaleString()} VND</div>
            <div style={{ color: "#666", marginBottom: 10 }}>Gỉam giá: {discountAmount.toLocaleString()} VND</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px", color: "#4caf50" }}>
              Tổng cộng: {total.toLocaleString()} VND
            </div>
            <button
              onClick={placeAllOrders}
              className="btn"
              style={{ fontSize: "1.2rem", padding: "15px 30px" }}
              disabled={submitting || addresses.length === 0}
            >
              Đặt tất cả đơn hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
}
