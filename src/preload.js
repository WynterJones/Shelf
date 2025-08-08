const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sticky", {
  getInitialState: () => ipcRenderer.invoke("get-initial-state"),
  setSide: (side) => ipcRenderer.send("set-side", side),
  setWidth: (width) => ipcRenderer.send("set-width", width),
  openApp: (appPath) => ipcRenderer.send("open-app", appPath),
  setApps: (apps) => ipcRenderer.send("set-apps", apps),
  toggleDevtools: () => ipcRenderer.send("toggle-devtools"),
  alignActiveWindow: () => ipcRenderer.send("align-active-window"),
  openPanel: (id) => ipcRenderer.send("open-panel", id),
  selectApp: () => ipcRenderer.invoke("select-app"),
  selectImage: () => ipcRenderer.invoke("select-image"),
  deleteApp: (index) => ipcRenderer.send("delete-app", index),
  setGroups: (groups) => ipcRenderer.send("set-groups", groups),
  addGroup: (group) => ipcRenderer.send("add-group", group),
  deleteGroup: (index) => ipcRenderer.send("delete-group", index),
  reloadMainWindow: () => ipcRenderer.send("reload-main-window"),
});
