import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: res.data.email || email,
            name: res.data.name || "",
            role: res.data.role || "user"
          })
        );
        alert("Đăng nhập thành công");
        nav(res.data.role === "admin" ? "/admin" : "/home");
      } else {
        alert(res.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
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
          {"Đăng nhập vào FoodieHub"}
        </h2>

        <input
          placeholder="Email"
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
          onFocus={(e) => {
            e.target.style.borderColor = "#ff6b6b";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
          }}
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
          onFocus={(e) => {
            e.target.style.borderColor = "#ff6b6b";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ddd";
          }}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="btn"
          style={{ width: "100%", marginTop: 25, fontSize: 18 }}
        >
          {"Đăng nhập"}
        </button>

        <p
          onClick={() => nav("/register")}
          style={{
            marginTop: 20,
            color: "#ff6b6b",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          {"Chưa có tài khoản? Đăng ký ngay"}
        </p>
      </div>
    </div>
  );
}
