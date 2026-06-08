lucide.createIcons();

const API_URL = `${CONFIG.API_ENVIOS}`;
const API_RESUMEN_URL = `${CONFIG.API_ENVIOS_RESUMEN}`;

let shipments = [];

const statusConfig = {
  transit: {
    label: "En tránsito",
    icon: "truck",
    classes: "bg-blue-100 text-blue-700"
  },
  delivered: {
    label: "Entregado",
    icon: "check-circle",
    classes: "bg-green-100 text-green-700"
  },
  pending: {
    label: "Pendiente",
    icon: "clock",
    classes: "bg-gray-100 text-gray-500"
  }
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
            <code class="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">${s.ip}</code>
          </div>
          <span class="text-xs text-gray-500">${s.origen}</span>
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
  const res = await fetch(API_RESUMEN_URL);
  const data = await res.json();

  document.getElementById("card-transito").textContent = data.enTransito;
  document.getElementById("card-entregas").textContent = data.entregasEsteMes;
  document.getElementById("card-latencia").textContent = `${data.latenciaMediaHoras}h`;
  document.getElementById("card-alertas").textContent = data.alertasCriticas;
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
      ip: e.ipOrigen,
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
  const checked = [...document.querySelectorAll(".filter-status:checked")].map(cb => cb.value);

  activeFilters.statuses = checked;
  activeFilters.minProgress = Number(document.getElementById("filter-progress").value);
  activeFilters.destination = document.getElementById("filter-destination").value.trim();

  renderTable(getFilteredData());
  closeFilters();
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
    "IP Nodo",
    "Origen",
    "Destino",
    "Estado",
    "Progreso",
    "Producto",
    "Cantidad"
  ];

  const rows = data.map(s => [
    s.id,
    s.ip,
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

window.closeFilters = closeFilters;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;

cargarEnvios();
cargarResumenEnvios();