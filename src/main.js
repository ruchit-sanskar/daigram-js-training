import Diagram from "diagram-js";
import CoreModule from "diagram-js/lib/core";
import InteractionEventsModule from "diagram-js/lib/features/interaction-events";

const container = document.querySelector("#canvas");

function CustomRenderer(eventBus) {

  eventBus.on("render.shape", ({ gfx, element }) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rect.setAttribute("width", element.width);
    rect.setAttribute("height", element.height);
    rect.setAttribute("fill", "#fff");
    rect.setAttribute("stroke", "#000");

    gfx.appendChild(rect);
    return rect;
  });

  eventBus.on("render.connection", ({ gfx, element }) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

    const points = element.waypoints.map(p => `${p.x},${p.y}`).join(" ");

    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "black");

    gfx.appendChild(line);
    return line;
  });
}

CustomRenderer.$inject = ["eventBus"];

const diagram = new Diagram({
  canvas: { container },
  modules: [CoreModule, InteractionEventsModule, {
    __init__: ["customRenderer"],
    customRenderer: ["type", CustomRenderer]
  }]
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const elementRegistry = diagram.get("elementRegistry");
const eventBus = diagram.get("eventBus");

const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

const input = document.getElementById("nodeId");
const addBtn = document.getElementById("addBtn");
const connectBtn = document.getElementById("connectBtn");
const fitBtn = document.getElementById("fitBtn");
const statusDiv = document.getElementById("status");
const detailsDiv = document.getElementById("details");


["A", "B"].forEach((id, i) => {
  const shape = elementFactory.createShape({
    id,
    x: 150 + i * 200,
    y: 150,
    width: 100,
    height: 80
  });

  canvas.addShape(shape, root);
});

/* =========================
   ADD NODE
========================= */

addBtn.onclick = () => {
  const id = input.value.trim();

  if (!id) return alert("Enter id");
  if (elementRegistry.get(id)) return alert("Duplicate id");

  const shape = elementFactory.createShape({
    id,
    x: Math.random() * 500,
    y: Math.random() * 300,
    width: 100,
    height: 80
  });

  canvas.addShape(shape, root);
  input.value = "";
};

let connectMode = false;
let firstNode = null;

connectBtn.onclick = () => {
  connectMode = true;
  firstNode = null;
  alert("Click two nodes");
};

eventBus.on("element.click", (e) => {
  const el = e.element;

  if (el.waypoints || el.id === "root") return;

  // inspector
  const connections = elementRegistry.filter(conn =>
    conn.waypoints &&
    (conn.source === el || conn.target === el)
  );

detailsDiv.innerText =
  `ID: ${el.id}
X: ${Math.round(el.x)}
Y: ${Math.round(el.y)}
Connections: ${connections.length}`;

  // connect logic
  if (!connectMode) return;

  if (!firstNode) {
    firstNode = el;
    return;
  }

  if (firstNode === el) {
    alert("Cannot connect same node");
    return;
  }

  const conn = elementFactory.createConnection({
    id: "conn-" + Date.now(),
    source: firstNode,
    target: el,
    waypoints: [
      { x: firstNode.x + firstNode.width / 2, y: firstNode.y + firstNode.height / 2 },
      { x: el.x + el.width / 2, y: el.y + el.height / 2 }
    ]
  });

  canvas.addConnection(conn, root);

  connectMode = false;
  firstNode = null;
});

function updateStatus() {
  const shapes = elementRegistry.filter(el =>
    !el.waypoints && el.id !== "root"
  );

  const connections = elementRegistry.filter(el => el.waypoints);

  statusDiv.innerText =
    `Nodes: ${shapes.length} | Connections: ${connections.length}`;
}

eventBus.on("shape.added", updateStatus);
eventBus.on("connection.added", updateStatus);
eventBus.on("shape.removed", updateStatus);
eventBus.on("connection.removed", updateStatus);

fitBtn.onclick = () => {
  canvas.zoom("fit-viewport");
};

canvas.zoom("fit-viewport");
updateStatus();