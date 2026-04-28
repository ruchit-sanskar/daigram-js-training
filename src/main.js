import Diagram from "diagram-js";
import CoreModule from "diagram-js/lib/core";
import InteractionEventsModule from "diagram-js/lib/features/interaction-events";

const container = document.querySelector("#canvas");

/* =========================
   Custom Renderer
========================= */

function CustomRenderer(eventBus) {

  eventBus.on("render.shape", function (event) {
    const { gfx, element } = event;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rect.setAttribute("width", element.width);
    rect.setAttribute("height", element.height);
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#000");
    rect.setAttribute("stroke-width", "2");

    gfx.appendChild(rect);
    return rect;
  });

  eventBus.on("render.connection", function (event) {
    const { gfx, element } = event;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    const points = element.waypoints
      .map(p => `${p.x},${p.y}`)
      .join(" ");

    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "2");

    gfx.appendChild(line);
    return line;
  });
}

CustomRenderer.$inject = ["eventBus"];

const customModule = {
  __init__: ["customRenderer"],
  customRenderer: ["type", CustomRenderer]
};

/* =========================
   Diagram Init
========================= */

const diagram = new Diagram({
  canvas: { container },
  modules: [CoreModule, InteractionEventsModule, customModule]
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const elementRegistry = diagram.get("elementRegistry");
const eventBus = diagram.get("eventBus");

/* =========================
   Root
========================= */

const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

/* =========================
   Shapes
========================= */

const shape1 = elementFactory.createShape({
  id: "shape-1",
  x: 50,
  y: 100,
  width: 100,
  height: 80
});

const shape2 = elementFactory.createShape({
  id: "shape-2",
  x: 220,
  y: 100,
  width: 100,
  height: 80
});

const shape3 = elementFactory.createShape({
  id: "shape-3",
  x: 390,
  y: 100,
  width: 100,
  height: 80
});

canvas.addShape(shape1, root);
canvas.addShape(shape2, root);
canvas.addShape(shape3, root);

/* =========================
   Connections
========================= */

const s1 = elementRegistry.get("shape-1");
const s2 = elementRegistry.get("shape-2");
const s3 = elementRegistry.get("shape-3");

const conn1 = elementFactory.createConnection({
  id: "conn-1",
  source: s1,
  target: s2,
  waypoints: [
    { x: s1.x + s1.width, y: s1.y + s1.height / 2 },
    { x: s2.x, y: s2.y + s2.height / 2 }
  ]
});

const conn2 = elementFactory.createConnection({
  id: "conn-2",
  source: s2,
  target: s3,
  waypoints: [
    { x: s2.x + s2.width, y: s2.y + s2.height / 2 },
    { x: s3.x, y: s3.y + s3.height / 2 }
  ]
});

canvas.addConnection(conn1, root);
canvas.addConnection(conn2, root);

canvas.zoom("fit-viewport");

/* =========================
   Sidebar Elements
========================= */

const detailsDiv = document.getElementById("details");
const previewDiv = document.getElementById("preview");

/* =========================
   CLICK → Inspector
========================= */

eventBus.on("element.click", ({ element }) => {
  if (!element || element === root) return;

  const isConnection = !!element.waypoints;

  let html = `
    <div class="item"><b>ID:</b> ${element.id}</div>
    <div class="item"><b>Type:</b> ${isConnection ? "Connection" : "Shape"}</div>
  `;

  if (isConnection) {
    html += `<div class="item"><b>Waypoints:</b> ${element.waypoints.length}</div>`;
  } else {
    html += `
      <div class="item"><b>Position:</b> (${element.x}, ${element.y})</div>
      <div class="item"><b>Size:</b> ${element.width} × ${element.height}</div>
    `;
  }

  detailsDiv.innerHTML = html;
});

/* =========================
   HOVER → Custom Events
========================= */

eventBus.on("element.hover", ({ element }) => {
  if (!element || element === root) return;

  eventBus.fire("inspector.preview", { id: element.id });
});

eventBus.on("element.out", () => {
  eventBus.fire("inspector.clearPreview");
});

/* =========================
   Custom Event Listeners
========================= */

eventBus.on("inspector.preview", ({ id }) => {
  previewDiv.innerText = `Hovering: ${id}`;
});

eventBus.on("inspector.clearPreview", () => {
  previewDiv.innerText = "";
});