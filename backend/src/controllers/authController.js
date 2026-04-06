const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = (req, res) => {
  const { name, email, password } = req.body;

  const hash = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hash, "user"],
    (err) => {
      if (err) {
        console.log(err);
        return res.json({ message: "Lỗi DB" });
      }

      res.json({ message: "Đăng ký thành công" });
    }
  );
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Lỗi DB" });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Không tìm thấy user" });
    }

    const user = results[0];

    const check = bcrypt.compareSync(password, user.password);

    if (!check) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign({ id: user.id, role: user.role || "user" }, "secret123");

    res.json({
      message: "Đăng nhập thành công",
      token,
      name: user.name,
      email: user.email,
      role: user.role || "user"
    });
  });
};
