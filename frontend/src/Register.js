import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const register = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/register", {
        name,
        email,
        password
      });

      alert(res.data.message || "Đăng ký thành công");
      nav("/");
    } catch (err) {
      console.log(err);
      alert("Đăng ký thất bại");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)"
      }}
    >
      <div
        className="card"
        style={{
          padding: 40,
          width: 400,
          textAlign: "center"
        }}
      >
        <h2 style={{ marginBottom: 30, color: "#333", fontSize: "2rem" }}>
          {"Đăng ký tài khoản FoodieHub"}
        </h2>

        <input
          placeholder={"Tên đầy đủ"}
          className="input-field"
          style={{
            width: "100%",
            padding: 15,
            marginTop: 10,
            border: "2px solid #ddd",
            borderRadius: 25,
            fontSize: 16,
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#ff6b6b")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          className="input-field"
          style={{
            width: "100%",
            padding: 15,
            marginTop: 15,
            border: "2px solid #ddd",
            borderRadius: 25,
            fontSize: 16,
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#ff6b6b")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder={"Mật khẩu"}
          className="input-field"
          style={{
            width: "100%",
            padding: 15,
            marginTop: 15,
            border: "2px solid #ddd",
            borderRadius: 25,
            fontSize: 16,
            transition: "border-color 0.3s"
          }}
          onFocus={(e) => (e.target.style.borderColor = "#ff6b6b")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd")}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={register}
          className="btn"
          style={{ width: "100%", marginTop: 25, fontSize: 18 }}
        >
          {"Đăng ký"}
        </button>

        <p
          onClick={() => nav("/")}
          style={{
            marginTop: 20,
            color: "#ff6b6b",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          {"Đã có tài khoản? Đăng nhập ngay"}
        </p>
      </div>
    </div>
  );
}
