const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Servir frontend
app.use("/frontend", express.static(path.join(__dirname, "../frontend")));

// Ruta principal
app.get("/", (req, res) => {
  res.redirect("/frontend/login.html");
});

// AUTH → service_auth
app.post("/api/auth/registro", async (req, res) => {
  try {
    const response = await axios.post("http://service_auth:3001/registro", req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error en gateway registro",
      error: error.message
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await axios.post("http://service_auth:3001/login", req.body);
    res.json(response.data);
  } catch (error) {
    res.status(401).json({
      mensaje: "Credenciales incorrectas o error en auth",
      error: error.message
    });
  }
});

// INVENTARIO → service_inventario
app.get("/api/productos", async (req, res) => {
  try {
    const response = await axios.get("http://service_inventario:3002/productos");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error obteniendo productos",
      error: error.message
    });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    const response = await axios.post("http://service_inventario:3002/productos", req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error creando producto",
      error: error.message
    });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const response = await axios.put(`http://service_inventario:3002/productos/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error actualizando producto",
      error: error.message
    });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const response = await axios.delete(`http://service_inventario:3002/productos/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error eliminando producto",
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log("Gateway corriendo en puerto 3000");
});