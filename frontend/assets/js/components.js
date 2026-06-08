
document.addEventListener("DOMContentLoaded", () => {

  fetch("components/sidebar.html?v=2")
    .then(res => res.text())
    .then(data => {

      document.getElementById("sidebar-container").innerHTML = data;

      activarSidebar();
      cargarUsuarioSidebar();

      lucide.createIcons();
    });

});

function activarSidebar() {

  const currentPage = window.location.pathname.split("/").pop();

  const links = document.querySelectorAll(".sidebar-link");

  links.forEach(link => {

    const href = link.getAttribute("href");

    if (href === currentPage) {

      link.classList.remove(
        "text-gray-700",
        "hover:bg-gray-100"
      );

      link.classList.add(
        "bg-blue-50",
        "text-blue-600"
      );
    }
  });
}

function cargarUsuarioSidebar() {
  const usuario = JSON.parse(localStorage.getItem("usuarioActual"));

  if (!usuario) {
    console.warn("No hay usuarioActual");
    return;
  }

  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userInitial = document.getElementById("userInitial");

  console.log("Elementos sidebar:", userName, userEmail, userInitial);
  console.log("Usuario:", usuario);

  if (!userName || !userEmail || !userInitial) {
    console.warn("No existen los ids del sidebar");
    return;
  }

  userName.textContent = usuario.nombre || "Usuario";
  userEmail.textContent = usuario.correo || "usuario@correo.com";
  userInitial.textContent = (usuario.nombre || "U").charAt(0).toUpperCase();
}
