const { ipcRenderer } = require('electron');

function navigateTo(page) {
    ipcRenderer.send('navigateUserNormal', page);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const botonInventario = document.getElementById('botonInventario');
    const botonCaja = document.getElementById('botonCaja');
    const botonFacturas = document.getElementById('botonFacturas');
    const botonCerrarSesion = document.getElementById('botonCerrarSesion');

    botonInventario.addEventListener('click', () => navigateTo('inventario'));
    botonCaja.addEventListener('click', () => navigateTo('caja'));
    botonFacturas.addEventListener('click', () => navigateTo('invoice'));
    botonCerrarSesion.addEventListener('click', () => navigateTo('login')); 
});
