const Produk = require("../models/Produk");
const Cart = require("../models/KeranjangBelanja");
const asyncHandler = require("express-async-handler");
const Akun = require("../models/Akun");
const Pesanan = require("../models/Pesanan");
const uuid = require("uuid");

const tambahPesanan = asyncHandler(async (req, res) => {
  const {
    barangPesanan,
    alamatPengiriman,
    metodePembayaran,
    hargaBarang,
    ongkir,
    totalPembayaran,
  } = req.body;

  const kode = uuid.v4();
  const kodetanpastrip = kode.replace(/-/g, "");
  const kodePembayaran = `${kodetanpastrip}${barangPesanan.idProduk}`;
  const pembeli = await Akun.findById(req.user._id).select("-password");

  if (barangPesanan && barangPesanan.length === 0) {
    res.status(400);
    throw new Error("Barang tidak ditemukan");
    return;
  } else {
    const order = new Pesanan({
      barangPesanan,
      pembeli: pembeli,
      namaPembeli: pembeli.nama,
      emailPembeli: pembeli.email,
      avatar: pembeli.avatar,
      alamatPengiriman,
      hargaBarang,
      ongkir,
      metodePembayaran,
      totalPembayaran,
      kodePembayaran: kodePembayaran,
    });

    const buatPesanan = order.save();
    res.status(201).json(buatPesanan);
  }
});

const detailPesanan = asyncHandler(async (req, res) => {
  const order = await Pesanan.findById(req.params.id).populated(
    "pembeli",
    "namaPembeli",
    "emailPembeli",
    "avatar"
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404);
    throw new Error("Pesanan tidak ditemukan");
  }
});

const updatePesananDibayar = asyncHandler(async (req, res) => {
  const order = await Pesanan.findById(req.params.id);

  if (order) {
    order.sudahBayar = true;
    order.tanggalBayar = Date.now();

    const statusPembayaran = await order.save();
    res.status(201).json(statusPembayaran);
  } else {
    res.status(404);
    throw new Error("Pesanan tidak ditemukan");
  }
});

const updatePesananDikirim = asyncHandler(async (req, res) => {
  const order = await Pesanan.findById(req.params.id);

  if (order) {
    order.sudahDikirim = true;
    order.tanggalDikirim = Date.now();

    const statusPembayaran = await order.save();
    res.status(201).json(statusPembayaran);
  } else {
    res.status(404);
    throw new Error("Pesanan tidak ditemukan");
  }
});

const pesananSaya = asyncHandler(async (req, res) => {
  const pesanan = await Pesanan.find({ pembeli: req.user._id });
  res.json(pesanan);
});

const seluruhPesanan = asyncHandler(async (req, res) => {
  const pesanan = await Pesanan.find({}).populate(
    "pembeli",
    "namaPembeli",
    "emailPembeli",
    "avatar"
  );
  res.json(pesanan);
});

module.exports = {
  tambahPesanan,
  detailPesanan,
  updatePesananDibayar,
  updatePesananDikirim,
  pesananSaya,
  seluruhPesanan,
};