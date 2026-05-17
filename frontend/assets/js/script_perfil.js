lucide.createIcons();

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

  function cerrarSesion() {
    document.cookie = "sesionUsuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("nodoActual");
    window.location.href = "login.html";
  }

  function obtenerUsuarioSesion() {
    const sesion = getCookie("sesionUsuario");

    if (!sesion) {
      window.location.href = "login.html";
      return null;
    }

    return JSON.parse(sesion);
  }

  const currentUser = obtenerUsuarioSesion();

  const nombreUsuario =
    currentUser.nombre || currentUser.name || "Usuario";

  const correoUsuario =
    currentUser.correo || currentUser.email || "Sin correo";

  const rolUsuario =
    currentUser.rol || currentUser.role || "usuario";

  const nodoUsuario =
    currentUser.nodo || "Nodo no asignado";

  const alertBox = document.getElementById("alert-box");
  let alertTimeout;

  function showMessage(text, type) {
    alertBox.textContent = text;

    alertBox.classList.remove(
      "hidden",
      "bg-green-50",
      "text-green-600",
      "border-green-200",
      "bg-red-50",
      "text-red-600",
      "border-red-200"
    );

    if (type === "success") {
      alertBox.classList.add(
        "bg-green-50",
        "text-green-600",
        "border-green-200"
      );
    } else {
      alertBox.classList.add(
        "bg-red-50",
        "text-red-600",
        "border-red-200"
      );
    }

    clearTimeout(alertTimeout);

    alertTimeout = setTimeout(() => {
      alertBox.classList.add("hidden");
    }, 3000);
  }

  document.getElementById("display-name").textContent = nombreUsuario;
  document.getElementById("display-email").textContent = correoUsuario;
  document.getElementById("avatar-initial").textContent =
    nombreUsuario.charAt(0).toUpperCase();

  document.getElementById("display-role").textContent =
    rolUsuario === "admin" ? "Administrador" : "Usuario";

  const inputName = document.getElementById("input-name");
  const inputEmail = document.getElementById("input-email");

  inputName.value = nombreUsuario;
  inputEmail.value = correoUsuario;

  inputName.disabled = true;
  inputEmail.disabled = true;

  const toggleEditBtn = document.getElementById("toggle-edit-btn");
  const personalInfoForm = document.getElementById("personal-info-form");
  const saveInfoContainer = document.getElementById("save-info-container");

  toggleEditBtn.classList.add("hidden");
  saveInfoContainer.classList.add("hidden");

  personalInfoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showMessage("Esta información no se puede modificar desde el perfil.", "error");
  });

  const passwordForm = document.getElementById("password-form");

  passwordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("input-new-password").value;
    const confirmPassword = document.getElementById("input-confirm-password").value;

    if (newPassword !== confirmPassword) {
      showMessage("Las contraseñas no coinciden", "error");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    showMessage("Cambio de contraseña pendiente de conectar con backend.", "success");
    passwordForm.reset();
  });
