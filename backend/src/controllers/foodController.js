const FoodModel = require("../models/FoodModel");

function buildSearchParts(categoryName) {
  const searchMap = {
    "Mì & Phở": ["Mì", "Phở"],
    Cơm: ["Cơm"],
    "Bánh & Bánh Mì": ["Bánh", "Bánh Mì"],
    "Đồ Uống": ["Nước", "Trà", "Cafe", "Cà phê", "Soda"],
    "Tráng Miệng": ["Kem", "Chè", "Flan", "Bánh"]
  };

  const rawSearch = searchMap[categoryName] || categoryName;
  return Array.isArray(rawSearch)
    ? rawSearch
    : String(rawSearch || "")
        .split(/[,;&/]+|\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

exports.getFoods = async (req, res) => {
  const { category, category_id, category_name } = req.query;
  const parsedCategoryId = Number(category_id || category);
  const hasCategoryId = Number.isInteger(parsedCategoryId) && parsedCategoryId > 0;
  const resolvedCategoryName =
    (typeof category_name === "string" && category_name.trim()) ||
    (!hasCategoryId && typeof category === "string" ? category.trim() : "");

  try {
    if (hasCategoryId) {
      const rows = await FoodModel.getAll({ categoryId: parsedCategoryId });

      if (rows.length > 0 || !resolvedCategoryName) {
        return res.json(rows);
      }
    }

    if (resolvedCategoryName) {
      const parts = buildSearchParts(resolvedCategoryName);

      if (parts.length > 0) {
        const rows = await FoodModel.searchByNameParts(parts);
        return res.json(rows);
      }
    }

    const rows = await FoodModel.getAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: hasCategoryId || resolvedCategoryName ? "Loi tai mon an theo danh muc" : "Loi tai mon an" });
  }
};

exports.createFood = (req, res) => {
  const { name, price, image, category_id, restaurant_id } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ message: "Thieu ten mon an hoac gia tien" });
  }

  FoodModel.create({
    name,
    price,
    image,
    category_id: category_id || null,
    restaurant_id: restaurant_id || null
  })
    .then((food) => {
      if (!food) {
        return res.json({ message: "Them mon thanh cong" });
      }

      res.json({ message: "Them mon thanh cong", food });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Khong the them mon an" });
    });
};

exports.updateFood = (req, res) => {
  const { id } = req.params;
  const { name, price, image, category_id, restaurant_id } = req.body;

  if (!name || price === undefined || price === null) {
    return res.status(400).json({ message: "Thieu ten mon an hoac gia tien" });
  }

  FoodModel.update({
    id,
    name,
    price,
    image,
    category_id: category_id || null,
    restaurant_id: restaurant_id || null
  })
    .then((food) => {
      if (!food) {
        return res.json({ message: "Cap nhat thanh cong" });
      }

      res.json({ message: "Cap nhat thanh cong", food });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Khong the cap nhat mon an" });
    });
};

exports.deleteFood = (req, res) => {
  const { id } = req.params;

  FoodModel.remove(id)
    .then(() => res.json({ message: "Xoa thanh cong" }))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: "Khong the xoa mon an" });
    });
};
