const { ipcRenderer } = require('electron');



function navigateTo(page) {
  ipcRenderer.send('navigate', page);
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
document.getElementById('botonReportes').addEventListener('click', () => {
  navigateTo('reportes');
});

document.getElementById('botonUser').addEventListener('click', () => {
  navigateTo('user');
});


});


