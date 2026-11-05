
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nav = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      if (res.data.token) {
        const userData = res.data.user || res.data;

        localStorage.setItem("token", res.data.token);

        localStorage.setItem(
          "user",
          JSON.stringify({
            email: userData.email || email.trim(),
            name: userData.name || "",
            role: userData.role || "user",
          })
        );

        nav(userData.role === "admin" ? "/admin" : "/home");
      } else {
        setError(res.data.message || "Đăng nhập thất bại.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Email hoặc mật khẩu không chính xác."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #f5f6fa;
          font-family: Arial, sans-serif;
        }

        .login-container {
          width: 100%;
          max-width: 1000px;
          min-height: 590px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #fff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 15px 50px rgba(30, 30, 30, 0.09);
        }

        .login-intro {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          color: white;
          background: linear-gradient(145deg, #e74c3c, #f47765);
          overflow: hidden;
        }

        .login-intro::before,
        .login-intro::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          pointer-events: none;
        }

        .login-intro::before {
          width: 320px;
          height: 320px;
          right: -130px;
          top: -100px;
        }

        .login-intro::after {
          width: 250px;
          height: 250px;
          left: -110px;
          bottom: -100px;
        }

        .login-brand,
        .login-intro-content,
        .login-intro-footer {
          position: relative;
          z-index: 1;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .login-brand-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: rgba(255,255,255,0.2);
          font-size: 23px;
        }

        .login-intro-content {
          margin: 55px 0;
        }

        .login-intro-content h1 {
          margin: 0 0 20px;
          font-size: 36px;
          line-height: 1.3;
          font-weight: 800;
        }

        .login-intro-content p {
          max-width: 340px;
          margin: 0;
          color: rgba(255,255,255,0.88);
          font-size: 15px;
          line-height: 1.8;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 25px;
          font-size: 14px;
          color: rgba(255,255,255,0.95);
        }

        .login-feature-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(255,255,255,0.18);
        }

        .login-intro-footer {
          color: rgba(255,255,255,0.75);
          font-size: 12px;
        }

        .login-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 55px 50px;
        }

        .login-form {
          width: 100%;
          max-width: 360px;
        }

        .login-heading {
          margin-bottom: 35px;
        }

        .login-heading h2 {
          margin: 0 0 10px;
          color: #252525;
          font-size: 29px;
          font-weight: 750;
        }

        .login-heading p {
          margin: 0;
          color: #929292;
          font-size: 14px;
          line-height: 1.6;
        }

        .login-field {
          margin-bottom: 21px;
        }

        .login-field label {
          display: block;
          margin-bottom: 9px;
          color: #444;
          font-size: 13px;
          font-weight: 700;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input {
          width: 100%;
          height: 49px;
          padding: 0 15px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #333;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .login-input:focus {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231,76,60,0.09);
        }

        .login-password-input {
          padding-right: 75px;
        }

        .login-show-password {
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          padding: 5px;
          border: none;
          background: transparent;
          color: #888;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-show-password:hover {
          color: #e74c3c;
        }

        .login-error {
          margin: 0 0 18px;
          padding: 12px 14px;
          border: 1px solid #ffd9d5;
          border-radius: 9px;
          background: #fff5f4;
          color: #d94335;
          font-size: 13px;
          line-height: 1.5;
        }

        .login-submit {
          width: 100%;
          height: 49px;
          margin-top: 7px;
          border: none;
          border-radius: 10px;
          background: #e74c3c;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .login-submit:hover:not(:disabled) {
          background: #d83e30;
          transform: translateY(-1px);
        }

        .login-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .login-register {
          margin-top: 27px;
          text-align: center;
          color: #888;
          font-size: 13px;
        }

        .login-register button {
          padding: 0;
          border: none;
          background: none;
          color: #e74c3c;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .login-register button:hover {
          text-decoration: underline;
        }

        @media (max-width: 760px) {
          .login-page {
            padding: 18px;
          }

          .login-container {
            max-width: 470px;
            min-height: auto;
            grid-template-columns: 1fr;
          }

          .login-intro {
            min-height: 190px;
            padding: 25px 28px;
          }

          .login-intro-content {
            margin: 25px 0 5px;
          }

          .login-intro-content h1 {
            font-size: 25px;
            margin-bottom: 8px;
          }

          .login-intro-content p,
          .login-feature,
          .login-intro-footer {
            display: none;
          }

          .login-form-panel {
            padding: 35px 28px 40px;
          }

          .login-heading {
            margin-bottom: 27px;
          }

          .login-heading h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="login-container">
        {/* BRAND PANEL */}
        <div className="login-intro">
          <div className="login-brand">
            <div className="login-brand-icon">🍔</div>
            <span>FOODIEHUB</span>
          </div>

          <div className="login-intro-content">
            <h1>
              Món ngon ngay
              <br />
              trong tầm tay
            </h1>

            <p>
              Khám phá những món ăn yêu thích, đặt hàng
              nhanh chóng và tận hưởng trải nghiệm ẩm thực
              tiện lợi cùng FoodieHub.
            </p>

            <div className="login-feature">
              <span className="login-feature-icon">✓</span>
              <span>Đặt món nhanh chóng, dễ dàng</span>
            </div>

            <div className="login-feature">
              <span className="login-feature-icon">✓</span>
              <span>Quản lý đơn hàng thuận tiện</span>
            </div>
          </div>

          <div className="login-intro-footer">
            © 2026 FoodieHub. All rights reserved.
          </div>
        </div>

        {/* LOGIN FORM */}
        <div className="login-form-panel">
          <form className="login-form" onSubmit={login}>
            <div className="login-heading">
              <h2>Chào mừng trở lại!</h2>
              <p>
                Đăng nhập để tiếp tục sử dụng FoodieHub.
              </p>
            </div>

            <div className="login-field">
              <label htmlFor="login-email">Địa chỉ email</label>

              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="Nhập email của bạn"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Mật khẩu</label>

              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input login-password-input"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="login-show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="login-register">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => nav("/register")}
              >
                Đăng ký ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
