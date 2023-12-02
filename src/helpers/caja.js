const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");
let productos = [];
let invoices = [];
let productosTabla = [];
document.addEventListener("DOMContentLoaded", async () => {
  try {
    invoices = await ipcRenderer.invoke("getInvoice");
  productos = await ipcRenderer.invoke("getProduct");
  productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    displayInventory();
  } catch (error) {
    console.error("Error al cargar productos desde Firebase:", error);
  }
});

async function displayInventory() {
  const numeroFactura = await obtenerSiguienteNumeroFactura();
  const facturaNoElement = document.getElementById("facturaNumero");
   if (!isNaN(numeroFactura)) {
    facturaNoElement.textContent = numeroFactura.toString();
  } else {
    facturaNoElement.textContent = "Error"; 
  }
   const select = document.getElementById("productoSeleccionado");
  productos.forEach((producto) => {
    const option = document.createElement("option");
    option.value = producto.id;
    option.textContent = producto.nombre;
    select.appendChild(option);
  });

}
async function obtenerSiguienteNumeroFactura() {
  try {
    const numerosFactura = invoices.length;
    const siguienteNumero = numerosFactura + 1;
    return siguienteNumero;
  } catch (error) {
    console.error("Error al obtener las facturas:", error);
    return "00001";
  }
}

function agregarProductoATabla() {
  const productoSeleccionado = document.getElementById(
    "productoSeleccionado"
  ).value;
  const cantidad = document.getElementById("cantidadProducto").value;

  const producto = productos.find((p) => p.id === productoSeleccionado);
  console.log(productos);
  if (producto && cantidad > 0) {
    if (cantidad <= producto.cantidad) {
      let newData = {
        id: producto.id,
        Nombre: producto.nombre,
        Cantidad: cantidad,
        Precio: producto.precio,
        Total: cantidad * producto.precio,
        precioCosto: producto.precioCosto
      };
      productosTabla.push(newData);
      actualizarTabla();
    } else {
      Swal.fire(
        "Error!",
        "No Hay Suficiente Stock Para Este producto, Intenta una cantida menor",
        "Error"
      );
    }
  }
}

function actualizarTabla() {
  const tabla = document.getElementById("productosAgregados");
  let tableHTML = "";

  productosTabla.forEach((producto, index) => {
    tableHTML += `<tr>
                    <td>${producto.Nombre}</td>
                    <td>${producto.Cantidad}</td>
                    <td>${producto.Precio.toFixed(2)}</td>
                    <td>${producto.Total.toFixed(2)}</td>
                    <td>
                      <button class="btn btn-danger btn-sm" onclick="eliminarProductoDeTabla(${index})">Eliminar</button>
                    </td>
                  </tr>`;
  });

  tabla.innerHTML = tableHTML;
  actualizarSubTotal();
}

function eliminarProductoDeTabla(index) {
  productosTabla.splice(index, 1);
  actualizarTabla();
  actualizarSubTotal();
}

function actualizarSubTotal() {
  let subTotal = productosTabla.reduce(
    (total, producto) => total + producto.Total,
    0
  );
  document.getElementById("subTotal").textContent = subTotal.toFixed(2);
}


async function upData() {
  const fecha = new Date();
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();

  const facturaNoElement = document.getElementById("facturaNumero");
  const FacturaNo = facturaNoElement ? facturaNoElement.textContent : null;
  const subTotalElement = document.getElementById("subTotal");
   const Total = parseFloat(subTotalElement ? subTotalElement.textContent : 0);
  const Nombre = document.getElementById("clienteNombre").value;
  const FaturaProducts = productosTabla;
  const Fecha = `${dia < 10 ? "0" + dia : dia}/${
    mes < 10 ? "0" + mes : mes
  }/${ano}`;

 const TotalCosto = productosTabla.reduce((totalCosto, producto) => {
    return totalCosto + (parseFloat(producto.precioCosto) * parseFloat(producto.Cantidad));
  }, 0);

const Ganancia = parseFloat((Total - TotalCosto).toFixed(2));

  const result = await ipcRenderer.invoke(
    "addInvoice",
    Nombre,
    Fecha,
    FacturaNo,
    Total,
    Ganancia,
    FaturaProducts
  );

  if (result.success) {
    actualizarInventarioDespuesDeFactura(FaturaProducts);
    displayInventory();
    limpiarDespuesDeFactura();
    Swal.fire("¡Éxito!", "La Factura se guardo con exito.", "success");
  } else {
    console.error("Error al agregar producto:", result.error);
  }
}
function limpiarDespuesDeFactura() {
  const tabla = document.getElementById("productosAgregados");
  tabla.innerHTML = "";

  const inputCliente = document.getElementById("clienteNombre");
  inputCliente.value = "";

  productosTabla = [];

  document.getElementById("subTotal").textContent = "0.00";
}
async function actualizarInventarioDespuesDeFactura(productosFactura) {
  for (const productoFactura of productosFactura) {
    try {
      const producto = productos.find((p) => p.id === productoFactura.id);
      if (producto) {
        const nuevaCantidad = producto.cantidad - productoFactura.Cantidad;
        producto.cantidad = nuevaCantidad;

        const response = await ipcRenderer.invoke(
          "editProduct",
          producto.id,
          producto.codigo,
          producto.nombre,
          producto.descripcion,
          producto.precio,
          producto.precioCosto,
          nuevaCantidad
        );

        if (!response.success) {
          console.error(
            "Error al actualizar producto en Firestore:",
            response.error
          );
        }
      }
    } catch (error) {
      console.error("Error al actualizar la cantidad del producto:", error);
    }
  }
}

document.querySelector(".btn-success").addEventListener("click", upData);
document
  .querySelector(".btn-primary")
  .addEventListener("click", agregarProductoATabla);

