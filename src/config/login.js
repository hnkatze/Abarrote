const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send('clear-shared-data');
  document
    .getElementById("login-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const user = await ipcRenderer.invoke(
          "login-event",
          username,
          password
        );
        console.log("Usuario autenticado:", user);
      } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
      }
    });
});
