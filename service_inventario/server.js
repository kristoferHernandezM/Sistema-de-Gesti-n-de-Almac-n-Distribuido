const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("Conectado a MongoDB Replica Set"))
.catch(err => console.error("Error Mongo:", err));

const Producto = mongoose.model("Producto", new mongoose.Schema({
  sku: {
    type: String,
    unique: true
  },
  nombre: String,
  categoria: String,
  stock: Number,
  minStock: Number,
  precio: Number,
  nodo: String,
  estado: String,
  version: {
    type: Number,
    default: 1
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  },
  ultimaModificacion: {
    type: String,
    default: "Sistema"
  },
  lock: {
    bloqueado: {
      type: Boolean,
      default: false
    },
    por: {
      type: String,
      default: null
    },
    nodo: {
      type: String,
      default: null
    },
    fecha: {
      type: Date,
      default: null
    }
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

app.delete("/productos/:id", async (req, res) => {
  try {
    const productoActual = await Producto.findById(req.params.id);

    if (productoActual.lock?.bloqueado) {
      return res.status(423).json({
        mensaje: "No se puede eliminar. Producto bloqueado.",
        lock: productoActual.lock
      });
    }
    await Producto.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Producto eliminado" });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar producto",
      error: error.message
    });
  }
});

app.post("/productos/:id/acquire", async (req, res) => {
  try {
    const { usuario, nodo } = req.body;

    const producto = await Producto.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { "lock.bloqueado": false },
          { "lock.bloqueado": { $exists: false } }
        ]
      },
      {
        $set: {
          "lock.bloqueado": true,
          "lock.por": usuario || "Usuario Web",
          "lock.nodo": nodo || "Nodo desconocido",
          "lock.fecha": new Date()
        }
      },
      { new: true }
    );

    if (!producto) {
      return res.status(423).json({
        mensaje: "Producto bloqueado por otro usuario o nodo"
      });
    }

    res.json({
      mensaje: "Lock adquirido",
      producto
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al adquirir lock",
      error: error.message
    });
  }
});

app.post("/productos/:id/release", async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "lock.bloqueado": false,
          "lock.por": null,
          "lock.nodo": null,
          "lock.fecha": null
        }
      },
      { new: true }
    );

    res.json({
      mensaje: "Lock liberado",
      producto
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al liberar lock",
      error: error.message
    });
  }
});

app.put("/productos/:id", async (req, res) => {
  try {
    const productoActual = await Producto.findById(req.params.id);

    if (!productoActual) {
      return res.status(404).json({
        mensaje: "Producto no encontrado"
      });
    }

    if (
      productoActual.lock?.bloqueado &&
      productoActual.lock?.por !== req.body.usuarioLock
    ) {
      return res.status(423).json({
        mensaje: "No se puede editar. Producto bloqueado por otro usuario.",
        lock: productoActual.lock
      });
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          nombre: req.body.nombre,
          sku: req.body.sku,
          categoria: req.body.categoria,
          stock: req.body.stock,
          minStock: req.body.minStock,
          precio: req.body.precio,
          estado: req.body.estado,
          nodo: req.body.nodo,
          ultimaActualizacion: new Date(),
          ultimaModificacion: req.body.ultimaModificacion,

          "lock.bloqueado": false,
          "lock.por": null,
          "lock.nodo": null,
          "lock.fecha": null
        },
        $inc: {
          version: 1
        }
      },
      { new: true }
    );

    res.json({
      mensaje: "Producto actualizado y lock liberado",
      producto
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar producto",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`service_inventario corriendo en puerto ${PORT}`);
});