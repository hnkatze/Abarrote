const { ipcRenderer } = require('electron');

async function addProduct(codigo, descripcion, precio, precioCosto, cantidad) {
    try {
        const result = await ipcRenderer.invoke('addProduct', codigo, nombre, descripcion, precio, precioCosto, cantidad);
        if (result.success) {
            console.log("Producto agregado con éxito.");
        } else {
            console.error("Error al agregar el producto:", result.error);
        }
    } catch (error) {
        console.error("Error al agregar el producto:", error);
    }
}

async function deleteProduct(id) {
    try {
        const result = await ipcRenderer.invoke('deleteProduct', id);
        if (result.success) {
            console.log("Producto eliminado con éxito.");
        } else {
            console.error("Error al eliminar el producto:", result.error);
        }
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
    }
}

async function getProduct() {
    try {
        const productos = await ipcRenderer.invoke('getProduct');
        console.log(productos);
    
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

async function addUsers(role, username, password) {
    try {
        const result = await ipcRenderer.invoke('addUsers', role, username, password);
        if (result.success) {
            console.log("Usuario Creado.");
        } else {
            console.error("Error al agregar el usuario:", result.error);
        }
    } catch (error) {
        console.error("Error al agregar el producto:", error);
    }
}

async function deleteUsers(id) {
    try {
        const result = await ipcRenderer.invoke('deleteProduct', id);
        if (result.success) {
            console.log("Usuario eliminado con éxito.");
        } else {
            console.error("Error al eliminar el usuario:", result.error);
        }
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
    }
}

async function getUsers() {
    try {
        const productos = await ipcRenderer.invoke('getUsers');
        console.log(productos);
    
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
    }
}



module.exports = {
    addProduct,
    deleteProduct,
    getProduct,
    addUsers,
    deleteUsers,
    getUsers
};
