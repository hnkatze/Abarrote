const { ipcRenderer } = require("electron");
const { default: Swal } = require("sweetalert2");

let usuarios = [];

function displayUsers(usuariosAMostrar = usuarios) {
    const userTable = document.getElementById("userTable");
    let tableHTML = "";

    usuariosAMostrar.forEach((user) => {
        const passwordOculta = '*'.repeat(user.password.length);
        tableHTML += `<tr>
                        <td>${user.username}</td>
                        <td>${passwordOculta}</td>
                        <td>${user.role}</td>
                        <td>
                            <button class="DeleteButton" data-id="${user.id}">
                                <img src="../svg/Delete.svg" class="Delete" alt="Borrar">
                            </button>
                        </td>
                        <td>
                            <button class="EditButton" data-id="${user.id}">
                                <img src="../svg/Pencil.svg" class="Edit" alt="Editar">
                            </button>
                        </td>
                      </tr>`;
    });
    userTable.innerHTML = tableHTML;
    setupDeleteButtons();
}

document.getElementById("guardarUsuario").addEventListener("click", async function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const result = await ipcRenderer.invoke("addUsers", role, username, password);

    if (result.success) {
        usuarios.push({ username, password, role, id: result.id });
        displayUsers();
        addUserModal.hide();
        limpiarFormulario();
        Swal.fire('¡Éxito!', 'Usuario agregado con éxito.', 'success');
    } else {
        console.error("Error al agregar usuario:", result.error);
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        usuarios = await ipcRenderer.invoke("getUsers");
        displayUsers();
    } catch (error) {
        console.error("Error al cargar usuarios desde Firebase:", error);
    }
});

function filtrarUsuarios() {
    const textoBusqueda = document.getElementById("searchInput").value.toLowerCase();

    if (!textoBusqueda) {
        displayUsers();
        return;
    }

    const usuariosFiltrados = usuarios.filter((user) => {
        return user.username.toLowerCase().includes(textoBusqueda) ||
               user.role.toLowerCase().includes(textoBusqueda);
    });

    displayUsers(usuariosFiltrados);
}

document.getElementById("searchInput").addEventListener("input", filtrarUsuarios);

function limpiarFormulario() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("role").value = "normal"; // Valor por defecto
}

document.getElementById("guardarCambiosUsuario").addEventListener("click", async function () {
    const id = document.getElementById("editUserId").value;
    const username = document.getElementById("editUsername").value;
    const password = document.getElementById("editPassword").value; // Asegúrate de tener este campo en tu formulario
    const role = document.getElementById("editRole").value;

    try {
        const result = await ipcRenderer.invoke("editUsers", id, role, username, password);

        if (result.success) {
            const indice = usuarios.findIndex((u) => u.id === id);
            if (indice !== -1) {
                usuarios[indice] = { id, username, password, role };
                editUserModal.hide();
                Swal.fire('¡Éxito!', 'Usuario editado con éxito.', 'success');
                displayUsers();
            }
        }
    } catch (error) {
        console.error("Error al editar el usuario:", error);
    }
});

async function deleteUser(id) {
    try {
        const result = await ipcRenderer.invoke("deleteUsers", id);
        if (result.success) {
            usuarios = usuarios.filter((u) => u.id !== id);
            Swal.fire('Eliminado', 'Usuario eliminado con éxito.', 'info');
            displayUsers();
        } else {
            console.error("Error al eliminar el usuario:", result.error);
        }
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
    }
}

function setupDeleteButtons() {
    document.querySelectorAll(".DeleteButton, .Delete").forEach((element) => {
        element.addEventListener("click", () => {
            const id = element.closest(".DeleteButton").getAttribute("data-id");
            deleteUser(id);
        });
    });
    document.querySelectorAll(".EditButton, .Edit").forEach((element) => {
        element.addEventListener("click", () => {
            const id = element.closest(".EditButton").getAttribute("data-id");
            abrirModalEdicion(id);
        });
    });
}

const addUserModal = new bootstrap.Modal(document.getElementById("addUserModal"));
const editUserModal = new bootstrap.Modal(document.getElementById("editUserModal"));

function abrirModalEdicion(id) {
    const usuario = usuarios.find((u) => u.id === id);

    if (usuario) {
        document.getElementById("editUserId").value = usuario.id;
        document.getElementById("editUsername").value = usuario.username;
        document.getElementById("editPassword").value = usuario.password; // Asegúrate de tener este campo en tu formulario
        document.getElementById("editRole").value = usuario.role;

        editUserModal.show();
    } else {
        console.error("Usuario no encontrado");
    }
}
