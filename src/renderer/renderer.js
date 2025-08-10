const state = {
  side: "left",
  width: 90,
  apps: [],
  groups: [],
};

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

const iconLibrary = {
  circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  star: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  expand:
    "M20 6v12M18 4H6m12 16H6m-2-2V6m18-2a2 2 0 1 1-4 0a2 2 0 0 1 4 0M6 4a2 2 0 1 1-4 0a2 2 0 0 1 4 0m16 16a2 2 0 1 1-4 0a2 2 0 0 1 4 0M6 20a2 2 0 1 1-4 0a2 2 0 0 1 4 0",
  folder:
    "M4 4h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  globe:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12h4v8c-2.21 0-4-1.79-4-4v-4zm6 8v-8h4v8h-4zm6 0v-8h4v4c0 2.21-1.79 4-4 4z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  code: "m16 18 6-6-6-6M8 6l-6 6 6 6",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  music:
    "M9 18V5l12-2v13M9 13c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4z",
  camera:
    "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z",
  settings:
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  image:
    "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10z",
  play: "M8 5v14l11-7z",
  video:
    "M23 7l-7 5 7 5V7z M16 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20",
  calculator:
    "M9 7h6v2H9V7zm0 4h6v2H9v-2zm0 4h6v2H9v-2zm-4-8h2v2H5V7zm0 4h2v2H5v-2zm0 4h2v6H5v-6z",
  calendar:
    "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
  chat: "M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h11c.55 0 1-.45 1-1z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  file: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
  heart:
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  monitor:
    "M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8 21l4-4 4 4",
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
  shopping:
    "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  wifi: "M1.42 9a16 16 0 0 1 21.16 0M5 12.55a11 11 0 0 1 14.08 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01",
};

function icon(type = "circle", isImage = false) {
  if (isImage) {
    const img = document.createElement("img");
    img.src = type;
    img.className = "icon icon-image";
    img.style.width = "24px";
    img.style.height = "24px";
    img.style.borderRadius = "4px";
    img.style.objectFit = "cover";
    return img;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("stroke-width", "2");
  svg.className = "icon";

  const iconPath = iconLibrary[type] || iconLibrary.circle;
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", iconPath);
  svg.appendChild(path);

  return svg;
}

function setSide(nextSide) {
  state.side = nextSide;
  window.sticky.setSide(nextSide);
}

function openApp(appPath) {
  window.sticky.openApp(appPath);
}

function renderToolbar() {
  const buttons = [];

  state.apps.forEach((app) => {
    if (app.groupId) return;

    const isImage =
      app.icon &&
      (app.icon.startsWith("http") ||
        app.icon.startsWith("data:") ||
        app.icon.startsWith("file:"));

    buttons.push(
      h("div", { class: "button-container" }, [
        h(
          "button",
          {
            class: "button",
            title: app.name,
            onClick: () => openApp(app.path),
          },
          [icon(app.icon || "circle", isImage)]
        ),
        h("div", { class: "label", text: app.name }),
      ])
    );
  });

  state.groups.forEach((group) => {
    const groupApps = state.apps.filter((app) => app.groupId === group.id);
    if (groupApps.length === 0) return;

    buttons.push(
      h("div", { class: "button-container group-container" }, [
        h(
          "button",
          {
            class: "button group-button",
            title: group.name,
            onClick: (e) => showGroupPopout(e, group.id, groupApps),
          },
          [icon("star")]
        ),
        h("div", { class: "label", text: group.name }),
      ])
    );
  });

  const toolButtons = [{ id: "settings", label: "Settings" }];

  toolButtons.forEach((t) => {
    buttons.push(
      h("div", { class: "button-container" }, [
        h(
          "button",
          {
            class: "button",
            title: t.label,
            onClick: () => window.sticky.openPanel(t.id),
          },
          [icon("settings")]
        ),
        h("div", { class: "label", text: t.label }),
      ])
    );
  });

  buttons.push(h("div", { class: "spacer" }));

  buttons.push(
    h("div", { class: "button-container align-container" }, [
      h(
        "button",
        {
          class: "button align-button",
          title: "Align Window",
          onClick: () => window.sticky.alignActiveWindow(),
        },
        [icon("expand")]
      ),
    ])
  );

  return h("div", { class: "toolbar" }, buttons);
}

function showGroupPopout(event, groupId, groupApps) {
  const button = event.target.closest(".button-container");
  const buttonRect = button.getBoundingClientRect();

  console.log({
    top: buttonRect.top,
    left: buttonRect.left,
    right: buttonRect.right,
    bottom: buttonRect.bottom,
    width: buttonRect.width,
    height: buttonRect.height,
    centerY: buttonRect.top + buttonRect.height / 2,
  });

  window.sticky.showGroupPopout({
    groupId,
    buttonPosition: {
      top: buttonRect.top,
      left: buttonRect.left,
      right: buttonRect.right,
      bottom: buttonRect.bottom,
      width: buttonRect.width,
      height: buttonRect.height,
      centerY: buttonRect.top + buttonRect.height / 2,
    },
    apps: groupApps,
  });
}

function hideGroupPopout() {
  window.sticky.hideGroupPopout();
}

function render() {
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.appendChild(renderToolbar());
  document.body.style.width = state.width + "px";
}

async function init() {
  const initState = await window.sticky.getInitialState();
  state.side = initState.side;
  state.width = initState.width;
  state.apps = initState.apps;
  state.groups = initState.groups || [];
  render();
}

init();
