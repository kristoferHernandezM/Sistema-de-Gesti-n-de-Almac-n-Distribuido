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
        nombre: "Nodo PC1 - La Paz",
        ip: "192.168.4.105",
        ubicacion: "La Paz, BCS",
        estado: "online",
        ultimaSincronizacion: new Date()
      },
      {
        _id: new ObjectId(),
        nombre: "Nodo PC2 - Réplica",
        ip: "192.168.4.101",
        ubicacion: "Nodo remoto",
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
            nodo: "Nodo PC1 - La Paz",
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
            nodo: "Nodo PC2 - Réplica",
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
            nodo: "Nodo PC1 - La Paz",
            version: 1,
            ultimaActualizacion: new Date(),
            ultimaModificacion: "Sistema",
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
        nodo: "Nodo PC1 - La Paz",
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
        nodo: "Nodo PC2 - Laptop",
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
        nodo: "Nodo PC1 - La Paz",
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
        nodo: "Nodo PC2 - Laptop",
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
        nodo: "Nodo PC1 - La Paz",
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
        nodo: "Nodo PC2 - Laptop",
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
        origen: "Nodo PC1 - La Paz",
        destino: "Nodo PC2 - Réplica",
        ipOrigen: "192.168.4.105",
        ipDestino: "192.168.4.103",
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
        origen: "Nodo PC2 - Réplica",
        destino: "Nodo PC1 - La Paz",
        ipOrigen: "192.168.4.103",
        ipDestino: "192.168.4.105",
        estado: "Entregado",
        fechaSalida: new Date(),
        fechaEntregaEstimada: new Date()
      }
    ];

    const movimientosData = [
      {
        _id: new ObjectId(),
        tipo: "Alta de producto",
        descripcion: "Nuevo producto agregado",
        productoSku: "LAP-001",
        producto: "Laptop Dell XPS 15",
        cantidad: 15,
        usuario: "admin@inventario.com",
        nodo: "Nodo PC1 - La Paz",
        fecha: new Date()
      },
      {
        _id: new ObjectId(),
        tipo: "Actualización de stock",
        descripcion: "Stock actualizado",
        productoSku: "MOU-001",
        producto: "Mouse Logitech MX Master",
        cantidad: 45,
        usuario: "usuario@inventario.com",
        nodo: "Nodo PC2 - Réplica",
        fecha: new Date()
      },
      {
        _id: new ObjectId(),
        tipo: "Alerta",
        descripcion: "Producto con stock bajo",
        productoSku: "TEC-001",
        producto: "Teclado Mecánico RGB",
        cantidad: 8,
        usuario: "sistema",
        nodo: "Nodo PC1 - La Paz",
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
    await nodos.createIndex({ ip: 1 }, { unique: true });
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