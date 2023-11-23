const { ipcRenderer } = require('electron');

function navigateTo(page) {
    ipcRenderer.send('navigate', page);
}

document.addEventListener('DOMContentLoaded', (event) => {
    const botonInventario = document.getElementById('botonInventario');
    const botonCaja = document.getElementById('botonCaja');
    const botonFacturas = document.getElementById('botonFacturas');
    const botonUsuarios = document.getElementById('botonUsuarios');
    const botonCerrarSesion = document.getElementById('botonCerrarSesion');

    botonInventario.addEventListener('click', () => navigateTo('inventario'));
    botonCaja.addEventListener('click', () => navigateTo('caja'));
    botonFacturas.addEventListener('click', () => navigateTo('invoice'));
    botonUsuarios.addEventListener('click', () => navigateTo('user'));
    botonCerrarSesion.addEventListener('click', () => navigateTo('login')); 
});
