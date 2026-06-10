async function descargarReporte(tipo) {
try {
    const res = await fetch(CONFIG.API_PRODUCTOS);

    if (!res.ok) {
    throw new Error("No se pudieron obtener los productos");
    }

    const productos = await res.json();

    if (tipo === "pdf") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const fecha = new Date().toLocaleString();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 35, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Inventario", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Sistema Ironclad | Generado: ${fecha}`, 14, 27);

    const totalProductos = productos.length;
    const stockTotal = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const stockBajo = productos.filter(p => Number(p.stock || 0) <= 10).length;

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen general", 14, 48);

    doc.setFont("helvetica", "normal");
    doc.text(`Total de productos: ${totalProductos}`, 14, 58);
    doc.text(`Stock total: ${stockTotal} unidades`, 14, 66);
    doc.text(`Productos con stock bajo: ${stockBajo}`, 14, 74);

    const tableData = productos.map((p, index) => [
        index + 1,
        p.nombre || "Sin nombre",
        p.categoria || "Sin categoría",
        p.stock || 0,
        p.nodo || "N/A",
        p.estado || "Activo"
    ]);

    doc.autoTable({
        head: [["#", "Producto", "Categoría", "Stock", "Nodo", "Estado"]],
        body: tableData,
        startY: 85,
        theme: "grid",
        headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold"
        },
        styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3
        },
        alternateRowStyles: {
        fillColor: [248, 250, 252]
        },
        columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        3: { halign: "center" }
        }
    });

    doc.save("Reporte_Inventario_Ironclad.pdf");
    }

} catch (error) {
    console.error(error);
    alert("Error al generar el reporte. Verifica la conexión con el servidor.");
}
}

lucide.createIcons();

Chart.defaults.font.family = "ui-sans-serif, system-ui, sans-serif";
Chart.defaults.color = "#6b7280";

async function cargarReportes() {
try {
    const res = await fetch(CONFIG.API_REPORTES);

    if (!res.ok) {
    throw new Error("No se pudieron cargar los reportes");
    }

    const data = await res.json();

    const kpis = data.kpis || {};
    const categoryData = data.categoryData || [];
    const topProducts = data.topProducts || [];

    document.querySelectorAll(".text-3xl.font-semibold.text-gray-900")[0].textContent =
    kpis.stockTotal || 0;

    document.querySelectorAll(".text-3xl.font-semibold.text-gray-900")[1].textContent =
    kpis.totalProductos || 0;

    document.querySelectorAll(".text-3xl.font-semibold.text-gray-900")[2].textContent =
    kpis.stockBajo || 0;

    const productsContainer = document.getElementById("top-products-list");
    productsContainer.innerHTML = "";

    topProducts.forEach((product, index) => {
    const html = `
        <div class="flex items-center gap-4">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
            ${index + 1}
        </div>
        <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">${product.name}</p>
            <p class="text-xs text-gray-500">${product.sales} unidades</p>
        </div>
        <div class="text-right">
            <p class="text-sm font-medium text-gray-900">$${Number(product.revenue || 0).toLocaleString()}</p>
        </div>
        </div>
    `;

    productsContainer.insertAdjacentHTML("beforeend", html);
    });

    new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
        labels: ["Total productos", "Stock bajo"],
        datasets: [{
        label: "Inventario",
        data: [
            Number(kpis.totalProductos || 0),
            Number(kpis.stockBajo || 0)
        ],
        backgroundColor: ["#3b82f6", "#ef4444"]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: { position: "bottom" }
        },
        scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
        }
    }
    });

    new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
        labels: categoryData.map(d => d.name),
        datasets: [{
        data: categoryData.map(d => d.value),
        backgroundColor: [
            "#3b82f6",
            "#10b981",
            "#f59e0b",
            "#8b5cf6",
            "#ef4444",
            "#14b8a6",
            "#f97316"
        ],
        borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: { position: "right" },
        tooltip: {
            callbacks: {
            label: function(context) {
                return ` ${context.label}: ${context.raw}`;
            }
            }
        }
        }
    }
    });

    new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
        labels: ["Inventario actual"],
        datasets: [{
        label: "Stock Total",
        data: [Number(kpis.stockTotal || 0)],
        borderColor: "#8b5cf6",
        backgroundColor: "#8b5cf6",
        borderWidth: 3,
        pointRadius: 5,
        tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: { position: "bottom" }
        },
        scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
        }
    }
    });

} catch (error) {
    console.error("Error cargando reportes:", error);
    alert("No se pudieron cargar los datos de reportes");
}
}

cargarReportes();
