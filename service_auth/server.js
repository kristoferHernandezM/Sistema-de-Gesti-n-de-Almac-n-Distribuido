const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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
  correo: {
    type: String,
    required: true,
    unique: true
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

    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({
      correo,
      password
    });

    if (!usuario) {
  return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    if (usuario.estado !== "Activo") {
      return res.status(403).json({
        mensaje: "Cuenta inactiva. Contacta al administrador."
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

app.post("/usuarios", async (req, res) => {
  try {
    const usuario = await Usuario.create({
      ...req.body,
      password: req.body.password || "123456",
      idEmpleado: req.body.idEmpleado || Date.now().toString()
    });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear usuario",
      error: error.message
    });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  try {
    console.log("ID recibido:", req.params.id);
    console.log("BODY recibido:", req.body);

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar usuario",
      error: error.message
    });
  }
});

app.delete("/usuarios/:id", async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar usuario",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`service_auth corriendo en puerto ${PORT}`);
});