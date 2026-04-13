const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hash = bcrypt.hashSync(password, 10);
    const hasAdmin = await UserModel.hasAdminAccount();
    const role = hasAdmin ? "user" : "admin";

    await UserModel.createUser({ name, email, passwordHash: hash, role });

    res.json({
      message:
        role === "admin"
          ? "Đăng ký thành công. Đây là tài khoản admin đầu tiên."
          : "Đăng ký thành công"
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Lỗi DB" });
  }
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  UserModel.findByEmail(email)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Không tìm thấy người dùng" });
      }

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
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Lỗi DB" });
    });
};
