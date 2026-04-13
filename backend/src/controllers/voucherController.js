const VoucherModel = require("../models/VoucherModel");

function normalizeVoucher(voucher) {
  return {
    id: voucher.id,
    code: voucher.code,
    discount: Number(voucher.discount || 0)
  };
}

exports.getVouchers = async (req, res) => {
  try {
    const rows = await VoucherModel.getAll();
    res.json((rows || []).map(normalizeVoucher));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the tai voucher" });
  }
};

exports.validateVoucher = async (req, res) => {
  const code = (req.query.code || req.body.code || "").trim().toUpperCase();

  if (!code) {
    return res.status(400).json({ message: "Thieu ma giam gia" });
  }

  try {
    const voucher = await VoucherModel.findByCode(code);
    if (!voucher) {
      return res.status(404).json({ message: "Ma giam gia khong hop le" });
    }

    res.json(normalizeVoucher(voucher));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the kiem tra voucher" });
  }
};

exports.createVoucher = async (req, res) => {
  const code = (req.body.code || "").trim().toUpperCase();
  const discount = Number(req.body.discount);

  if (!code || !Number.isFinite(discount) || discount <= 0 || discount > 100) {
    return res.status(400).json({ message: "Voucher khong hop le" });
  }

  try {
    const existing = await VoucherModel.findByCode(code);
    if (existing) {
      return res.status(409).json({ message: "Ma voucher da ton tai" });
    }

    const created = await VoucherModel.create({ code, discount });
    res.json({ message: "Them voucher thanh cong", voucher: normalizeVoucher(created) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the them voucher" });
  }
};

exports.updateVoucher = async (req, res) => {
  const code = (req.body.code || "").trim().toUpperCase();
  const discount = Number(req.body.discount);

  if (!code || !Number.isFinite(discount) || discount <= 0 || discount > 100) {
    return res.status(400).json({ message: "Voucher khong hop le" });
  }

  try {
    const updated = await VoucherModel.update({ id: req.params.id, code, discount });
    if (!updated) {
      return res.status(404).json({ message: "Khong tim thay voucher" });
    }

    res.json({ message: "Cap nhat voucher thanh cong", voucher: normalizeVoucher(updated) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the cap nhat voucher" });
  }
};

exports.deleteVoucher = async (req, res) => {
  try {
    await VoucherModel.remove(req.params.id);
    res.json({ message: "Xoa voucher thanh cong" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Khong the xoa voucher" });
  }
};
