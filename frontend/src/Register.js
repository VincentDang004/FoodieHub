
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nav = useNavigate();

  const register = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      setError("Địa chỉ email không hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/register",
        {
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      alert(res.data.message || "Đăng ký thành công!");
      nav("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Không thể đăng ký tài khoản. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .register-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: #f5f6fa;
          font-family: Arial, sans-serif;
        }

        .register-container {
          width: 100%;
          max-width: 1000px;
          min-height: 590px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #fff;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 15px 50px rgba(30,30,30,0.09);
        }

        .register-intro {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          color: white;
          background: linear-gradient(145deg, #e74c3c, #f47765);
          overflow: hidden;
        }

        .register-intro::before,
        .register-intro::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          pointer-events: none;
        }

        .register-intro::before {
          width: 320px;
          height: 320px;
          right: -130px;
          top: -100px;
        }

        .register-intro::after {
          width: 250px;
          height: 250px;
          left: -110px;
          bottom: -100px;
        }

        .register-brand,
        .register-intro-content,
        .register-intro-footer {
          position: relative;
          z-index: 1;
        }

        .register-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 21px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .register-brand-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: rgba(255,255,255,0.2);
          font-size: 23px;
        }

        .register-intro-content {
          margin: 55px 0;
        }

        .register-intro-content h1 {
          margin: 0 0 20px;
          font-size: 36px;
          line-height: 1.3;
          font-weight: 800;
        }

        .register-intro-content p {
          max-width: 340px;
          margin: 0;
          color: rgba(255,255,255,0.88);
          font-size: 15px;
          line-height: 1.8;
        }

        .register-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 25px;
          font-size: 14px;
          color: rgba(255,255,255,0.95);
        }

        .register-feature-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(255,255,255,0.18);
        }

        .register-intro-footer {
          color: rgba(255,255,255,0.75);
          font-size: 12px;
        }

        .register-form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 45px 50px;
        }

        .register-form {
          width: 100%;
          max-width: 360px;
        }

        .register-heading {
          margin-bottom: 30px;
        }

        .register-heading h2 {
          margin: 0 0 10px;
          color: #252525;
          font-size: 29px;
          font-weight: 750;
        }

        .register-heading p {
          margin: 0;
          color: #929292;
          font-size: 14px;
          line-height: 1.6;
        }

        .register-field {
          margin-bottom: 19px;
        }

        .register-field label {
          display: block;
          margin-bottom: 9px;
          color: #444;
          font-size: 13px;
          font-weight: 700;
        }

        .register-input-wrap {
          position: relative;
        }

        .register-input {
          width: 100%;
          height: 48px;
          padding: 0 15px;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #333;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .register-input:focus {
          border-color: #e74c3c;
          box-shadow: 0 0 0 3px rgba(231,76,60,0.09);
        }

        .register-password-input {
          padding-right: 75px;
        }

        .register-show-password {
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

        .register-show-password:hover {
          color: #e74c3c;
        }

        .register-hint {
          margin: 7px 0 0;
          color: #999;
          font-size: 11px;
        }

        .register-error {
          margin: 0 0 17px;
          padding: 12px 14px;
          border: 1px solid #ffd9d5;
          border-radius: 9px;
          background: #fff5f4;
          color: #d94335;
          font-size: 13px;
          line-height: 1.5;
        }

        .register-submit {
          width: 100%;
          height: 49px;
          margin-top: 6px;
          border: none;
          border-radius: 10px;
          background: #e74c3c;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .register-submit:hover:not(:disabled) {
          background: #d83e30;
          transform: translateY(-1px);
        }

        .register-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .register-login {
          margin-top: 24px;
          text-align: center;
          color: #888;
          font-size: 13px;
        }

        .register-login button {
          padding: 0;
          border: none;
          background: none;
          color: #e74c3c;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .register-login button:hover {
          text-decoration: underline;
        }

        @media (max-width: 760px) {
          .register-page {
            padding: 18px;
          }

          .register-container {
            max-width: 470px;
            min-height: auto;
            grid-template-columns: 1fr;
          }

          .register-intro {
            min-height: 170px;
            padding: 25px 28px;
          }

          .register-intro-content {
            margin: 25px 0 5px;
          }

          .register-intro-content h1 {
            font-size: 25px;
            margin-bottom: 8px;
          }

          .register-intro-content p,
          .register-feature,
          .register-intro-footer {
            display: none;
          }

          .register-form-panel {
            padding: 32px 28px 38px;
          }

          .register-heading {
            margin-bottom: 25px;
          }

          .register-heading h2 {
            font-size: 25px;
          }
        }
      `}</style>

      <div className="register-container">
        {/* BRAND PANEL */}
        <div className="register-intro">
          <div className="register-brand">
            <div className="register-brand-icon">🍔</div>
            <span>FOODIEHUB</span>
          </div>

          <div className="register-intro-content">
            <h1>
              Bắt đầu hành trình
              <br />
              thưởng thức món ngon
            </h1>

            <p>
              Tạo tài khoản FoodieHub để khám phá thực đơn,
              lưu địa chỉ giao hàng và quản lý những đơn
              hàng yêu thích của bạn.
            </p>

            <div className="register-feature">
              <span className="register-feature-icon">✓</span>
              <span>Tạo tài khoản nhanh chóng</span>
            </div>

            <div className="register-feature">
              <span className="register-feature-icon">✓</span>
              <span>Lưu thông tin giao hàng tiện lợi</span>
            </div>
          </div>

          <div className="register-intro-footer">
            © 2026 FoodieHub. All rights reserved.
          </div>
        </div>

        {/* REGISTER FORM */}
        <div className="register-form-panel">
          <form className="register-form" onSubmit={register}>
            <div className="register-heading">
              <h2>Tạo tài khoản</h2>
              <p>
                Điền thông tin bên dưới để tham gia FoodieHub.
              </p>
            </div>

            <div className="register-field">
              <label htmlFor="register-name">
                Họ và tên
              </label>

              <input
                id="register-name"
                type="text"
                className="register-input"
                placeholder="Nhập họ và tên của bạn"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-email">
                Địa chỉ email
              </label>

              <input
                id="register-email"
                type="email"
                className="register-input"
                placeholder="example@gmail.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label htmlFor="register-password">
                Mật khẩu
              </label>

              <div className="register-input-wrap">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="register-input register-password-input"
                  placeholder="Tạo mật khẩu"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="register-show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <p className="register-hint">
                Mật khẩu cần có ít nhất 6 ký tự.
              </p>
            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>

            <div className="register-login">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => nav("/")}
              >
                Đăng nhập ngay
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
