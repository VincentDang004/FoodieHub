const db = require("../config/db");

exports.getRestaurants = (req, res) => {
  db.query("SELECT * FROM restaurants ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Loi DB" });
    }
    res.json(rows);
  });
};

exports.createRestaurant = (req, res) => {
  const { name, address } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten nha hang" });
  }

  db.query(
    "INSERT INTO restaurants (name, address) VALUES (?, ?)",
    [name.trim(), address?.trim() || ""],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Khong the them nha hang" });
      }

      db.query("SELECT * FROM restaurants WHERE id = ?", [result.insertId], (fetchErr, rows) => {
        if (fetchErr) {
          console.log(fetchErr);
          return res.json({ message: "Them nha hang thanh cong" });
        }

        res.json({ message: "Them nha hang thanh cong", restaurant: rows[0] });
      });
    }
  );
};

exports.updateRestaurant = (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten nha hang" });
  }

  db.query(
    "UPDATE restaurants SET name = ?, address = ? WHERE id = ?",
    [name.trim(), address?.trim() || "", id],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Khong the cap nhat nha hang" });
      }

      db.query("SELECT * FROM restaurants WHERE id = ?", [id], (fetchErr, rows) => {
        if (fetchErr) {
          console.log(fetchErr);
          return res.json({ message: "Cap nhat nha hang thanh cong" });
        }

        res.json({ message: "Cap nhat nha hang thanh cong", restaurant: rows[0] });
      });
    }
  );
};

exports.deleteRestaurant = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM restaurants WHERE id = ?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Khong the xoa nha hang" });
    }

    res.json({ message: "Xoa nha hang thanh cong" });
  });
};

exports.getCategories = (req, res) => {
  db.query("SELECT * FROM categories ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Loi DB" });
    }
    res.json(rows);
  });
};

exports.createCategory = (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten danh muc" });
  }

  db.query("INSERT INTO categories (name) VALUES (?)", [name.trim()], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Khong the them danh muc" });
    }

    db.query("SELECT * FROM categories WHERE id = ?", [result.insertId], (fetchErr, rows) => {
      if (fetchErr) {
        console.log(fetchErr);
        return res.json({ message: "Them danh muc thanh cong" });
      }

      res.json({ message: "Them danh muc thanh cong", category: rows[0] });
    });
  });
};

exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten danh muc" });
  }

  db.query("UPDATE categories SET name = ? WHERE id = ?", [name.trim(), id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Khong the cap nhat danh muc" });
    }

    db.query("SELECT * FROM categories WHERE id = ?", [id], (fetchErr, rows) => {
      if (fetchErr) {
        console.log(fetchErr);
        return res.json({ message: "Cap nhat danh muc thanh cong" });
      }

      res.json({ message: "Cap nhat danh muc thanh cong", category: rows[0] });
    });
  });
};

exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM categories WHERE id = ?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Khong the xoa danh muc" });
    }

    res.json({ message: "Xoa danh muc thanh cong" });
  });
};
