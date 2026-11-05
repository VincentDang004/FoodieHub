
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const initialAddressForm = { address: "" };

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 24px",
    background: "#f5f6fa",
    boxSizing: "border-box",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: "#252525",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#888",
    fontSize: 14,
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 3px 15px rgba(0,0,0,0.03)",
    minWidth: 0,
  },
  cardTitle: {
    margin: "0 0 20px",
    fontSize: 18,
    fontWeight: 700,
    color: "#292929",
  },
  label: {
    display: "block",
    color: "#888",
    fontSize: 13,
    marginBottom: 7,
  },
  value: {
    color: "#333",
    fontSize: 15,
    fontWeight: 600,
    overflowWrap: "anywhere",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 10,
    border: "1px solid #e5e5e5",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#fff",
    color: "#333",
  },
  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: 9,
    background: "#e74c3c",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "11px 18px",
    border: "1px solid #e5e5e5",
    borderRadius: 9,
    background: "#fff",
    color: "#555",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  dangerButton: {
    padding: "9px 15px",
    border: "1px solid #ffe0dd",
    borderRadius: 8,
    background: "#fff5f4",
    color: "#e74c3c",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default function Profile() {
  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(initialAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const loadAddresses = async (authToken) => {
    try {
      const res = await axios.get(
        "http://localhost:3001/api/addresses/me",
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setAddresses(res.data || []);
      return res.data || [];
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          "Không thể tải địa chỉ"
      );
      return [];
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setUser(storedUser);
    loadAddresses(token);
  }, [navigate, token]);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
  };

  const submitAddress = async () => {
    if (!addressForm.address.trim()) {
      alert("Vui lòng nhập địa chỉ");
      return;
    }

    setSavingAddress(true);

    try {
      const payload = {
        address: addressForm.address.trim(),
      };

      if (editingAddressId) {
        await axios.put(
          `http://localhost:3001/api/addresses/${editingAddressId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Cập nhật địa chỉ thành công");
      } else {
        await axios.post(
          "http://localhost:3001/api/addresses/me",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        alert("Thêm địa chỉ thành công");
      }

      resetAddressForm();

      const latest = await loadAddresses(token);

      if (!latest.some((row) => row.address === payload.address)) {
        alert(
          "Địa chỉ chưa phản ánh đúng trên danh sách. Hãy tải lại trang và kiểm tra lại."
        );
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể lưu địa chỉ"
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const startEditAddress = (row) => {
    setEditingAddressId(row.id);
    setAddressForm({
      address: row.address || "",
    });
  };

  const deleteAddress = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa địa chỉ này không?"
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3001/api/addresses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Xóa địa chỉ thành công");

      if (editingAddressId === id) {
        resetAddressForm();
      }

      await loadAddresses(token);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa địa chỉ"
      );
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>Tài khoản của tôi</h1>
          <p style={styles.subtitle}>
            Quản lý thông tin cá nhân và địa chỉ giao hàng
          </p>
        </div>

        {/* ACCOUNT INFORMATION */}
        <div
          style={{
            ...styles.card,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: "#fff0ee",
                color: "#e74c3c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 25,
                fontWeight: 700,
              }}
            >
              {(user.name || user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: "#292929",
                }}
              >
                {user.name || "Người dùng"}
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#999",
                  fontSize: 13,
                }}
              >
                Thông tin tài khoản
              </p>
            </div>
          </div>

          {user.email ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
                paddingTop: 20,
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <div>
                <span style={styles.label}>Họ và tên</span>
                <div style={styles.value}>
                  {user.name }
                </div>
              </div>

              <div>
                <span style={styles.label}>Email</span>
                <div style={styles.value}>
                  {user.email}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "#888", margin: 0 }}>
              Bạn chưa đăng nhập hoặc thông tin chưa được lưu.
            </p>
          )}
        </div>

        {/* ADDRESS MANAGEMENT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ADDRESS FORM */}
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "#fff0ee",
                  color: "#e74c3c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {editingAddressId ? "✎" : "+"}
              </div>

              <div>
                <h3
                  style={{
                    ...styles.cardTitle,
                    margin: 0,
                  }}
                >
                  {editingAddressId
                    ? "Chỉnh sửa địa chỉ"
                    : "Thêm địa chỉ mới"}
                </h3>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  {editingAddressId
                    ? "Cập nhật thông tin giao hàng"
                    : "Lưu địa chỉ để thuận tiện đặt hàng"}
                </p>
              </div>
            </div>

            <label
              style={{
                ...styles.label,
                color: "#555",
                fontWeight: 600,
              }}
            >
              Địa chỉ giao hàng
            </label>

            <textarea
              value={addressForm.address}
              onChange={(e) =>
                setAddressForm({
                  address: e.target.value,
                })
              }
              placeholder="Nhập địa chỉ giao hàng của bạn..."
              rows={5}
              style={{
                ...styles.input,
                resize: "vertical",
                lineHeight: 1.6,
                minHeight: 120,
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={submitAddress}
                disabled={savingAddress}
                style={{
                  ...styles.primaryButton,
                  opacity: savingAddress ? 0.65 : 1,
                  cursor: savingAddress
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {savingAddress
                  ? "Đang lưu..."
                  : editingAddressId
                  ? "Cập nhật địa chỉ"
                  : "Thêm địa chỉ"}
              </button>

              {editingAddressId && (
                <button
                  onClick={resetAddressForm}
                  style={styles.secondaryButton}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </div>

          {/* ADDRESS LIST */}
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 22,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3
                  style={{
                    ...styles.cardTitle,
                    margin: 0,
                  }}
                >
                  Địa chỉ của bạn
                </h3>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  Danh sách địa chỉ đã lưu
                </p>
              </div>

              <span
                style={{
                  padding: "6px 11px",
                  borderRadius: 20,
                  background: "#fff0ee",
                  color: "#e74c3c",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {addresses.length} địa chỉ
              </span>
            </div>

            {addresses.length === 0 ? (
              <div
                style={{
                  padding: "40px 15px",
                  textAlign: "center",
                  background: "#fafafa",
                  borderRadius: 12,
                  border: "1px dashed #e5e5e5",
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    marginBottom: 12,
                    color: "#bbb",
                  }}
                >
                  ⌖
                </div>

                <p
                  style={{
                    color: "#666",
                    fontSize: 14,
                    margin: 0,
                    fontWeight: 600,
                  }}
                >
                  Chưa có địa chỉ nào
                </p>

                <p
                  style={{
                    color: "#aaa",
                    fontSize: 12,
                    margin: "7px 0 0",
                  }}
                >
                  Hãy thêm địa chỉ giao hàng đầu tiên của bạn.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 14,
                }}
              >
                {addresses.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      padding: 17,
                      border: "1px solid #eee",
                      borderRadius: 12,
                      background: "#fff",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          flexShrink: 0,
                          borderRadius: 10,
                          background: "#fff0ee",
                          color: "#e74c3c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 17,
                        }}
                      >
                        ⌖
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            color: "#333",
                            fontSize: 14,
                            lineHeight: 1.7,
                            fontWeight: 500,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {row.address || "Chưa có địa chỉ"}
                        </div>

                        <div
                          style={{
                            color: "#aaa",
                            fontSize: 12,
                            marginTop: 7,
                          }}
                        >
                          ID địa chỉ: {row.id}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 9,
                        marginTop: 16,
                        paddingTop: 13,
                        borderTop: "1px solid #f3f3f3",
                      }}
                    >
                      <button
                        onClick={() => startEditAddress(row)}
                        style={{
                          ...styles.secondaryButton,
                          padding: "8px 14px",
                          fontSize: 13,
                        }}
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => deleteAddress(row.id)}
                        style={styles.dangerButton}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
