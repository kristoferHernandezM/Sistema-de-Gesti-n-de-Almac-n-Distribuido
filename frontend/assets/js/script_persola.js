const API_URL = CONFIG.API_AUTH.replace('/login', '') + '/usuarios';

  let usuarios = [];

  const grid = document.getElementById('usuariosGrid');
  const buscar = document.getElementById('buscarUsuario');
  const sinResultados = document.getElementById('sinResultados');
  const modal = document.getElementById('modalUsuario');
  const form = document.getElementById('formUsuario');
  const modalTitulo = document.getElementById('modalTitulo');
  const usuarioSesion = JSON.parse(localStorage.getItem("usuarioActual"));
  const esAdministrador = usuarioSesion && usuarioSesion.rol === "admin";

  async function cargarUsuarios() {
    try {

      const response = await fetch(API_URL);

      if (!response.ok) throw new Error('Error al cargar usuarios');

      usuarios = await response.json();
      console.log("USUARIOS BD:", usuarios);
      
      renderUsuarios();
    } catch (error) {
      console.error(error);
      grid.innerHTML = `<p class="text-red-600 font-semibold">No se pudieron cargar los usuarios.</p>`;
    }
  }

  function renderUsuarios() {
    const termino = buscar.value.trim().toLowerCase();

    const filtrados = usuarios.filter(usuario =>
      (usuario.nombre || '').toLowerCase().includes(termino) ||
      (usuario.correo || '').toLowerCase().includes(termino)
    );

    grid.innerHTML = '';
    sinResultados.classList.toggle('hidden', filtrados.length !== 0);

    filtrados.forEach(usuario => {
      const esAdmin = usuario.rol === 'admin';
      const activo = usuario.estado === 'Activo';

      const card = document.createElement('div');
      card.className = 'bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition';

      card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i data-lucide="user" class="w-6 h-6 text-blue-600"></i>
            </div>
            <div class="min-w-0">
              <h3 class="font-semibold text-gray-900 truncate">${usuario.nombre}</h3>
              <div class="flex items-center gap-1 text-sm text-gray-600 min-w-0">
                <i data-lucide="mail" class="w-3 h-3 flex-shrink-0"></i>
                <span class="text-xs truncate">${usuario.correo}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-gray-600">Rol:</span>
            <span class="text-sm ${esAdmin ? 'text-purple-600' : 'text-gray-900'}">
              ${esAdmin ? 'Administrador' : 'Usuario'}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <span class="text-sm text-gray-600">Estado:</span>
            <span class="text-xs px-2 py-1 rounded-full ${activo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}">
              ${activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div class="flex gap-2 pt-4 border-t border-gray-100">
          <button onclick="abrirModal('${usuario._id}')" class="flex-1 px-3 py-2 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition">
            Editar
          </button>
          <button onclick="eliminarUsuario('${usuario._id}')" class="flex-1 px-3 py-2 text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition">
            Eliminar
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    lucide.createIcons();
  }

  function abrirModal(id = null) {
    if (!esAdministrador) {
    alert("Solo un administrador puede modificar usuarios.");
    return;
    }
    ocultarError();
    form.reset();
    document.getElementById('usuarioId').value = '';

    if (id) {
      const usuario = usuarios.find(u => u._id === id);
      if (!usuario) return;

      modalTitulo.textContent = 'Editar Usuario';
      document.getElementById('usuarioId').value = usuario._id;
      document.getElementById('nombre').value = usuario.nombre;
      document.getElementById('correo').value = usuario.correo;
      document.getElementById('rol').value = usuario.rol || 'user';
      document.getElementById('estado').value = usuario.estado === 'Activo' ? 'active' : 'inactive';
    } else {
      modalTitulo.textContent = 'Nuevo Usuario';
      document.getElementById('rol').value = 'user';
      document.getElementById('estado').value = 'active';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
  }

  function cerrarModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  function mostrarError(mensaje) {
    document.getElementById('formErrorTexto').textContent = mensaje;
    document.getElementById('formError').classList.remove('hidden');
    lucide.createIcons();
  }

  function ocultarError() {
    document.getElementById('formError').classList.add('hidden');
  }

  async function eliminarUsuario(id) {
    if (!esAdministrador) {
    alert("Solo un administrador puede eliminar usuarios.");
    return;
    }
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    await cargarUsuarios();
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    ocultarError();

    const id = document.getElementById('usuarioId').value;
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('correo').value.trim();
    const rol = document.getElementById('rol').value;
    const estado = document.getElementById('estado').value === 'active' ? 'Activo' : 'Inactivo';

    if (!nombre || !email) {
      mostrarError('Completa el nombre y el correo electrónico.');
      return;
    }

    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    const response = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
            nombre,
            correo: email,
            rol,
            estado
            })
    });

    if (!response.ok) {
      mostrarError('No se pudo guardar el usuario.');
      return;
    }

    cerrarModal();
    await cargarUsuarios();
  });

  document.getElementById('btnNuevoUsuario').addEventListener('click', () => abrirModal());
  document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
  buscar.addEventListener('input', renderUsuarios);

  modal.addEventListener('click', function (event) {
    if (event.target === modal) cerrarModal();
  });

  cargarUsuarios();