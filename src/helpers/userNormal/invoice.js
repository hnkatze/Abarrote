const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");

let productos = [];
function displayInventory(productosAMostrar = productos) {
  try {
    const inventoryTable = document.getElementById("invoiceTable");
    let tableHTML = "";
console.log(productos);
    productosAMostrar.forEach((item) => {
      tableHTML += `<tr>
                      <td>${item.FacturaNo}</td>
                      <td>${item.Nombre}</td>
                      <td>L. ${item.Total}</td>
                      <td>L. ${item.Ganancia}</td>
                      <td>${item.Fecha}</td>
                      <td>
                            <button class="ViewButton" data-id="${item.id}">
                                <img src="../../svg/Eye.svg" class="View" alt="Vied">
                            </button>
                            </td>
                    </tr>`;
    });
    inventoryTable.innerHTML = tableHTML;
    setupDeleteButtons();
    calcularYMostrarTotalesYGanancias(productosAMostrar);
  } catch (error) {
    console.error("Error al cargar el inventario:", error);
  }
}
document
  .getElementById("searchInput")
  .addEventListener("input", filtrarProductos);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    productos = await ipcRenderer.invoke("getInvoice");
    displayInventory();
  } catch (error) {
    console.error("Error al cargar productos desde Firebase:", error);
  }
});
function filtrarProductos() {
  const textoBusqueda = document
    .getElementById("searchInput")
    .value.toLowerCase();

  if (!textoBusqueda) {
    displayInventory();
    return;
  }

  const productosFiltrados = productos.filter((producto) => {
    return (
      producto.Nombre.toLowerCase().includes(textoBusqueda) ||
      producto.Fecha.toLowerCase().includes(textoBusqueda) ||
      producto.FacturaNo.toLowerCase().includes(textoBusqueda)
    );
    
  });

  displayInventory(productosFiltrados);
}

function mostrarDetallesFactura(id) {
  const factura = productos.find(item => item.id === id);
  if (factura?.ProduInvoice) {
    let tableHTML = '';
    factura.ProduInvoice.forEach(producto => {
      tableHTML += `<tr>
                      <td>${producto.Nombre}</td>
                      <td>${producto.Cantidad}</td>
                      <td>L. ${producto.Total}</td>
                    </tr>`;
    });
    document.getElementById('modalProductosBody').innerHTML = tableHTML;
    modal.show();
  }
}

function setupDeleteButtons() {

document.querySelectorAll(".ViewButton, .View").forEach((element) => {
  element.addEventListener("click", () => {
    const id = element.closest("tr").querySelector(".ViewButton").getAttribute("data-id");
    mostrarDetallesFactura(id);
  });
});
}
const modal = new bootstrap.Modal(document.getElementById('productosModal'));

function filtrarPorFecha() {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;

  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    const productosFiltrados = productos.filter((producto) => {
      const partesFecha = producto.Fecha.split("/");
      const fechaProducto = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]);

      return fechaProducto >= inicio && fechaProducto <= fin;
    });

    displayInventory(productosFiltrados);
  } else {
    displayInventory(productos);
  }
}

function calcularYMostrarTotalesYGanancias(productosFiltrados) {
  let total = 0;
  let ganancias = 0;

  productosFiltrados.forEach((producto) => {
    total += parseFloat(producto.Total);
    ganancias += parseFloat(producto.Ganancia);
  });

  document.getElementById('totalSpan').textContent = "L. " + total.toFixed(2);
  document.getElementById('gananciasSpan').textContent = "L. " + ganancias.toFixed(2);
}
document.getElementById('fechaInicio').addEventListener('change', filtrarPorFecha);
document.getElementById('fechaFin').addEventListener('change', filtrarPorFecha);
