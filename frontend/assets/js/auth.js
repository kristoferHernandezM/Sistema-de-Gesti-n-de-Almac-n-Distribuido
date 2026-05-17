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

function verificarSesion() {
  const sesion = getCookie("sesionUsuario");

  if (!sesion) {
    window.location.href = "login.html";
    return;
  }

  try {
    const usuario = JSON.parse(sesion);

    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
    localStorage.setItem("nodoActual", usuario.nodo || "Nodo PC1 - La Paz");

  } catch (error) {
    document.cookie = "sesionUsuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "login.html";
  }
}

function cerrarSesion() {
  document.cookie = "sesionUsuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  localStorage.removeItem("usuarioActual");
  localStorage.removeItem("nodoActual");
  window.location.href = "login.html";
}

verificarSesion();