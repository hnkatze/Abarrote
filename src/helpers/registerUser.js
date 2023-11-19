const { db } = require("../config/firebase");

function registerUser(username, password, role) {
  const encryptedPassword = (password); // Asegúrate de implementar la encriptación aquí

  db.collection("users").add({
    username: username,
    password: encryptedPassword,
    role: role
  });
}

module.exports = { registerUser };

