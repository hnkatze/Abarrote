const { ipcRenderer } = require('electron');



function navigateTo(page) {
  ipcRenderer.send('navigateUserNormal', page);
}

document.addEventListener('DOMContentLoaded', (event) => {

   document.getElementById('botonInventario').addEventListener('click', () => {
  navigateTo('inventario');
});
document.getElementById('botonHome').addEventListener('click', () => {
  navigateTo('homePages');
});
document.getElementById('botonCaja').addEventListener('click', () => {
  navigateTo('caja');
});
document.getElementById('botonFactura').addEventListener('click', () => {
  navigateTo('invoice');
});

});


