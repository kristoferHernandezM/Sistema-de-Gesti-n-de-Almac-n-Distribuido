document.addEventListener("DOMContentLoaded", () => {

  fetch("components/sidebar.html")
    .then(res => res.text())
    .then(data => {

      document.getElementById("sidebar-container").innerHTML = data;

      activarSidebar();

      lucide.createIcons();
    });

});

function activarSidebar() {

  const currentPage =
    window.location.pathname.split("/").pop();

  const links =
    document.querySelectorAll(".sidebar-link");

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