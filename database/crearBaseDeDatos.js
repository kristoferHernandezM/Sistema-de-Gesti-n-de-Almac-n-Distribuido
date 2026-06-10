require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "ironclad";

if (!MONGO_URI) {
  throw new Error("MONGO_URI no está definida. Revisa tu archivo .env");
}

const client = new MongoClient(MONGO_URI);

async function crearBaseDeDatos() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");

    const db = client.db(DB_NAME);

    await db.collection("usuarios").drop().catch(() => {});
    await db.collection("productos").drop().catch(() => {});
    await db.collection("nodos").drop().catch(() => {});
    await db.collection("envios").drop().catch(() => {});
    await db.collection("movimientos").drop().catch(() => {});
    await db.collection("reportes").drop().catch(() => {});

    const usuarios = db.collection("usuarios");
    const productos = db.collection("productos");
    const nodos = db.collection("nodos");
    const envios = db.collection("envios");
    const movimientos = db.collection("movimientos");
    const reportes = db.collection("reportes");

    const nodosData = [
      {
        _id: new ObjectId(),
        nombre: "Centro Logístico La Paz",
        ubicacion: "La Paz, BCS",
        estado: "online",
        ultimaSincronizacion: new Date()
      },
      {
        _id: new ObjectId(),
        nombre: "Centro Logístico Los Cabos",
        ubicacion: "Los Cabos, BCS",
        estado: "online",
        ultimaSincronizacion: new Date()
      },
      {
        _id: new ObjectId(),
        nombre: "Centro Logístico Comondú",
        ubicacion: "Ciudad Constitución, BCS",
        estado: "online",
        ultimaSincronizacion: new Date()
      },
      {
        _id: new ObjectId(),
        nombre: "Centro Logístico Loreto",
        ubicacion: "Loreto, BCS",
        estado: "online",
        ultimaSincronizacion: new Date()
      }
    ];

   const productosData = [
  {
    _id: new ObjectId(),
    sku: "LAP-001",
    nombre: "Laptop Dell XPS 15",
    categoria: "Computadoras",
    stock: 15,
    minStock: 5,
    precio: 1299.99,
    estado: "Disponible",
    nodo: "Centro Logístico La Paz",
    version: 1,
    ultimaActualizacion: new Date(),
    ultimaModificacion: "Administrador General",
    lock: {
      bloqueado: false,
      por: null,
      nodo: null,
      fecha: null
    }
  },
  {
    _id: new ObjectId(),
    sku: "MOU-001",
    nombre: "Mouse Logitech MX Master",
    categoria: "Periféricos",
    stock: 45,
    minStock: 20,
    precio: 99.99,
    estado: "Disponible",
    nodo: "Centro Logístico Los Cabos",
    version: 1,
    ultimaActualizacion: new Date(),
    ultimaModificacion: "Usuario Operativo",
    lock: {
      bloqueado: false,
      por: null,
      nodo: null,
      fecha: null
    }
  },
  {
    _id: new ObjectId(),
    sku: "TEC-001",
    nombre: "Teclado Mecánico RGB",
    categoria: "Periféricos",
    stock: 8,
    minStock: 10,
    precio: 79.99,
    estado: "Stock Bajo",
    nodo: "Centro Logístico Comondú",
    version: 1,
    ultimaActualizacion: new Date(),
    ultimaModificacion: "Sistema",
    lock: {
      bloqueado: false,
      por: null,
      nodo: null,
      fecha: null
    }
  },
  {
    _id: new ObjectId(),
    sku: "MON-001",
    nombre: "Monitor LG UltraWide 29",
    categoria: "Monitores",
    stock: 12,
    minStock: 5,
    precio: 349.99,
    estado: "Disponible",
    nodo: "Centro Logístico Loreto",
    version: 1,
    ultimaActualizacion: new Date(),
    ultimaModificacion: "Administrador General",
    lock: {
      bloqueado: false,
      por: null,
      nodo: null,
      fecha: null
    }
  }
];

   const usuariosData = [
  {
    _id: new ObjectId(),
    nombre: "Administrador General",
    correo: "admin@inventario.com",
    idEmpleado: "EMP-001",
    password: "admin123",
    rol: "admin",
    nodo: "Centro Logístico La Paz",
    estado: "Activo",
    accionesRealizadas: 245,
    fechaRegistro: new Date()
  },
  {
    _id: new ObjectId(),
    nombre: "Usuario Operativo",
    correo: "usuario@inventario.com",
    idEmpleado: "EMP-002",
    password: "user123",
    rol: "operador",
    nodo: "Centro Logístico Los Cabos",
    estado: "Activo",
    accionesRealizadas: 98,
    fechaRegistro: new Date()
  },
  {
    _id: new ObjectId(),
    nombre: "Kristofer Hernández",
    correo: "kris@inventario.com",
    idEmpleado: "EMP-003",
    password: "kris123",
    rol: "admin",
    nodo: "Centro Logístico Comondú",
    estado: "Activo",
    accionesRealizadas: 180,
    fechaRegistro: new Date()
  },
  {
    _id: new ObjectId(),
    nombre: "Elvia Medina",
    correo: "elvia@inventario.com",
    idEmpleado: "EMP-004",
    password: "elvia123",
    rol: "operador",
    nodo: "Centro Logístico Loreto",
    estado: "Activo",
    accionesRealizadas: 75,
    fechaRegistro: new Date()
  },
  {
    _id: new ObjectId(),
    nombre: "Michelle Martínez",
    correo: "michelle@inventario.com",
    idEmpleado: "EMP-005",
    password: "michelle123",
    rol: "operador",
    nodo: "Centro Logístico La Paz",
    estado: "Activo",
    accionesRealizadas: 130,
    fechaRegistro: new Date()
  },
  {
    _id: new ObjectId(),
    nombre: "Carlos Jiménez",
    correo: "carlos@inventario.com",
    idEmpleado: "EMP-006",
    password: "carlos123",
    rol: "operador",
    nodo: "Centro Logístico Los Cabos",
    estado: "Activo",
    accionesRealizadas: 112,
    fechaRegistro: new Date()
  }
];
    const enviosData = [
  {
    _id: new ObjectId(),
    codigoEnvio: "ENV-001",
    productoSku: "LAP-001",
    producto: "Laptop Dell XPS 15",
    cantidad: 3,
    origen: "Centro Logístico La Paz",
    destino: "Centro Logístico Los Cabos",
    estado: "En tránsito",
    fechaSalida: new Date(),
    fechaEntregaEstimada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    codigoEnvio: "ENV-002",
    productoSku: "MOU-001",
    producto: "Mouse Logitech MX Master",
    cantidad: 10,
    origen: "Centro Logístico Los Cabos",
    destino: "Centro Logístico Comondú",
    estado: "Entregado",
    fechaSalida: new Date(),
    fechaEntregaEstimada: new Date()
  },
  {
    _id: new ObjectId(),
    codigoEnvio: "ENV-003",
    productoSku: "TEC-001",
    producto: "Teclado Mecánico RGB",
    cantidad: 5,
    origen: "Centro Logístico Comondú",
    destino: "Centro Logístico Loreto",
    estado: "En tránsito",
    fechaSalida: new Date(),
    fechaEntregaEstimada: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    _id: new ObjectId(),
    codigoEnvio: "ENV-004",
    productoSku: "MON-001",
    producto: "Monitor LG UltraWide 29",
    cantidad: 2,
    origen: "Centro Logístico Loreto",
    destino: "Centro Logístico La Paz",
    estado: "Pendiente",
    fechaSalida: new Date(),
    fechaEntregaEstimada: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  }
];

    const movimientosData = [
  {
    _id: new ObjectId(),
    tipo: "Alta de producto",
    descripcion: "Nuevo producto agregado al inventario",
    productoSku: "LAP-001",
    producto: "Laptop Dell XPS 15",
    cantidad: 15,
    usuario: "admin@inventario.com",
    nodo: "Centro Logístico La Paz",
    fecha: new Date()
  },
  {
    _id: new ObjectId(),
    tipo: "Actualización de stock",
    descripcion: "Stock actualizado después de recepción de mercancía",
    productoSku: "MOU-001",
    producto: "Mouse Logitech MX Master",
    cantidad: 45,
    usuario: "usuario@inventario.com",
    nodo: "Centro Logístico Los Cabos",
    fecha: new Date()
  },
  {
    _id: new ObjectId(),
    tipo: "Alerta",
    descripcion: "Producto con stock por debajo del mínimo establecido",
    productoSku: "TEC-001",
    producto: "Teclado Mecánico RGB",
    cantidad: 8,
    usuario: "sistema",
    nodo: "Centro Logístico Comondú",
    fecha: new Date()
  },
  {
    _id: new ObjectId(),
    tipo: "Transferencia",
    descripcion: "Transferencia de inventario entre nodos regionales",
    productoSku: "MON-001",
    producto: "Monitor LG UltraWide 29",
    cantidad: 2,
    usuario: "carlos@inventario.com",
    nodo: "Centro Logístico Loreto",
    fecha: new Date()
  }
];

    const reportesData = [
      {
        _id: new ObjectId(),
        mes: "Mayo",
        ventasMes: 67000,
        productosVendidos: 390,
        margenGanancia: 38.5,
        comprasMes: 42000,
        categorias: [
          { nombre: "Computadoras", total: 45 },
          { nombre: "Periféricos", total: 120 },
          { nombre: "Accesorios", total: 80 }
        ],
        generadoEn: new Date()
      }
    ];

    await nodos.insertMany(nodosData);
    await productos.insertMany(productosData);
    await usuarios.insertMany(usuariosData);
    await envios.insertMany(enviosData);
    await movimientos.insertMany(movimientosData);
    await reportes.insertMany(reportesData);

    await productos.createIndex({ sku: 1 }, { unique: true });
    await usuarios.createIndex({ correo: 1 }, { unique: true });
    await usuarios.createIndex({ idEmpleado: 1 }, { unique: true });
    await nodos.createIndex({ nombre: 1 }, { unique: true });
    await envios.createIndex({ codigoEnvio: 1 }, { unique: true });

    console.log("Base de datos creada correctamente");
    console.log("Usuarios insertados:", usuariosData.length);
    console.log("Productos insertados:", productosData.length);
    console.log("Nodos insertados:", nodosData.length);
    console.log("Envíos insertados:", enviosData.length);
    console.log("Movimientos insertados:", movimientosData.length);
    console.log("Reportes insertados:", reportesData.length);

  } catch (error) {
    console.error("Error creando la base de datos:", error);
  } finally {
    await client.close();
    console.log("Conexión cerrada");
  }
}

crearBaseDeDatos();