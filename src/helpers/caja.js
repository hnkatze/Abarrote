const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");
let productos = [];
let productosTabla = [];
document.addEventListener("DOMContentLoaded", async () => {
  try {
    productos = await ipcRenderer.invoke("getProduct");
    displayInventory();
  } catch (error) {
    console.error("Error al cargar productos desde Firebase:", error);
  }
});

function displayInventory() {
  const select = document.getElementById("productoSeleccionado");
  productos.forEach((producto) => {
    const option = document.createElement("option");
    option.value = producto.id;
    option.textContent = producto.nombre;
    select.appendChild(option);
  });
}

function agregarProductoATabla() {
  const productoSeleccionado = document.getElementById(
    "productoSeleccionado"
  ).value;
  const cantidad = document.getElementById("cantidadProducto").value;

  const producto = productos.find((p) => p.id === productoSeleccionado);

  if (producto && cantidad > 0) {
    let newData = {
      id: producto.id,
      Nombre: producto.nombre,
      Cantidad: cantidad,
      Precio: producto.precio,
      Total: cantidad * producto.precio,
    };
    productosTabla.push(newData);
    actualizarTabla();
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

function actualizarISVTotal() {
  const isvf = document.getElementById("isv");
  const totalFinal = document.getElementById("totalFinal");
  const subTotalSpan = document.getElementById("subTotal");
  let subTotalActual = parseFloat(subTotalSpan.textContent) || 0;

  let ISV = subTotalActual * 0.15;
  let totalfi = subTotalActual + ISV;
  isvf.textContent = ISV.toFixed(2);
  totalFinal.textContent = totalfi.toFixed(2);
}
async function upData() {
  const fecha = new Date();
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const ano = fecha.getFullYear();

  const facturaNoElement = document.getElementById("facturaNumero");
  const FacturaNo = facturaNoElement ? facturaNoElement.textContent : null;
  const subTotalElement = document.getElementById("subTotal");
  const subTotal = subTotalElement ? subTotalElement.textContent : null;
  const ISVElement = document.getElementById("isv");
  const ISV = ISVElement ? ISVElement.textContent : null;
  const TotalElement = document.getElementById("totalFinal");
  const Total = TotalElement ? TotalElement.textContent : null;
  const Nombre = document.getElementById("clienteNombre").value;
  const FaturaProducts = productosTabla;
  const Fecha = `${dia < 10 ? "0" + dia : dia}/${
    mes < 10 ? "0" + mes : mes
  }/${ano}`;

  const result = await ipcRenderer.invoke(
    "addInvoice",
    Nombre,
    Fecha,
    FacturaNo,
    subTotal,
    ISV,
    Total,
    FaturaProducts
  );

  if (result.success) {
    displayInventory();
    Swal.fire("¡Éxito!", "Producto agregado con éxito.", "success");
    displayInventory();
  } else {
    console.error("Error al agregar producto:", result.error);
  }
}
document.querySelector(".btn-success").addEventListener("click", upData);
document
  .querySelector(".btn-primary")
  .addEventListener("click", agregarProductoATabla);
document
  .querySelector(".btn-secondary")
  .addEventListener("click", actualizarISVTotal);
