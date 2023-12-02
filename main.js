const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  Menu,
} = require("electron");
const path = require("path");
const { loginUser } = require("./src/helpers/loginUser");
const {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} = require("firebase/firestore");
const { db } = require("./src/config/firebase");
const collectionRef = collection(db, "inventory");
const collectionRefUser = collection(db, "users");
const collectionRefinvoice = collection(db, "invoice");
let mainWindow;
let products = [];
let invoice = [];
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  Menu.setApplicationMenu(null);
  global.sharedData = {
    username: null,
    role: null,
  };

  ipcMain.handle("login-event", async (event, username, password) => {
    try {
      const user = await loginUser(username, password);
      if (user?.username && user?.role) {
        global.sharedData.username = user.username;
        global.sharedData.role = user.role;
        const docis = await getDocs(collectionRef);
      products = docis.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
       const dociss = await getDocs(collectionRefinvoice);
      invoice = dociss.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        if (user.role === "admin") {
          mainWindow.loadFile(
            path.join(__dirname, "src/pages/homePages.html")
          );
        } else {
          mainWindow.loadFile(
            path.join(__dirname, "src/pages/userNormal/homePages.html")
          );
        }

        return user;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  });

  mainWindow.loadFile(path.join(__dirname, "src/pages/login.html"));

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}
ipcMain.on("clear-shared-data", () => {
  global.sharedData.username = null;
  global.sharedData.role = null;
});

app.on("ready", () => {
  createWindow();
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
  mainWindow.loadFile(path.join(__dirname, `src/pages/${page}.html`));
}
ipcMain.on("navigateUserNormal", (event, page) => {
  if (page !== "login") {
    loadPage(`../pages/userNormal/${page}`);
  } else {
    loadPage(`../pages/${page}`);
  }
});
ipcMain.on("navigate", (event, page) => {
  loadPage(`../pages/${page}`);
});
ipcMain.handle(
  "addProduct",
  async (event, codigo, nombre, descripcion, precio, precioCosto, cantidad) => {
    try {
      const docRef = await addDoc(collectionRef, {
        codigo,
        nombre,
        descripcion,
        precio,
        precioCosto,
        cantidad,
      });
      products.push({
        id: docRef.id,
        codigo,
        nombre,
        descripcion,
        precio,
        precioCosto,
        cantidad
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
    products = products.filter((product) => product.id !== id);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle(
  "editProduct",
  async (
    event,
    id,
    codigo,
    nombre,
    descripcion,
    precio,
    precioCosto,
    cantidad
  ) => {
    try {
      const productDoc = doc(db, "inventory", id);
      await updateDoc(productDoc, {
        codigo,
        nombre,
        descripcion,
        precio,
        precioCosto,
        cantidad,
      });

        const index = products.findIndex(product => product.id === id);
      if (index !== -1) {
        products[index] = { id, codigo, nombre, descripcion, precio, precioCosto, cantidad };
      }

      return { success: true };
    } catch (error) {
      console.error("Error al editar el producto:", error);
      return { success: false, error: error.message };
    }
  }
);
ipcMain.handle("getProduct", async () => {
  try {
    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
});
ipcMain.handle("addUsers", async (event, role, username, password) => {
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
});
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
ipcMain.handle("editUsers", async (event, id, role, username, password) => {
  try {
    const productDoc = doc(db, "users", id);
    await updateDoc(productDoc, {
      role,
      username,
      password,
    });
    return { success: true };
  } catch (error) {
    console.error("Error al editar el Usuario:", error);
    return { success: false, error: error.message };
  }
});
ipcMain.handle(
  "addInvoice",
  async (event, Nombre, Fecha, FacturaNo, Total, Ganancia, ProduInvoice) => {
    try {
      const docRef= addDoc(collectionRefinvoice, {
        Nombre,
        Fecha,
        FacturaNo,
        Total,
        Ganancia,
        ProduInvoice,
      });
      invoice.push({
        id: docRef.id,
        Nombre,
        Fecha,
        FacturaNo,
        Total,
        Ganancia,
        ProduInvoice
      });
      return { success: true };
    } catch (error) {
      console.error("Error al crear la nueva Factura: ", error);
      return { success: false, error: error.message };
    }
  }
);

ipcMain.handle("getInvoice", async () => {
  try {
    return invoice;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
});

ipcMain.handle("deleteInvoice", async (event, id) => {
  try {
    const productDoc = doc(db, "invoice", id);
    await deleteDoc(productDoc);
    invoice = invoice.filter(item => item.id !== id);
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    return { success: false, error: error.message };
  }
});
