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
                      <td>${item.Total}</td>
                      <td>${item.Fecha}</td>
                      <td>
                            <button class="ViewButton" data-id="${item.id}">
                                <img src="../svg/Eye.svg" class="View" alt="Borrar">
                            </button>
                            </td>
                            <td>
                            <button class="DeleteButton" data-id="${item.id}">
                                <img src="../svg/Delete.svg" class="Delete" alt="Borrar">
                            </button>
                            </td>
                    </tr>`;
    });
    inventoryTable.innerHTML = tableHTML;
    setupDeleteButtons();
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

async function deleteProduct(id) {
  try {
    const result = await ipcRenderer.invoke("deleteInvoice", id);
    if (result.success) {
      console.log("Producto eliminado con éxito.");
      productos = productos.filter((p) => p.id !== id);
      
      Swal.fire(
        'Pues Se Borro!',
        'Pero A Que Costo?.',
        'question'
    );
    displayInventory();
    } else {
      console.error("Error al eliminar el producto:", result.error);
    }
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
  }
}
function mostrarDetallesFactura(id) {
  const factura = productos.find(item => item.id === id);
  if (factura && factura.ProduInvoice) {
    let tableHTML = '';
    factura.ProduInvoice.forEach(producto => {
      tableHTML += `<tr>
                      <td>${producto.Nombre}</td>
                      <td>${producto.Cantidad}</td>
                      <td>${producto.Total}</td>
                    </tr>`;
    });
    document.getElementById('modalProductosBody').innerHTML = tableHTML;
    modal.show();
  }
}

function setupDeleteButtons() {
  document.querySelectorAll(".DeleteButton, .Delete").forEach((element) => {
    element.addEventListener("click", () => {
      const id = element.closest(".DeleteButton").getAttribute("data-id");
      deleteProduct(id);
    });
  });

document.querySelectorAll(".ViewButton, .View").forEach((element) => {
  element.addEventListener("click", () => {
    const id = element.closest("tr").querySelector(".ViewButton").getAttribute("data-id");
    mostrarDetallesFactura(id);
  });
});
}
const modal = new bootstrap.Modal(document.getElementById('productosModal'));