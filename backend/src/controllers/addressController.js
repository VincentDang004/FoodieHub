const AddressModel = require("../models/AddressModel");

exports.getMyAddresses = (req, res) => {
  AddressModel.findByUserId(req.user.id)
    .then((rows) => res.json(rows || []))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the tai dia chi" });
    });
};

exports.createMyAddress = (req, res) => {
  const { address } = req.body;

  if (!address || !address.trim()) {
    return res.status(400).json({ message: "Thieu dia chi" });
  }

  AddressModel.create({ user_id: req.user.id, address: address.trim() })
    .then((created) => res.json({ message: "Them dia chi thanh cong", address: created }))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the them dia chi" });
    });
};

exports.updateMyAddress = (req, res) => {
  const { id } = req.params;
  const { address } = req.body;

  if (!address || !address.trim()) {
    return res.status(400).json({ message: "Thieu dia chi" });
  }

  AddressModel.findById(id)
    .then((row) => {
      if (!row) {
        return res.status(404).json({ message: "Khong tim thay dia chi" });
      }

      if (String(row.user_id) !== String(req.user.id) && req.user.role !== "admin") {
        return res.status(403).json({ message: "Khong co quyen cap nhat dia chi nay" });
      }

      return AddressModel.update({
        id,
        user_id: row.user_id,
        address: address.trim()
      }).then((updated) => res.json({ message: "Cap nhat dia chi thanh cong", address: updated }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the cap nhat dia chi" });
    });
};

exports.deleteMyAddress = (req, res) => {
  const { id } = req.params;

  AddressModel.findById(id)
    .then((row) => {
      if (!row) {
        return res.status(404).json({ message: "Khong tim thay dia chi" });
      }

      if (String(row.user_id) !== String(req.user.id) && req.user.role !== "admin") {
        return res.status(403).json({ message: "Khong co quyen xoa dia chi nay" });
      }

      return AddressModel.remove(id).then(() => res.json({ message: "Xoa dia chi thanh cong" }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the xoa dia chi" });
    });
};

exports.getAllAddresses = (req, res) => {
  AddressModel.getAllWithUsers()
    .then((rows) => res.json(rows || []))
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the tai danh sach dia chi" });
    });
};

exports.updateAddressByAdmin = (req, res) => {
  const { id } = req.params;
  const { user_id, address } = req.body;

  if (!user_id || !address || !address.trim()) {
    return res.status(400).json({ message: "Thieu user hoac dia chi" });
  }

  AddressModel.findById(id)
    .then((row) => {
      if (!row) {
        return res.status(404).json({ message: "Khong tim thay dia chi" });
      }

      return AddressModel.update({
        id,
        user_id,
        address: address.trim()
      }).then((updated) => res.json({ message: "Admin cap nhat dia chi thanh cong", address: updated }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the cap nhat dia chi" });
    });
};

exports.deleteAddressByAdmin = (req, res) => {
  AddressModel.findById(req.params.id)
    .then((row) => {
      if (!row) {
        return res.status(404).json({ message: "Khong tim thay dia chi" });
      }

      return AddressModel.remove(req.params.id).then(() => res.json({ message: "Admin xoa dia chi thanh cong" }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Khong the xoa dia chi" });
    });
};
