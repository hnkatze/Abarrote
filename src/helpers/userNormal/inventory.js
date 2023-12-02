const { ipcRenderer } = require("electron");

let productos = [];
function displayInventory(productosAMostrar = productos) {
  try {
    const inventoryTable = document.getElementById("inventoryTable");
    let tableHTML = "";

    productosAMostrar.forEach((item) => {
      tableHTML += `<tr>
                      <td>${item.codigo}</td>
                      <td>${item.nombre}</td>
                      <td>${item.descripcion}</td>
                      <td>L. ${item.precio}</td>
                      <td>L. ${item.precioCosto}</td>
                      <td>${item.cantidad}</td>
                    </tr>`;
    });
    inventoryTable.innerHTML = tableHTML;
  } catch (error) {
    console.error("Error al cargar el inventario:", error);
  }
}
document
  .getElementById("searchInput")
  .addEventListener("input", filtrarProductos);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    productos = await ipcRenderer.invoke("getProduct");
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
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
      producto.nombre.toLowerCase().includes(textoBusqueda) ||
      producto.descripcion.toLowerCase().includes(textoBusqueda) ||
      producto.codigo.toLowerCase().includes(textoBusqueda)
    );
  });

  displayInventory(productosFiltrados);
}

