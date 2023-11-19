const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");

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
                            <td>
                            <button class="DeleteButton" data-id="${item.id}">
                                <img src="../svg/Delete.svg" class="Delete" alt="Borrar">
                            </button>
                            </td>
                            <td>
                            <button class="EditButton" data-id="${item.id}">
                                <img src="../svg/Pencil.svg"  class="Edit" alt="Editar">
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

document.getElementById("guardarProducto").addEventListener("click", async function () {
    const codigo = document.getElementById("codigo").value;
    const nombre = document.getElementById("nombre").value;
    const descripcion = document.getElementById("descripcion").value;
    const precio = parseInt(document.getElementById("precio").value);
    const precioCosto = parseInt(document.getElementById("precioCosto").value);
    const cantidad = parseInt(document.getElementById("cantidad").value);


   const result = await ipcRenderer.invoke("addProduct", codigo, nombre, descripcion, precio, precioCosto, cantidad);

    if (result.success) {
    productos.push({ codigo, nombre, descripcion, precio, precioCosto, cantidad, id: result.id });
    displayInventory();
        addProductModal.hide();
        limpiarFormulario();
        Swal.fire(
        '¡Éxito!',
        'Producto agregado con éxito.',
        'success'
    );
    displayInventory();
    } else {
        console.error("Error al agregar producto:", result.error);
    }
});


document.addEventListener("DOMContentLoaded", async () => {
  try {
    productos = await ipcRenderer.invoke("getProduct");
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

function limpiarFormulario() {
  document.getElementById("codigo").value = "";
  document.getElementById("nombre").value = "";
  document.getElementById("descripcion").value = "";
  document.getElementById("precio").value = "";
  document.getElementById("precioCosto").value = "";
  document.getElementById("cantidad").value = "";
}

document
  .getElementById("guardarCambiosProducto")
  .addEventListener("click", async function () {
    const id = document.getElementById("editId").value;
    const codigo = document.getElementById("editCodigo").value;
    const nombre = document.getElementById("editNombre").value;
    const descripcion = document.getElementById("editDescripcion").value;
    const precio = parseFloat(document.getElementById("editPrecio").value);
    const precioCosto = parseFloat(
      document.getElementById("editPrecioCosto").value
    );
    const cantidad = parseInt(document.getElementById("editCantidad").value);

    try {
      const result = await ipcRenderer.invoke(
        "editProduct",
        id,
        codigo,
        nombre,
        descripcion,
        precio,
        precioCosto,
        cantidad
      );
      console.log("Producto editado con éxito.");

      if (result.success) {
        const indice = productos.findIndex((p) => p.id === id);
        if (indice !== -1) {
          productos[indice] = {
            id,
            codigo,
            nombre,
            descripcion,
            precio,
            precioCosto,
            cantidad,
          };
          
          editProductModal.hide();
          Swal.fire(
        '¡Éxito!',
        'Producto editado con éxito.',
        'warning'
    );
    displayInventory();
        }
      }
    } catch (error) {
      console.error("Error al editar el producto:", error);
    }
  });

async function deleteProduct(id) {
  try {
    const result = await ipcRenderer.invoke("deleteProduct", id);
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

function setupDeleteButtons() {
  document.querySelectorAll(".DeleteButton, .Delete").forEach((element) => {
    element.addEventListener("click", () => {
      const id = element.closest(".DeleteButton").getAttribute("data-id");
      deleteProduct(id);
    });
  });
  document.querySelectorAll(".EditButton, .Edit").forEach((element) => {
    element.addEventListener("click", () => {
      const id = element.closest(".EditButton").getAttribute("data-id");
      abrirModalEdicion(id);
    });
  });
}
const editProductModal = new bootstrap.Modal(
  document.getElementById("editProductModal")
);
const addProductModal = new bootstrap.Modal(
  document.getElementById("addProductModal")
);

function abrirModalEdicion(id) {
  const producto = productos.find((p) => p.id === id);

  if (producto) {
    document.getElementById("editId").value = producto.id;
    document.getElementById("editCodigo").value = producto.codigo;
    document.getElementById("editNombre").value = producto.nombre;
    document.getElementById("editDescripcion").value = producto.descripcion;
    document.getElementById("editPrecio").value = producto.precio;
    document.getElementById("editPrecioCosto").value = producto.precioCosto;
    document.getElementById("editCantidad").value = producto.cantidad;

    editProductModal.show();
  } else {
    console.error("Producto no encontrado");
  }
}
