 lucide.createIcons();

  const API_URL = `${CONFIG.API_AUTH}`;

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");
  const submitBtn = document.getElementById("submit-btn");
  const btnContent = document.getElementById("btn-content");
  const btnSpinner = document.getElementById("btn-spinner");

  function setCookie(nombre, valor, horas) {
    const fecha = new Date();
    fecha.setTime(fecha.getTime() + horas * 60 * 60 * 1000);
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${fecha.toUTCString()}; path=/`;
  }

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    errorMessage.classList.add("hidden");

    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");
    btnContent.classList.add("hidden");
    btnSpinner.classList.remove("hidden");

    try {
      const res = await fetch(CONFIG.API_AUTH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: emailInput.value,
          password: passwordInput.value
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || "Credenciales incorrectas");
      }

      const usuario = data.usuario;

      setCookie("sesionUsuario", JSON.stringify(usuario), 8);

      localStorage.setItem("usuarioActual", JSON.stringify(usuario));
      localStorage.setItem("nodoActual", usuario.nodo || "Nodo PC1 - La Paz");

      window.location.href = "dashboard.html";

    } catch (error) {
      errorMessage.textContent = error.message;
      errorMessage.classList.remove("hidden");

      submitBtn.disabled = false;
      submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
      btnContent.classList.remove("hidden");
      btnSpinner.classList.add("hidden");
    }
  });