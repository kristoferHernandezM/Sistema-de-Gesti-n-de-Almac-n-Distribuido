lucide.createIcons();

const API_URL = `${CONFIG.API_PRODUCTOS}`


let products = [];
let editingId = null;
let currentPage = 1;
const itemsPerPage = 20;

function getCookie(nombre) {
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");

    if (key === nombre) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

function obtenerUsuarioSesion() {
  const sesion = getCookie("sesionUsuario");

  if (!sesion) {
    window.location.href = "login.html";
    return null;
  }

  return JSON.parse(sesion);
}

const usuarioSesion = obtenerUsuarioSesion();
const NODO_ACTUAL = usuarioSesion?.nodo || "Nodo desconocido";
const USUARIO_LOCK = usuarioSesion?.correo || usuarioSesion?.idEmpleado || usuarioSesion?.nombre || "Usuario desconocido";

const tableBody = document.getElementById("table-body");
const searchInput = document.getElementById("search-input");
const modal = document.getElementById("product-modal");
const form = document.getElementById("product-form");
const modalTitle = document.getElementById("modal-title");
const submitBtn = document.getElementById("submit-btn");


async function cargarProductos() {
try {
    const res = await fetch(API_URL);
    products = await res.json();
    renderTable();
} catch (error) {
    console.error("Error cargando productos:", error);
    tableBody.innerHTML = `
    <tr>
        <td colspan="8" class="py-4 text-center text-red-600">
        Error al cargar productos desde MongoDB
        </td>
    </tr>
    `;
}
}

function renderTable() {

  const searchTerm =
    searchInput.value.toLowerCase();

  tableBody.innerHTML = "";

  const filteredProducts = products.filter(product =>
    product.nombre?.toLowerCase().includes(searchTerm) ||
    product.categoria?.toLowerCase().includes(searchTerm) ||
    product.sku?.toLowerCase().includes(searchTerm)
  );

  // SIN RESULTADOS
  if (filteredProducts.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="8"
            class="py-10 text-center text-gray-500">
          Sin resultados
        </td>
      </tr>
    `;

    document.getElementById("pagination-info").textContent =
      "0 resultados";

    return;
  }

  // PAGINACIÓN
  const start =
    (currentPage - 1) * itemsPerPage;

  const end =
    start + itemsPerPage;

  const paginatedProducts =
    filteredProducts.slice(start, end);

  paginatedProducts.forEach(product => {

    const isLowStock =
      product.stock <= product.minStock;

    const statusBadge = isLowStock
      ? `<span class="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full">Stock Bajo</span>`
      : `<span class="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full">Normal</span>`;

    const fecha = product.ultimaActualizacion
      ? new Date(product.ultimaActualizacion).toLocaleString()
      : "Sin registro";

    const row = document.createElement("tr");

    row.className =
      "border-b border-gray-100 hover:bg-gray-50";

    row.innerHTML = `
      <td class="py-3 px-4 text-sm text-gray-900">
        ${product.sku}
      </td>

      <td class="py-3 px-4">
        <div class="flex items-center gap-3">

          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <i data-lucide="package" class="w-5 h-5 text-blue-600"></i>
          </div>

          <span class="text-sm font-medium text-gray-900">
            ${product.nombre}
          </span>

        </div>
      </td>

      <td class="py-3 px-4 text-sm text-gray-600">
        ${product.categoria}
      </td>

      <td class="py-3 px-4 text-sm text-gray-900">
        ${product.stock}
      </td>

      <td class="py-3 px-4 text-sm text-gray-900">
        $${Number(product.precio || 0).toFixed(2)}
      </td>

      <td class="py-3 px-4">
        ${statusBadge}
      </td>

      <td class="py-3 px-4 text-sm text-gray-600">
        ${fecha}

        <div class="text-xs text-gray-400">
          por ${product.ultimaModificacion || "Sistema"}
        </div>
      </td>

      <td class="py-3 px-4">

        <div class="flex items-center justify-end gap-2">

          <button
            onclick="handleOpenModal('${product._id}')"
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <i data-lucide="edit" class="w-4 h-4"></i>
          </button>

          <button
            onclick="handleDelete('${product._id}')"
            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>

        </div>

      </td>
    `;

    tableBody.appendChild(row);
  });

  // INFO PAGINACIÓN
  const totalPages =
    Math.ceil(filteredProducts.length / itemsPerPage);

  document.getElementById("pagination-info").textContent =
    `Página ${currentPage} de ${totalPages}`;

  lucide.createIcons();
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

function nextPage() {

  const filteredProducts = products.filter(product =>
    product.nombre?.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    product.categoria?.toLowerCase().includes(searchInput.value.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  const totalPages =
    Math.ceil(filteredProducts.length / itemsPerPage);

  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

function prevPage() {

  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

async function handleOpenModal(id = null) {
editingId = id;

if (id) {

    const nodoActual = NODO_ACTUAL;

    const lockRes = await fetch(`${API_URL}/${id}/acquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        usuario: USUARIO_LOCK,
        nodo: nodoActual
        })
    });

    if (lockRes.status === 423) {
        alert("Este producto está siendo editado por otro nodo.");
        return;
    }
    
    const product = products.find(p => p._id === id);

    modalTitle.textContent = "Editar Producto";
    submitBtn.textContent = "Guardar";

    document.getElementById("form-name").value = product.nombre;
    document.getElementById("form-sku").value = product.sku;
    document.getElementById("form-category").value = product.categoria;
    document.getElementById("form-stock").value = product.stock;
    document.getElementById("form-minStock").value = product.minStock;
    document.getElementById("form-price").value = product.precio;
    document.getElementById("form-node").value = NODO_ACTUAL;
} else {
    modalTitle.textContent = "Nuevo Producto";
    submitBtn.textContent = "Crear";
    form.reset();
}

modal.classList.remove("hidden");
}

async function handleCloseModal() {
  if (editingId) {
    await fetch(`${API_URL}/${editingId}/release`, {
      method: "POST"
    });
  }

  modal.classList.add("hidden");
  editingId = null;
  form.reset();
}

form.addEventListener("submit", async function(e) {
e.preventDefault();

const stock = Number(document.getElementById("form-stock").value);
const minStock = Number(document.getElementById("form-minStock").value);
const nodoActual =
  localStorage.getItem("nodoActual") || "Nodo PC1 - La Paz";

const formData = {
  nombre: document.getElementById("form-name").value,
  sku: document.getElementById("form-sku").value,
  categoria: document.getElementById("form-category").value,
  stock,
  minStock,
  precio: Number(document.getElementById("form-price").value),
  estado: stock <= minStock ? "Stock Bajo" : "Disponible",
  nodo: NODO_ACTUAL,
  ultimaActualizacion: new Date(),
  ultimaModificacion: USUARIO_LOCK,
  usuarioLock: USUARIO_LOCK
};

if (editingId) {
    await fetch(`${API_URL}/${editingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
    });
} else {
    await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
    });
}

handleCloseModal();
cargarProductos();
});

async function handleDelete(id) {
  if (confirm("¿Estás seguro de eliminar este producto?")) {
    const productoEliminado = products.find(p => p._id === id);

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (productoEliminado) {
      localStorage.setItem("ultimaActividad", JSON.stringify({
        tipo: "Producto eliminado",
        producto: productoEliminado.nombre,
        usuario: USUARIO_LOCK,
        fecha: new Date()
      }));
    }

    cargarProductos();
  }
}


cargarProductos();