const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/inventario_db";

mongoose.connect(MONGO_URI)
  .then(() => console.log("service_auth conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nombre: String,
=======
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI no definida");
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("Conectado a MongoDB Replica Set"))
.catch(err => console.error("Error Mongo:", err));

const Usuario = mongoose.model("Usuario", new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
>>>>>>> 9bf6a5599a22cfcbfe8e1b9880cb27cb1cf798b8
  correo: {
    type: String,
    required: true,
    unique: true
  },
<<<<<<< HEAD
  password: String,
  rol: String
=======
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
>>>>>>> 9bf6a5599a22cfcbfe8e1b9880cb27cb1cf798b8
}));

app.get("/", (req, res) => {
  res.json({ mensaje: "service_auth funcionando" });
});

app.post("/registro", async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
<<<<<<< HEAD
    res.json({
      mensaje: "Usuario registrado correctamente",
=======

    res.json({
      mensaje: "Personal registrado correctamente",
>>>>>>> 9bf6a5599a22cfcbfe8e1b9880cb27cb1cf798b8
      usuario
    });
  } catch (error) {
    res.status(500).json({
<<<<<<< HEAD
      mensaje: "Error al registrar usuario",
=======
      mensaje: "Error al registrar personal",
>>>>>>> 9bf6a5599a22cfcbfe8e1b9880cb27cb1cf798b8
      error: error.message
    });
  }
});

app.post("/login", async (req, res) => {
  try {
<<<<<<< HEAD
    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({ correo, password });
=======

    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({
      correo,
      password
    });
>>>>>>> 9bf6a5599a22cfcbfe8e1b9880cb27cb1cf798b8

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    res.json({
      mensaje: "Login correcto",
      usuario
    });
<<<<<<< HEAD
=======

>>>>>>> 9bf6a5599a22cfcbfe8e1b9880cb27cb1cf798b8
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