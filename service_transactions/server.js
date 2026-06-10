const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("service_transactions conectado a MongoDB"))
.catch(err => console.error("Error Mongo:", err));

const Envio = mongoose.model("Envio", new mongoose.Schema({
  codigoEnvio: String,
  productoSku: String,
  producto: String,
  cantidad: Number,
  origen: String,
  destino: String,
  ipOrigen: String,
  ipDestino: String,
  estado: String,
  fechaSalida: Date,
  fechaEntregaEstimada: Date
}, { collection: "envios" }));

app.get("/envios", async (req, res) => {
  try {
    const envios = await Envio.find().sort({ fechaSalida: -1 });
    res.json(envios);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener envíos",
      error: error.message
    });
  }
});

app.get("/envios/resumen", async (req, res) => {
  try {
    const envios = await Envio.find();

    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();

    const enTransito = envios.filter(e => e.estado === "En tránsito").length;

    const entregasEsteMes = envios.filter(e => {
      if (e.estado !== "Entregado" || !e.fechaSalida) return false;

      const fecha = new Date(e.fechaSalida);

      return (
        fecha.getMonth() === mesActual &&
        fecha.getFullYear() === anioActual
      );
    }).length;

    const enviosConTiempo = envios.filter(e =>
      e.fechaSalida && e.fechaEntregaEstimada
    );

    let latenciaMediaHoras = 0;

    if (enviosConTiempo.length > 0) {
      const totalHoras = enviosConTiempo.reduce((total, e) => {
        const salida = new Date(e.fechaSalida);
        const entrega = new Date(e.fechaEntregaEstimada);
        const diferenciaMs = entrega - salida;
        const horas = diferenciaMs / (1000 * 60 * 60);

        return total + horas;
      }, 0);

      latenciaMediaHoras = totalHoras / enviosConTiempo.length;
    }

    const alertasCriticas = envios.filter(e => {
      if (e.estado === "Pendiente") return true;

      if (e.estado === "En tránsito" && e.fechaEntregaEstimada) {
        return new Date(e.fechaEntregaEstimada) < ahora;
      }

      return false;
    }).length;

    res.json({
      enTransito,
      entregasEsteMes,
      latenciaMediaHoras: Number(latenciaMediaHoras.toFixed(1)),
      alertasCriticas
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener resumen de envíos",
      error: error.message
    });
  }
});

app.post("/envios", async (req, res) => {
  try {
    const {
      productoSku,
      producto,
      cantidad,
      origen,
      destino
    } = req.body;

    if (!productoSku || !producto || !cantidad || !origen || !destino) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios del envío"
      });
    }

    if (origen === destino) {
      return res.status(400).json({
        mensaje: "El origen y el destino no pueden ser iguales"
      });
    }

    const ultimoEnvio = await Envio.findOne().sort({ codigoEnvio: -1 });

    let nuevoNumero = 1;

    if (ultimoEnvio && ultimoEnvio.codigoEnvio) {
      const numeroActual = Number(ultimoEnvio.codigoEnvio.replace("ENV-", ""));
      nuevoNumero = numeroActual + 1;
    }

    const codigoEnvio = `ENV-${String(nuevoNumero).padStart(3, "0")}`;

    const nuevoEnvio = await Envio.create({
      codigoEnvio,
      productoSku,
      producto,
      cantidad,
      origen,
      destino,
      estado: "Pendiente",
      fechaSalida: new Date(),
      fechaEntregaEstimada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({
      mensaje: "Envío creado correctamente",
      envio: nuevoEnvio
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear envío",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`service_transactions corriendo en puerto ${PORT}`);
});