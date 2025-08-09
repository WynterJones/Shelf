const {
  app,
  BrowserWindow,
  Menu,
  globalShortcut,
  nativeTheme,
  screen,
  ipcMain,
  shell,
  dialog,
} = require("electron");
const path = require("path");
const Store = require("electron-store");
const { exec } = require("child_process");

const store = new Store({
  defaults: {
    side: "left",
    width: 90,
    alwaysOnTop: true,
    workAreaInset: 0,
    apps: [
      {
        id: "finder",
        name: "Finder",
        path: "/System/Library/CoreServices/Finder.app",
        icon: "folder",
      },
      {
        id: "safari",
        name: "Safari",
        path: "/Applications/Safari.app",
        icon: "globe",
      },
      {
        id: "terminal",
        name: "Terminal",
        path: "/System/Applications/Utilities/Terminal.app",
        icon: "terminal",
      },
    ],
    groups: [],
  },
});

let mainWindow;

function getDisplayWorkArea() {
  const primary = screen.getPrimaryDisplay();
  return primary.workArea;
}

function getStickyBounds(side, width) {
  const wa = getDisplayWorkArea();
  const x = side === "left" ? wa.x : wa.x + wa.width - width;
  return { x, y: wa.y, width, height: wa.height };
}

function createWindow() {
  const side = store.get("side");
  const width = store.get("width");
  const { x, y, width: w, height: h } = getStickyBounds(side, width);

  mainWindow = new BrowserWindow({
    x,
    y,
    width: w,
    height: h,
    alwaysOnTop: store.get("alwaysOnTop"),
    frame: false,
    movable: false,
    resizable: false,
    fullscreenable: false,
    hasShadow: false,
    transparent: true,
    vibrancy: "sidebar",
    visualEffectState: "active",
    trafficLightPosition: { x: -100, y: -100 },
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      spellcheck: false,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  const template = [
    {
      label: app.name,
      submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }],
    },
    { label: "Window", submenu: [{ role: "minimize" }, { role: "close" }] },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function stickToSide(side) {
  store.set("side", side);
  const width = store.get("width");
  const b = getStickyBounds(side, width);
  if (mainWindow) mainWindow.setBounds(b);
}

function toggleSide() {
  const side = store.get("side") === "left" ? "right" : "left";
  stickToSide(side);
}

function handleDisplayMetrics() {
  if (!mainWindow) return;
  const side = store.get("side");
  const width = store.get("width");
  mainWindow.setBounds(getStickyBounds(side, width));
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register("CommandOrControl+Shift+S", toggleSide);

  screen.on("display-metrics-changed", handleDisplayMetrics);
  screen.on("display-added", handleDisplayMetrics);
  screen.on("display-removed", handleDisplayMetrics);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle("get-initial-state", () => ({
  side: store.get("side"),
  width: store.get("width"),
  apps: store.get("apps"),
  groups: store.get("groups"),
}));

ipcMain.on("set-side", (_evt, side) => {
  stickToSide(side);
});

ipcMain.on("open-app", (_evt, appPath) => {
  shell.openPath(appPath);
});

ipcMain.on("set-apps", (_evt, apps) => {
  store.set("apps", apps);
});

ipcMain.on("set-width", (_evt, width) => {
  store.set("width", width);
  handleDisplayMetrics();
});

ipcMain.on("toggle-devtools", () => {
  if (mainWindow) mainWindow.webContents.toggleDevTools();
});

ipcMain.on("align-active-window", () => {
  const side = store.get("side");
  const width = store.get("width");
  const wa = getDisplayWorkArea();

  const script =
    side === "left"
      ? `tell application "System Events"
          tell process 1 whose frontmost is true
            set position of window 1 to {${width}, 0}
            set size of window 1 to {${wa.width - width}, ${wa.height}}
          end tell
        end tell`
      : `tell application "System Events"
          tell process 1 whose frontmost is true
            set position of window 1 to {0, 0}
            set size of window 1 to {${wa.width - width}, ${wa.height}}
          end tell
        end tell`;

  exec(`osascript -e '${script}'`, (error) => {
    if (error) console.error("AppleScript error:", error);
  });
});

ipcMain.on("open-panel", (_evt, id) => {
  const panelWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    vibrancy: "sidebar",
    visualEffectState: "active",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  panelWindow.loadFile(path.join(__dirname, "renderer", "panel.html"), {
    query: { id },
  });
});

ipcMain.handle("select-app", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Application",
    defaultPath: "/Applications",
    filters: [{ name: "Applications", extensions: ["app"] }],
    properties: ["openFile"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const appPath = result.filePaths[0];
    const appName = path.basename(appPath, ".app");
    return { name: appName, path: appPath };
  }

  return null;
});

ipcMain.handle("select-image", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: "Select Icon Image",
    filters: [
      {
        name: "Images",
        extensions: ["jpg", "jpeg", "png", "gif", "svg", "webp"],
      },
    ],
    properties: ["openFile"],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }

  return null;
});

ipcMain.on("delete-app", (_evt, appIndex) => {
  const apps = store.get("apps");
  apps.splice(appIndex, 1);
  store.set("apps", apps);
});

ipcMain.on("set-groups", (_evt, groups) => {
  store.set("groups", groups);
});

ipcMain.on("add-group", (_evt, group) => {
  const groups = store.get("groups");
  groups.push(group);
  store.set("groups", groups);
});

ipcMain.on("delete-group", (_evt, groupIndex) => {
  const groups = store.get("groups");
  const apps = store.get("apps");
  const groupId = groups[groupIndex].id;

  apps.forEach((app) => {
    if (app.groupId === groupId) {
      delete app.groupId;
    }
  });

  groups.splice(groupIndex, 1);
  store.set("groups", groups);
  store.set("apps", apps);
});

ipcMain.on("reload-main-window", () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});

let groupPopoutWindow = null;

ipcMain.on("show-group-popout", (_evt, { groupId, buttonPosition, apps }) => {
  if (groupPopoutWindow) {
    groupPopoutWindow.close();
  }

  const side = store.get("side");
  const width = store.get("width");
  const popoutWidth = Math.max(200, apps.length * 48 + 32);

  let x, y;
  if (side === "left") {
    x = width + 8;
  } else {
    x = -popoutWidth - 8;
  }
  y = buttonPosition.top;

  groupPopoutWindow = new BrowserWindow({
    x,
    y,
    width: popoutWidth,
    height: 64,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    vibrancy: "sidebar",
    visualEffectState: "active",
    resizable: false,
    movable: false,
    focusable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  groupPopoutWindow.loadFile(
    path.join(__dirname, "renderer", "group-popout.html"),
    {
      query: { groupId, apps: JSON.stringify(apps) },
    }
  );

  groupPopoutWindow.on("closed", () => {
    groupPopoutWindow = null;
  });
});

ipcMain.on("hide-group-popout", () => {
  if (groupPopoutWindow) {
    groupPopoutWindow.close();
    groupPopoutWindow = null;
  }
});
