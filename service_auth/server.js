const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ironclad";

mongoose.connect(MONGO_URI)
  .then(() => console.log("service_auth conectado a MongoDB Replica Set"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  idEmpleado: {
    type: String,
    required: true,
    unique: true
  },
  nodo: String,
  password: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    default: "operador"
  },
  estado: {
    type: String,
    default: "Activo"
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
}));

app.get("/", (req, res) => {
  res.json({ mensaje: "service_auth funcionando" });
});

app.post("/registro", async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);

    res.json({
      mensaje: "Personal registrado correctamente",
      usuario
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar personal",
      error: error.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { idEmpleado, correo, password } = req.body;

    const usuario = await Usuario.findOne({
      $or: [
        { idEmpleado: idEmpleado || correo }
      ],
      password
    });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    res.json({
      mensaje: "Login correcto",
      usuario
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error en login",
      error: error.message
    });
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener usuarios",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`service_auth corriendo en puerto ${PORT}`);
});