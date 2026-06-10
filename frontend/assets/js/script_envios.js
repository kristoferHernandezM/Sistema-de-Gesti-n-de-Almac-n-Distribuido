lucide.createIcons();

const API_URL = `${CONFIG.API_ENVIOS}`;
const API_RESUMEN_URL = `${CONFIG.API_ENVIOS_RESUMEN}`;
const API_PRODUCTOS_URL = `${CONFIG.API_PRODUCTOS}`;

let productosDisponibles = [];
let shipments = [];

const statusConfig = {
  transit: { label: "En tránsito", icon: "truck", classes: "bg-blue-100 text-blue-700" },
  delivered: { label: "Entregado", icon: "check-circle", classes: "bg-green-100 text-green-700" },
  pending: { label: "Pendiente", icon: "clock", classes: "bg-gray-100 text-gray-500" }
};

const progressColor = {
  transit: "bg-blue-500",
  delivered: "bg-green-500",
  pending: "bg-gray-200"
};

const nodeDot = {
  green: "bg-green-500",
  amber: "bg-amber-500"
};

let activeFilters = {
  statuses: ["transit", "delivered", "pending"],
  minProgress: 0,
  destination: ""
};

function convertirEstado(estado) {
  if (estado === "En tránsito") return "transit";
  if (estado === "Entregado") return "delivered";
  return "pending";
}

function calcularProgreso(estado) {
  if (estado === "Entregado") return 100;
  if (estado === "En tránsito") return 65;
  return 0;
}

async function cargarProductosParaModal() {
  try {
    const res = await fetch(API_PRODUCTOS_URL);
    const productos = await res.json();

    productosDisponibles = Array.isArray(productos) ? productos : [];

    const selectProducto = document.getElementById("form-producto-envio");
    const selectDestino = document.getElementById("form-destino-envio");

    selectProducto.innerHTML = `<option value="">Selecciona un producto</option>`;
    selectDestino.innerHTML = `<option value="">Selecciona destino</option>`;

    productosDisponibles.forEach(producto => {
      const option = document.createElement("option");
      option.value = producto.sku;
      option.textContent = `${producto.nombre} - Stock: ${producto.stock} - ${producto.nodo}`;
      selectProducto.appendChild(option);
    });

    const destinos = [...new Set(productosDisponibles.map(p => p.nodo).filter(Boolean))];

    destinos.forEach(destino => {
      const option = document.createElement("option");
      option.value = destino;
      option.textContent = destino;
      selectDestino.appendChild(option);
    });

  } catch (error) {
    console.error("Error cargando productos para modal:", error);
  }
}

document.getElementById("form-producto-envio").addEventListener("change", function () {
  const sku = this.value;
  const producto = productosDisponibles.find(p => p.sku === sku);

  const cantidadInput = document.getElementById("form-cantidad-envio");
  const stockLabel = document.getElementById("stock-disponible-label");
  const origenInput = document.getElementById("form-origen-envio");

  if (!producto) {
    cantidadInput.value = "";
    cantidadInput.removeAttribute("max");
    origenInput.value = "";
    stockLabel.textContent = "Stock disponible: 0";
    return;
  }

  cantidadInput.max = producto.stock;
  cantidadInput.value = 1;
  origenInput.value = producto.nodo || "";
  stockLabel.textContent = `Stock disponible: ${producto.stock}`;
});

function renderTable(data) {
  const tbody = document.getElementById("shipments-table");
  tbody.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-sm text-gray-400">
          No se encontraron envíos.
        </td>
      </tr>`;
    lucide.createIcons();
    return;
  }

  data.forEach(s => {
    const cfg = statusConfig[s.status] || statusConfig.pending;

    const row = document.createElement("tr");
    row.className = "border-b border-gray-50 hover:bg-gray-50 transition-colors";

    row.innerHTML = `
      <td class="py-4 pr-4">
        <span class="font-semibold text-gray-900">${s.id}</span>
        <p class="text-xs text-gray-400">${s.producto} · Cantidad: ${s.cantidad}</p>
      </td>

      <td class="py-4 pr-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full ${nodeDot[s.nodeStatus] || "bg-gray-400"}"></div>
            <code class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">${s.origen}</code>
          </div>
        </div>
      </td>

      <td class="py-4 pr-4 text-sm font-medium text-gray-700">
        ${s.destination}
      </td>

      <td class="py-4 pr-4">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.classes}">
          <i data-lucide="${cfg.icon}" class="w-3.5 h-3.5"></i>
          ${cfg.label}
        </span>
      </td>

      <td class="py-4 pr-4">
        <div class="w-28 space-y-1.5">
          <div class="flex justify-between text-xs font-medium text-gray-400">
            <span>${s.progress}%</span>
            <span>${s.eta}</span>
          </div>
          <div class="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full ${progressColor[s.status] || "bg-gray-200"} rounded-full transition-all" style="width: ${s.progress}%"></div>
          </div>
        </div>
      </td>

      <td class="py-4 text-right">
        <button class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <i data-lucide="more-vertical" class="w-4 h-4"></i>
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });

  lucide.createIcons();
}

async function cargarResumenEnvios() {
  try {
    const res = await fetch(API_RESUMEN_URL);
    const data = await res.json();

    document.getElementById("card-transito").textContent = data.enTransito;
    document.getElementById("card-entregas").textContent = data.entregasEsteMes;
    document.getElementById("card-latencia").textContent = `${data.latenciaMediaHoras}h`;
    document.getElementById("card-alertas").textContent = data.alertasCriticas;
  } catch (error) {
    console.error("Error cargando resumen:", error);
  }
}

async function cargarEnvios() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.mensaje || "Error al obtener envíos");
    }

    shipments = data.map(e => ({
      id: e.codigoEnvio,
      nodeStatus: e.estado === "Entregado" ? "green" : "amber",
      destination: e.destino,
      status: convertirEstado(e.estado),
      progress: calcularProgreso(e.estado),
      eta: e.estado === "Entregado" ? "Completado" : "En proceso",
      producto: e.producto,
      cantidad: e.cantidad,
      origen: e.origen
    }));

    renderTable(shipments);

  } catch (error) {
    console.error("Error cargando envíos:", error);
    shipments = [];
    renderTable([]);
  }
}

function getFilteredData() {
  return shipments.filter(s => {
    const statusOk = activeFilters.statuses.includes(s.status);
    const progressOk = s.progress >= activeFilters.minProgress;
    const destOk = s.destination.toLowerCase().includes(activeFilters.destination.toLowerCase());
    return statusOk && progressOk && destOk;
  });
}

function openFilters() {
  document.querySelectorAll(".filter-status").forEach(cb => {
    cb.checked = activeFilters.statuses.includes(cb.value);
  });

  document.getElementById("filter-progress").value = activeFilters.minProgress;
  document.getElementById("progress-label").textContent = activeFilters.minProgress + "%";
  document.getElementById("filter-destination").value = activeFilters.destination;

  document.getElementById("filter-panel").classList.remove("hidden");
  document.getElementById("filter-backdrop").classList.remove("hidden");

  lucide.createIcons();
}

function closeFilters() {
  document.getElementById("filter-panel").classList.add("hidden");
  document.getElementById("filter-backdrop").classList.add("hidden");
}

function applyFilters() {
  activeFilters.statuses = [...document.querySelectorAll(".filter-status:checked")].map(cb => cb.value);
  activeFilters.minProgress = Number(document.getElementById("filter-progress").value);
  activeFilters.destination = document.getElementById("filter-destination").value.trim();

  renderTable(getFilteredData());
  closeFilters();
}
function actualizarNodoOrigenDetectado() {
  const nodoActualTexto = document.getElementById("nodo-origen-actual");

  if (!nodoActualTexto) return;

  if (productosDisponibles.length > 0) {
    const nodos = [...new Set(productosDisponibles.map(p => p.nodo).filter(Boolean))];
    nodoActualTexto.textContent = nodos.join(" / ");
  } else {
    nodoActualTexto.textContent = "Sin nodos detectados";
  }
}
function resetFilters() {
  activeFilters = {
    statuses: ["transit", "delivered", "pending"],
    minProgress: 0,
    destination: ""
  };

  document.querySelectorAll(".filter-status").forEach(cb => cb.checked = true);
  document.getElementById("filter-progress").value = 0;
  document.getElementById("progress-label").textContent = "0%";
  document.getElementById("filter-destination").value = "";

  renderTable(shipments);
  closeFilters();
}

document.getElementById("btn-filters").addEventListener("click", openFilters);

document.getElementById("btn-export").addEventListener("click", () => {
  const data = getFilteredData();

  const headers = [
    "ID de Envío",
    "Origen",
    "Destino",
    "Estado",
    "Progreso",
    "Producto",
    "Cantidad"
  ];

  const rows = data.map(s => [
    s.id,
    s.origen,
    s.destination,
    statusConfig[s.status]?.label || "Pendiente",
    s.progress,
    s.producto,
    s.cantidad
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `envios_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

const envioModal = document.getElementById("envio-modal");
const envioForm = document.getElementById("envio-form");

async function abrirModalEnvio() {
  envioForm.reset();

  await cargarProductosParaModal();
  actualizarNodoOrigenDetectado();

  document.getElementById("form-origen-envio").value = "";
  document.getElementById("stock-disponible-label").textContent = "Stock disponible: 0";

  envioModal.classList.remove("hidden");
  lucide.createIcons();
}

function cerrarModalEnvio() {
  envioModal.classList.add("hidden");
  envioForm.reset();
}

envioForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  const skuSeleccionado = document.getElementById("form-producto-envio").value;
  const productoSeleccionado = productosDisponibles.find(p => p.sku === skuSeleccionado);
  const cantidad = Number(document.getElementById("form-cantidad-envio").value);
  const destino = document.getElementById("form-destino-envio").value;

  if (!productoSeleccionado) {
    alert("Selecciona un producto válido");
    return;
  }

  if (!destino) {
    alert("Selecciona un destino");
    return;
  }

  if (destino === productoSeleccionado.nodo) {
    alert("El destino no puede ser el mismo que el nodo origen.");
    return;
  }

  if (cantidad < 1) {
    alert("La cantidad debe ser mayor a 0");
    return;
  }

  if (cantidad > productoSeleccionado.stock) {
    alert(`La cantidad no puede ser mayor al stock disponible: ${productoSeleccionado.stock}`);
    return;
  }

  const envio = {
    productoSku: productoSeleccionado.sku,
    producto: productoSeleccionado.nombre,
    cantidad,
    origen: productoSeleccionado.nodo,
    destino
  };

  try {
    console.log("POST creando envío a:", API_URL);

const res = await fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(envio)
});

const text = await res.text();

let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error(`La API respondió HTML o texto. URL usada: ${API_URL}`);
}

if (!res.ok) {
  throw new Error(data.mensaje || "Error creando envío");
}

cerrarModalEnvio();

await cargarEnvios();
await cargarResumenEnvios();

  } catch (error) {
    console.error("Error creando envío:", error);
    alert(error.message);
  }
});

document.getElementById("btn-nuevo-envio").addEventListener("click", abrirModalEnvio);

window.closeFilters = closeFilters;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.cerrarModalEnvio = cerrarModalEnvio;

cargarEnvios();
cargarResumenEnvios();
cargarProductosParaModal();