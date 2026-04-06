const db = require("../config/db");

exports.getFoods = (req, res) => {
  const { category } = req.query;

  if (category) {
    const searchMap = {
      "Mì & Phở": ["Mì", "Phở"],
      Cơm: ["Cơm"],
      "Bánh & Bánh Mì": ["Bánh", "Bánh Mì"],
      "Đồ Uống": ["Nước", "Trà", "Cafe", "Cà phê", "Soda"],
      "Tráng Miệng": ["Kem", "Chè", "Flan", "Bánh"]
    };

    const parts = (searchMap[category] || category)
      .split(/[,;&/]+|\s+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length > 0) {
      const conditions = parts.map(() => "name LIKE ?").join(" OR ");
      const params = parts.map((part) => `%${part}%`);

      db.query(`SELECT * FROM foods WHERE ${conditions}`, params, (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Loi tai mon an theo danh muc" });
        }

        return res.json(rows);
      });
      return;
    }
  }

  db.query("SELECT * FROM foods ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Loi tai mon an" });
    }

    res.json(rows);
  });
};

exports.createFood = (req, res) => {
  const { name, price, image } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ message: "Thieu ten mon an hoac gia tien" });
  }

  db.query(
    "INSERT INTO foods (name,price,image) VALUES (?,?,?)",
    [name, price, image || ""],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Khong the them mon an" });
      }

      db.query("SELECT * FROM foods WHERE id = ?", [result.insertId], (fetchErr, rows) => {
        if (fetchErr) {
          console.error(fetchErr);
          return res.json({ message: "Them mon thanh cong" });
        }

        res.json({ message: "Them mon thanh cong", food: rows[0] });
      });
    }
  );
};

exports.updateFood = (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ message: "Thieu ten mon an hoac gia tien" });
  }

  db.query(
    "UPDATE foods SET name=?,price=?,image=? WHERE id=?",
    [name, price, image || "", id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Khong the cap nhat mon an" });
      }

      db.query("SELECT * FROM foods WHERE id = ?", [id], (fetchErr, rows) => {
        if (fetchErr) {
          console.error(fetchErr);
          return res.json({ message: "Cap nhat thanh cong" });
        }

        res.json({ message: "Cap nhat thanh cong", food: rows[0] });
      });
    }
  );
};

exports.deleteFood = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM foods WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Khong the xoa mon an" });
    }

    res.json({ message: "Xoa thanh cong" });
  });
};
