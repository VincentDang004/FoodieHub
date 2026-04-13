const RestaurantModel = require("../models/RestaurantModel");
const CategoryModel = require("../models/CategoryModel");

exports.getRestaurants = (req, res) => {
  RestaurantModel.getAll()
    .then((rows) => res.json(rows))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Loi DB" });
    });
};

exports.createRestaurant = (req, res) => {
  const { name, address } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten nha hang" });
  }

  RestaurantModel.create({ name: name.trim(), address: address?.trim() || "" })
    .then((restaurant) => {
      if (!restaurant) {
        return res.json({ message: "Them nha hang thanh cong" });
      }

      res.json({ message: "Them nha hang thanh cong", restaurant });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the them nha hang" });
    });
};

exports.updateRestaurant = (req, res) => {
  const { id } = req.params;
  const { name, address } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten nha hang" });
  }

  RestaurantModel.update({ id, name: name.trim(), address: address?.trim() || "" })
    .then((restaurant) => {
      if (!restaurant) {
        return res.json({ message: "Cap nhat nha hang thanh cong" });
      }

      res.json({ message: "Cap nhat nha hang thanh cong", restaurant });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the cap nhat nha hang" });
    });
};

exports.deleteRestaurant = (req, res) => {
  const { id } = req.params;

  RestaurantModel.remove(id)
    .then(() => res.json({ message: "Xoa nha hang thanh cong" }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the xoa nha hang" });
    });
};

exports.getCategories = (req, res) => {
  CategoryModel.getAll()
    .then((rows) => res.json(rows))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Loi DB" });
    });
};

exports.createCategory = (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten danh muc" });
  }

  CategoryModel.create({ name: name.trim() })
    .then((category) => {
      if (!category) {
        return res.json({ message: "Them danh muc thanh cong" });
      }

      res.json({ message: "Them danh muc thanh cong", category });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the them danh muc" });
    });
};

exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Thieu ten danh muc" });
  }

  CategoryModel.update({ id, name: name.trim() })
    .then((category) => {
      if (!category) {
        return res.json({ message: "Cap nhat danh muc thanh cong" });
      }

      res.json({ message: "Cap nhat danh muc thanh cong", category });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the cap nhat danh muc" });
    });
};

exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  CategoryModel.remove(id)
    .then(() => res.json({ message: "Xoa danh muc thanh cong" }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the xoa danh muc" });
    });
};
