const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  remote,
} = require("electron");
const path = require("path");
const { loginUser } = require("../helpers/loginUser");
const {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} = require("firebase/firestore");
const { db } = require("./firebase");
const collectionRef = collection(db, "inventory");
const collectionRefUser = collection(db, "users");
const collectionRefinvoice = collection(db, "invoice");
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  global.sharedData = {
    username: null,
    role: null,
  };

  ipcMain.handle("login-event", async (event, username, password) => {
    try {
      const user = await loginUser(username, password);
      if (user) {
        global.sharedData.username = user.username;
        global.sharedData.role = user.role;
        mainWindow.loadFile(path.join(__dirname, "../pages/homePages.html"));
        return user;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../pages/homePages.html"));

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}
ipcMain.on('clear-shared-data', () => {
  global.sharedData.username = null;
  global.sharedData.role = null;
});


app.on("ready", () => {
  createWindow();
  globalShortcut.register("CommandOrControl+I", () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});

function loadPage(page) {
  mainWindow.loadFile(path.join(__dirname, `${page}.html`));
}

ipcMain.on("navigate", (event, page) => {
  loadPage(`../pages/${page}`);
});

ipcMain.handle("addProduct",
  async (event,codigo, nombre, descripcion, precio, precioCosto, cantidad) => {
    try {
     const docRef= await addDoc(collectionRef, {
        codigo,
        nombre,
        descripcion,
        precio,
        precioCosto,
        cantidad,
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error al agregar el producto:", error);
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("deleteProduct", async (event, id) => {
  try {
    const productDoc = doc(db, "inventory", id);
    await deleteDoc(productDoc);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('editProduct', async (event, id, codigo, nombre, descripcion, precio, precioCosto, cantidad) => {
    try {
        const productDoc = doc(db, "inventory", id);
        await updateDoc(productDoc, {
            codigo, nombre, descripcion, precio, precioCosto, cantidad
        });
        return { success: true };
    } catch (error) {
        console.error('Error al editar el producto:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle("getProduct", async () => {
  try {
    const docis = await getDocs(collectionRef);
    let productos = docis.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return productos;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
});
ipcMain.handle("addUsers",
  async (event,role, username, password) => {
    try {
      await addDoc(collectionRefUser, {
        role,
        username,
        password,
      });
      return { success: true };
    } catch (error) {
      console.error("Error al crear el nuevo usuario:", error);
      return { success: false, error: error.message };
    }
  }
);
ipcMain.handle("getUsers", async () => {
  try {
    const docis = await getDocs(collectionRefUser);
    let productos = docis.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return productos;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return [];
  }
});
ipcMain.handle("deleteUsers", async (event, id) => {
  try {
    const productDoc = doc(db, "users", id);
    await deleteDoc(productDoc);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle('editUsers', async (event, id, role, username, password) => {
    try {
        const productDoc = doc(db, "users", id);
        await updateDoc(productDoc, {
            role, username, password
        });
        return { success: true };
    } catch (error) {
        console.error('Error al editar el Usuario:', error);
        return { success: false, error: error.message };
    }
});
ipcMain.handle("addInvoice",
  async (event,Nombre, Fecha, FacturaNo,subTotal, ISV, Total, ProduInvoice ) => {
    try {
      await addDoc(collectionRefinvoice, {
        Nombre,
        Fecha,
        FacturaNo,
        subTotal,
        ISV,
        Total,
        ProduInvoice
      });
      return { success: true };
    } catch (error) {
      console.error("Error al crear la nueva Factura: ", error);
      return { success: false, error: error.message };
    }
  }
);