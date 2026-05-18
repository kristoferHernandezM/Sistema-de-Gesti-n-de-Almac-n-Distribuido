lucide.createIcons();

const API_PRODUCTOS = CONFIG.API_PRODUCTOS;
const API_USUARIOS = CONFIG.API_AUTH.replace("/login", "") + "/usuarios";

const statsContainer = document.getElementById("stats-container");
const activityContainer = document.getElementById("activity-container");
const lowStockContainer = document.getElementById("low-stock-container");
const alertsCount = document.getElementById("alerts-count");

async function cargarDashboard() {
  try {
    const resProductos = await fetch(API_PRODUCTOS);
    const productos = await resProductos.json();

    let usuarios = [];

    try {
      const resUsuarios = await fetch(API_USUARIOS);
      usuarios = await resUsuarios.json();
    } catch {
      usuarios = [];
    }

    renderStats(productos, usuarios);
    renderStockBajo(productos);
    renderActividad(productos);

    lucide.createIcons();

  } catch (error) {
    console.error("Error cargando dashboard:", error);
  }
}

function renderStats(productos, usuarios) {
  statsContainer.innerHTML = "";

  const totalProductos = productos.length;

  const usuariosActivos = usuarios.length || 0;

  const valorInventario = productos.reduce((total, producto) => {
    return total + (Number(producto.precio || 0) * Number(producto.stock || 0));
  }, 0);

  const stockBajo = productos.filter(producto =>
    Number(producto.stock) <= Number(producto.minStock)
  ).length;

  const stats = [
    {
      name: "Total Productos",
      value: totalProductos,
      icon: "package",
      color: "bg-blue-500"
    },
    {
      name: "Usuarios Activos",
      value: usuariosActivos,
      icon: "users",
      color: "bg-green-500"
    },
    {
      name: "Valor Inventario",
      value: `$${valorInventario.toLocaleString("es-MX")}`,
      icon: "trending-up",
      color: "bg-purple-500"
    },
    {
      name: "Stock Bajo",
      value: stockBajo,
      icon: "alert-triangle",
      color: "bg-orange-500"
    }
  ];

  stats.forEach(stat => {
    const card = `
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

        <div class="flex items-center justify-between mb-4">
          <div class="${stat.color} p-3 rounded-lg">
            <i data-lucide="${stat.icon}" class="w-6 h-6 text-white"></i>
          </div>
        </div>

        <h3 class="text-2xl font-bold text-gray-900 mb-1">
          ${stat.value}
        </h3>

        <p class="text-sm text-gray-600">
          ${stat.name}
        </p>

      </div>
    `;

    statsContainer.insertAdjacentHTML("beforeend", card);
  });
}

function renderStockBajo(productos) {
  lowStockContainer.innerHTML = "";

  const productosStockBajo = productos
    .filter(producto => Number(producto.stock) <= Number(producto.minStock))
    .slice(0, 5);

  alertsCount.textContent = `${productosStockBajo.length} alertas`;

  if (productosStockBajo.length === 0) {
    lowStockContainer.innerHTML = `
      <p class="text-sm text-gray-500">
        No hay productos con stock bajo.
      </p>
    `;
    return;
  }

  productosStockBajo.forEach(producto => {
    const item = `
      <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">

        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            ${producto.nombre}
          </p>

          <p class="text-xs text-gray-600">
            ${producto.categoria}
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm font-medium text-orange-600">
            Stock: ${producto.stock}
          </p>

          <p class="text-xs text-gray-500">
            Mín: ${producto.minStock}
          </p>
        </div>

      </div>
    `;

    lowStockContainer.insertAdjacentHTML("beforeend", item);
  });
}

function renderActividad(productos) {
  activityContainer.innerHTML = "";

  const actividades = [];

  const ultimaActividad = localStorage.getItem("ultimaActividad");

  if (ultimaActividad) {
    const actividad = JSON.parse(ultimaActividad);

    actividades.push({
      action: actividad.tipo,
      item: actividad.producto,
      usuario: actividad.usuario,
      fecha: actividad.fecha
    });
  }

  const recientes = productos
    .sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))
    .slice(0, 5);

  recientes.forEach(producto => {
    actividades.push({
      action: "Producto actualizado",
      item: producto.nombre,
      usuario: producto.ultimaModificacion || "Sistema",
      fecha: producto.ultimaActualizacion
    });
  });

  actividades.slice(0, 5).forEach(actividad => {
    const fecha = actividad.fecha
      ? new Date(actividad.fecha).toLocaleString()
      : "Sin fecha";

    const item = `
      <div class="flex items-start gap-3 pb-4 border-b border-gray-100">
        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>

        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">
            ${actividad.action}
          </p>

          <p class="text-sm text-gray-600">
            ${actividad.item}
          </p>

          <p class="text-xs text-gray-500 mt-1">
            ${fecha} · ${actividad.usuario}
          </p>
        </div>
      </div>
    `;

    activityContainer.insertAdjacentHTML("beforeend", item);
  });
}

cargarDashboard();