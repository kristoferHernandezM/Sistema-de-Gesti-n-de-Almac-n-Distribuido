const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const Producto = mongoose.model("Producto", new mongoose.Schema({}, { strict: false }), "productos");

app.get("/reportes", async (req, res) => {
  try {
    const productos = await Producto.find();

    const totalProductos = productos.length;
    const stockTotal = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const stockBajo = productos.filter(p => Number(p.stock || 0) <= Number(p.minStock || 10)).length;

    const categorias = {};
    productos.forEach(p => {
      const cat = p.categoria || "Sin categoría";
      categorias[cat] = (categorias[cat] || 0) + 1;
    });

    const categoryData = Object.entries(categorias).map(([name, value]) => ({
      name,
      value
    }));

    const topProducts = productos
      .sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))
      .slice(0, 5)
      .map(p => ({
        name: p.nombre,
        sales: p.stock || 0,
        revenue: Number(p.precio || 0) * Number(p.stock || 0)
      }));

    res.json({
      kpis: {
        totalProductos,
        stockTotal,
        stockBajo
      },
      categoryData,
      topProducts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando reportes" });
  }
});

app.listen(3005, () => {
  console.log("service_reports corriendo en puerto 3004");
});