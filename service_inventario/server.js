const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("service_inventario conectado a MongoDB Replica Set"))
  .catch(err => console.error("Error Mongo Inventario:", err));

const Producto = mongoose.model("Producto", new mongoose.Schema({
  sku: String,
  nombre: String,
  categoria: String,
  stock: Number,
  nodo: String,
  estado: String,
  fecha: {
    type: Date,
    default: Date.now
  }
}));

app.get("/", (req, res) => {
  res.json({ mensaje: "service_inventario funcionando" });
});

app.post("/productos", async (req, res) => {
  try {
    const producto = await Producto.create(req.body);
    res.json({
      mensaje: "Producto guardado correctamente",
      producto
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar producto",
      error: error.message
    });
  }
});

app.get("/productos", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener productos",
      error: error.message
    });
  }
});

app.put("/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      mensaje: "Producto actualizado",
      producto
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar producto",
      error: error.message
    });
  }
});

app.delete("/productos/:id", async (req, res) => {
  try {
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar producto",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`service_inventario corriendo en puerto ${PORT}`);
});