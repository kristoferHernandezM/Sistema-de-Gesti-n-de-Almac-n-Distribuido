require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "ironclad";

if (!MONGO_URI) {
  throw new Error("MONGO_URI no está definida. Revisa tu archivo .env");
}

const client = new MongoClient(MONGO_URI);

const categorias = [
  "Laptops",
  "Monitores",
  "Periféricos",
  "Cables",
  "Accesorios",
  "Redes",
  "Almacenamiento"
];

const nombres = [
  "Laptop Dell XPS 15",
  "Monitor Samsung 27",
  "Mouse Logitech MX Master",
  "Teclado Mecánico RGB",
  "Webcam Logitech C920",
  "Cable HDMI 2m",
  "Disco SSD Kingston 1TB",
  "Router TP-Link Archer",
  "Memoria USB 64GB",
  "Audífonos HyperX",
  "Impresora HP LaserJet",
  "Switch Cisco 8 Puertos",
  "Cargador USB-C 65W",
  "Base para Laptop",
  "Adaptador Ethernet USB"
];

async function seedProductos() {

  try {

    await client.connect();

    console.log("Conectado a MongoDB");

    const db = client.db(DB_NAME);

    const productosCollection =
      db.collection("productos");

    await productosCollection.deleteMany({});

    const productos = [];

    for (let i = 0; i < 100; i++) {

      const nombre =
        nombres[i % nombres.length];

      const categoria =
        categorias[i % categorias.length];

      const stock =
        Math.floor(Math.random() * 100) + 1;

      const minStock =
        Math.floor(Math.random() * 15) + 5;

      productos.push({
        _id: new ObjectId(),

        nombre: `${nombre} ${i + 1}`,

        sku: `SKU-${String(i + 1).padStart(4, "0")}`,

        categoria,

        stock,

        minStock,

        precio:
          Math.floor(Math.random() * 15000) + 250,

        estado:
          stock <= minStock
            ? "Stock Bajo"
            : "Disponible",

        nodo:
          i % 2 === 0
            ? "Nodo PC1 - La Paz"
            : "Nodo PC2 - Laptop",

        version: 1,

        ultimaActualizacion: new Date(),

        ultimaModificacion:
          i % 2 === 0
            ? "admin@inventario.com"
            : "usuario@inventario.com",

        lock: {
          bloqueado: false,
          por: null,
          nodo: null,
          fecha: null
        }
      });
    }

    await productosCollection.insertMany(productos);

    console.log("=================================");
    console.log("Productos insertados correctamente");
    console.log("=================================");
    console.log("Total productos:", productos.length);

  } catch (error) {

    console.error(
      "Error insertando productos:",
      error
    );

  } finally {

    await client.close();

    console.log("Conexión cerrada");
  }
}

seedProductos();