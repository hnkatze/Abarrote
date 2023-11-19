const { collection, query, where, getDocs } = require('firebase/firestore');
const { db } = require('../config/firebase');

async function loginUser(username, password) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            throw new Error("Usuario no encontrado");
        }

        const user = querySnapshot.docs[0].data();

        // Comparar la contraseña directamente
        if (password !== user.password) {
            throw new Error("Contraseña incorrecta");
        }

        // Retornar información del usuario si la autenticación es exitosa
        return { username: user.username, role: user.role };
    } catch (error) {
        console.error("Error al iniciar sesión:", error.message);
        throw error;
    }
}

module.exports = { loginUser };

