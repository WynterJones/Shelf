function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on"))
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach(
    (c) => c && el.appendChild(c)
  );
  return el;
}

function panelShell(title, body, footer = null) {
  return h("div", { class: "panel-window" }, [
    h("div", { class: "panel-header" }, [
      h("div", { class: "panel-title", text: title }),
      h("div", {}, [
        h("button", {
          class: "ghost",
          onClick: () => window.close(),
          text: "Close",
        }),
      ]),
    ]),
    h("div", { class: "panel-body" }, [body]),
    footer ? h("div", { class: "footer" }, footer) : null,
  ]);
}

const iconLibrary = [
  "circle",
  "star",
  "folder",
  "globe",
  "terminal",
  "code",
  "mail",
  "music",
  "camera",
  "settings",
  "image",
  "play",
  "video",
  "book",
  "calculator",
  "calendar",
  "chat",
  "download",
  "edit",
  "file",
  "heart",
  "home",
  "monitor",
  "phone",
  "search",
  "shopping",
  "user",
  "wifi",
];

async function SettingsPanel() {
  const initState = await window.sticky.getInitialState();
  let hasUnsavedChanges = false;

  const sideSelect = h("select", {}, [
    h("option", { value: "left", text: "Left" }),
    h("option", { value: "right", text: "Right" }),
  ]);
  sideSelect.value = initState.side;
  sideSelect.addEventListener("change", () => {
    hasUnsavedChanges = true;
  });

  const widthInput = h("input", {
    type: "number",
    value: String(initState.width),
    min: "64",
    max: "200",
  });
  widthInput.addEventListener("change", () => {
    hasUnsavedChanges = true;
  });

  const groupList = h("div", { class: "list" });
  function renderGroups() {
    groupList.innerHTML = "";
    initState.groups.forEach((group, idx) => {
      const name = h("input", {
        value: group.name || "",
        placeholder: "Group Name",
      });
      const deleteBtn = h("button", {
        class: "ghost delete-btn",
        text: "Delete",
      });

      name.addEventListener("input", () => {
        initState.groups[idx].name = name.value;
        hasUnsavedChanges = true;
      });

      deleteBtn.addEventListener("click", () => {
        initState.groups.splice(idx, 1);
        initState.apps.forEach((app) => {
          if (app.groupId === group.id) {
            delete app.groupId;
          }
        });
        renderGroups();
        renderApps();
        hasUnsavedChanges = true;
      });

      groupList.appendChild(
        h("div", { class: "list-item" }, [name, deleteBtn])
      );
    });
  }

  const addGroup = h("button", {
    class: "ghost add-group-btn",
    html: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg> Add New Group`,
    onClick: () => {
      const newGroup = { id: Date.now().toString(), name: "" };
      initState.groups.push(newGroup);
      renderGroups();
      hasUnsavedChanges = true;
    },
  });

  const appList = h("div", { class: "list" });
  function renderApps() {
    appList.innerHTML = "";
    initState.apps.forEach((app, idx) => {
      const name = h("input", {
        value: app.name || "",
        placeholder: "App Name",
      });

      const iconSelect = h("select", {}, [
        h("option", { value: "", text: "Choose Icon..." }),
        ...iconLibrary.map((iconName) =>
          h("option", {
            value: iconName,
            text: iconName.charAt(0).toUpperCase() + iconName.slice(1),
          })
        ),
      ]);
      iconSelect.value = app.icon || "";

      const imageBtn = h("button", {
        class: "ghost",
        text: "Image",
      });

      const groupSelect = h("select", {}, [
        h("option", { value: "", text: "No Group" }),
        ...initState.groups.map((g) =>
          h("option", { value: g.id, text: g.name })
        ),
      ]);
      groupSelect.value = app.groupId || "";

      const deleteBtn = h("button", {
        class: "ghost delete-btn",
        text: "Delete",
      });

      name.addEventListener("input", () => {
        initState.apps[idx].name = name.value;
        hasUnsavedChanges = true;
      });

      iconSelect.addEventListener("change", () => {
        initState.apps[idx].icon = iconSelect.value;
        hasUnsavedChanges = true;
      });

      imageBtn.addEventListener("click", async () => {
        const imagePath = await window.sticky.selectImage();
        if (imagePath) {
          initState.apps[idx].icon = `file://${imagePath}`;
          hasUnsavedChanges = true;
        }
      });

      groupSelect.addEventListener("change", () => {
        if (groupSelect.value) {
          initState.apps[idx].groupId = groupSelect.value;
        } else {
          delete initState.apps[idx].groupId;
        }
        hasUnsavedChanges = true;
      });

      deleteBtn.addEventListener("click", () => {
        initState.apps.splice(idx, 1);
        renderApps();
        hasUnsavedChanges = true;
      });

      appList.appendChild(
        h("div", { class: "list-item app-item" }, [
          h("div", { class: "app-info" }, [
            name,
            h("div", { class: "icon-controls" }, [iconSelect, imageBtn]),
            groupSelect,
          ]),
          deleteBtn,
        ])
      );
    });
  }

  const addApp = h("button", {
    class: "primary add-app-btn",
    html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8"></path></svg> Add New App`,
    onClick: async () => {
      const selectedApp = await window.sticky.selectApp();
      if (selectedApp) {
        initState.apps.push({
          id: Date.now().toString(),
          name: selectedApp.name,
          path: selectedApp.path,
          icon: "circle",
        });
        renderApps();
        hasUnsavedChanges = true;
      }
    },
  });

  const saveBtn = h("button", {
    class: "primary save-btn",
    text: "Save Changes",
    onClick: () => {
      window.sticky.setSide(sideSelect.value);
      const w = Math.max(
        64,
        Math.min(200, parseInt(widthInput.value || "90", 10))
      );
      window.sticky.setWidth(w);
      window.sticky.setGroups(initState.groups);
      window.sticky.setApps(initState.apps);
      window.sticky.reloadMainWindow();
      hasUnsavedChanges = false;
      window.close();
    },
  });

  renderGroups();
  renderApps();

  const body = h("div", { class: "list" }, [
    h("div", { class: "row" }, [h("label", { text: "Side" }), sideSelect]),
    h("div", { class: "row" }, [h("label", { text: "Width" }), widthInput]),
    h("div", { class: "section-header", text: "Groups" }),
    groupList,
    addGroup,
    h("div", { class: "section-header", text: "Apps" }),
    appList,
    addApp,
  ]);

  const footer = [saveBtn];
  return panelShell("Settings", body, footer);
}

function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const panelId = urlParams.get("id");

  const root = document.getElementById("panel-root");

  switch (panelId) {
    case "settings":
      SettingsPanel().then((panel) => root.appendChild(panel));
      break;
    default:
      root.appendChild(h("div", { text: "Panel not available" }));
  }
}

init();
