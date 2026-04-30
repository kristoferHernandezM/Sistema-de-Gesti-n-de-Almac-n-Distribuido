const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Replica Set"))
  .catch(err => console.error("Error MongoDB:", err));

const Producto = mongoose.model("Producto", new mongoose.Schema({
  sku: String,
  nombre: String,
  categoria: String,
  stock: Number,
  nodo: String,
  estado: String
}));

app.get("/api/productos", async (req, res) => {
  const productos = await Producto.find();
  res.json(productos);
});

app.post("/api/productos", async (req, res) => {
  const producto = await Producto.create(req.body);
  res.json(producto);
});

app.listen(3000, () => {
  console.log("Gateway corriendo en puerto 3000");
});