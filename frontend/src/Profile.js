import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const initialAddressForm = { address: "" };

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
      const res = await axios.get("http://localhost:3001/api/addresses/me", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setAddresses(res.data || []);
      return res.data || [];
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Kh\u00f4ng th\u1ec3 t\u1ea3i \u0111\u1ecba ch\u1ec9");
      return [];
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
    loadAddresses(token);
  }, [navigate, token]);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
  };

  const submitAddress = async () => {
    if (!addressForm.address.trim()) {
      alert("Vui l\u00f2ng nh\u1eadp \u0111\u1ecba ch\u1ec9");
      return;
    }

    setSavingAddress(true);

    try {
      const payload = { address: addressForm.address.trim() };

      if (editingAddressId) {
        await axios.put(`http://localhost:3001/api/addresses/${editingAddressId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("C\u1eadp nh\u1eadt \u0111\u1ecba ch\u1ec9 th\u00e0nh c\u00f4ng");
      } else {
        await axios.post("http://localhost:3001/api/addresses/me", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Th\u00eam \u0111\u1ecba ch\u1ec9 th\u00e0nh c\u00f4ng");
      }

      resetAddressForm();
      const latest = await loadAddresses(token);
      if (!latest.some((row) => row.address === payload.address)) {
        alert("\u0110\u1ecba ch\u1ec9 ch\u01b0a ph\u1ea3n \u00e1nh \u0111\u00fang tr\u00ean danh s\u00e1ch. H\u00e3y t\u1ea3i l\u1ea1i trang v\u00e0 ki\u1ec3m tra l\u1ea1i.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Kh\u00f4ng th\u1ec3 l\u01b0u \u0111\u1ecba ch\u1ec9");
    } finally {
      setSavingAddress(false);
    }
  };

  const startEditAddress = (row) => {
    setEditingAddressId(row.id);
    setAddressForm({ address: row.address || "" });
  };

  const deleteAddress = async (id) => {
    if (!window.confirm("B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00f3a \u0111\u1ecba ch\u1ec9 n\u00e0y kh\u00f4ng?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("X\u00f3a \u0111\u1ecba ch\u1ec9 th\u00e0nh c\u00f4ng");
      if (editingAddressId === id) {
        resetAddressForm();
      }
      await loadAddresses(token);
    } catch (error) {
      alert(error.response?.data?.message || "Kh\u00f4ng th\u1ec3 x\u00f3a \u0111\u1ecba ch\u1ec9");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>{"Th\u00f4ng tin t\u00e0i kho\u1ea3n"}</h2>
      {user.email ? (
        <div style={{ marginTop: 20 }}>
          <div>
            <strong>Email:</strong> {user.email}
          </div>
          <div>
            <strong>{"T\u00ean:"}</strong> {user.name || "Ch\u01b0a c\u00f3"}
          </div>
        </div>
      ) : (
        <p>{"B\u1ea1n ch\u01b0a \u0111\u0103ng nh\u1eadp ho\u1eb7c th\u00f4ng tin ch\u01b0a \u0111\u01b0\u1ee3c l\u01b0u."}</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginTop: 30
        }}
      >
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 20,
            background: "#fff"
          }}
        >
          <h3 style={{ marginTop: 0 }}>{editingAddressId ? "S\u1eeda \u0111\u1ecba ch\u1ec9" : "Th\u00eam \u0111\u1ecba ch\u1ec9 m\u1edbi"}</h3>
          <textarea
            value={addressForm.address}
            onChange={(e) => setAddressForm({ address: e.target.value })}
            placeholder={"Nh\u1eadp \u0111\u1ecba ch\u1ec9 giao h\u00e0ng"}
            rows={4}
            className="input-field"
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "2px solid #eee", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={submitAddress} className="btn" disabled={savingAddress}>
              {savingAddress ? "\u0110ang l\u01b0u..." : editingAddressId ? "C\u1eadp nh\u1eadt \u0111\u1ecba ch\u1ec9" : "Th\u00eam \u0111\u1ecba ch\u1ec9"}
            </button>
            {editingAddressId && (
              <button onClick={resetAddressForm} className="btn btn-danger">
                {"H\u1ee7y s\u1eeda"}
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 16,
            padding: 20,
            background: "#fff"
          }}
        >
          <h3 style={{ marginTop: 0 }}>{"\u0110\u1ecba ch\u1ec9 c\u1ee7a b\u1ea1n"}</h3>
          {addresses.length === 0 ? (
            <p style={{ color: "#666", marginBottom: 0 }}>{"Ch\u01b0a c\u00f3 \u0111\u1ecba ch\u1ec9 n\u00e0o trong t\u00e0i kho\u1ea3n n\u00e0y."}</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {addresses.map((row) => (
                <div
                  key={row.id}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 14,
                    padding: 16,
                    background: "#fff7f8"
                  }}
                >
                  <div style={{ color: "#333", lineHeight: 1.6 }}>{row.address || "Ch\u01b0a c\u00f3 \u0111\u1ecba ch\u1ec9"}</div>
                  <div style={{ color: "#999", marginTop: 8 }}>{"ID \u0111\u1ecba ch\u1ec9: "}{row.id}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                    <button onClick={() => startEditAddress(row)} className="btn">
                      {"S\u1eeda"}
                    </button>
                    <button onClick={() => deleteAddress(row.id)} className="btn btn-danger">
                      {"X\u00f3a"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
