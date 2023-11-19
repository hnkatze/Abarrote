const { collection, addDoc } = require('firebase/firestore');
const { db } = require('../config/firebase');

 const collectionRef = collection(db, "inventory");

async function addProduct(nombre, descripcion, precio, precioCosto, cantidad) {
  try {

    await addDoc(collectionRef, {
      nombre,
      descripcion,
      precio,
      precioCosto,
      cantidad
    });

    console.log("Producto agregado con éxito.");
    addProductModal.hide();
  } catch (error) {
    console.error("Error al agregar el producto:", error);
  }
}

const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));


document.getElementById('guardarProducto').addEventListener('click', function() {
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const precio = parseInt(document.getElementById('precio').value);
  const precioCosto = parseInt(document.getElementById('precioCosto').value);
  const cantidad = parseInt(document.getElementById('cantidad').value);

  addProduct(nombre, descripcion, precio, precioCosto, cantidad);
  addProductModal.hide();
});
