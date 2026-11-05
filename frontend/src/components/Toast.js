
import { useEffect, useRef, useState } from "react";

let showGlobalToast = null;

export function showToast(message, type = "success") {
  if (showGlobalToast) {
    showGlobalToast({ message, type });
  }
}

export default function Toast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    showGlobalToast = (data) => {
      clearTimeout(timerRef.current);

      setToast(data);

      timerRef.current = setTimeout(() => {
        setToast(null);
      }, 3000);
    };

    // Chuyển alert() mặc định thành Toast
    const originalAlert = window.alert;

    const replacementAlert = (message) => {
      const content = String(message);

      const isError =
        /lỗi|thất bại|không thành công|sai mật khẩu|không hợp lệ|bị từ chối|hết hạn/i.test(
          content
        );

      showGlobalToast?.({
        message: content,
        type: isError ? "error" : "success",
      });
    };

    window.alert = replacementAlert;

    return () => {
      clearTimeout(timerRef.current);
      showGlobalToast = null;

      // Khôi phục alert mặc định
      if (window.alert === replacementAlert) {
        window.alert = originalAlert;
      }
    };
  }, []);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 99999,
        background: "#fff",
        color: "#333",
        padding: "16px 22px",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        borderLeft: `5px solid ${isError ? "#e74c3c" : "#16a34a"}`,
        minWidth: 260,
        maxWidth: 360,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 22, color: isError ? "#e74c3c" : "#16a34a" }}>
        {isError ? "✕" : "✓"}
      </span>

      <span style={{ fontSize: 14, fontWeight: 500 }}>
        {toast.message}
      </span>
    </div>
  );
}
