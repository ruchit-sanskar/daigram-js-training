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

const customModule = {
  __init__: ["customRenderer"],
  customRenderer: ["type", CustomRenderer]
};

const diagram = new Diagram({
  canvas: { container },
  modules: [CoreModule, InteractionEventsModule, customModule]
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const elementRegistry = diagram.get("elementRegistry");
const eventBus = diagram.get("eventBus");

const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

canvas.zoom("fit-viewport");

const input = document.getElementById("shapeId");
const addBtn = document.getElementById("addBtn");
const removeBtn = document.getElementById("removeBtn");
const connectBtn = document.getElementById("connectBtn");
const statusDiv = document.getElementById("status");
const listDiv = document.getElementById("list");

const addedShapes = [];

addBtn.onclick = () => {
  const id = input.value.trim();

  if (!id) return alert("Enter valid id");
  if (elementRegistry.get(id)) return alert("ID already exists");

  const shape = elementFactory.createShape({
    id,
    x: Math.random() * 500,
    y: Math.random() * 400,
    width: 100,
    height: 80
  });

  canvas.addShape(shape, root);
  addedShapes.push(shape);

  input.value = "";
   updateStatus(); 
};

removeBtn.onclick = () => {
  const id = input.value.trim();

  if (!id) return alert("Enter id");

  const shape = elementRegistry.get(id);

  if (!shape || shape.id === "root") return alert("Shape not found");
  if (shape.waypoints) return alert("Not a shape");

  // remove related connections first
  const connections = elementRegistry.filter(el =>
    el.waypoints &&
    (el.source === shape || el.target === shape)
  );

  connections.forEach(conn => {
    canvas.removeConnection(conn);
  });

  canvas.removeShape(shape);

  // clean local array
  const index = addedShapes.findIndex(s => s.id === id);
  if (index !== -1) addedShapes.splice(index, 1);

  input.value = "";

  // FORCE UPDATE (important)
  updateStatus();
};
connectBtn.onclick = () => {
  if (addedShapes.length < 2) return alert("Need 2 shapes");

  const s1 = addedShapes[addedShapes.length - 2];
  const s2 = addedShapes[addedShapes.length - 1];

  const conn = elementFactory.createConnection({
    id: "conn-" + Date.now(),
    source: s1,
    target: s2,
    waypoints: [
      { x: s1.x + s1.width / 2, y: s1.y + s1.height / 2 },
      { x: s2.x + s2.width / 2, y: s2.y + s2.height / 2 }
    ]
  });

  canvas.addConnection(conn, root);
  updateStatus(); 
};

function updateStatus() {

  const allElements = elementRegistry.getAll();

  const shapes = allElements.filter(el =>
    !el.waypoints && el.id !== "root"
  );

  const connections = allElements.filter(el => el.waypoints);

  statusDiv.innerText =
    `Shapes: ${shapes.length} | Connections: ${connections.length}`;

  if (shapes.length === 0) {
    listDiv.innerText = "No shapes";
  } else {
    const ids = shapes.map(s => s.id);
    listDiv.innerText = "Shapes: " + ids.join(", ");
  }
}

eventBus.on("shape.added", updateStatus);
eventBus.on("shape.removed", updateStatus);
eventBus.on("connection.added", updateStatus);
eventBus.on("connection.removed", updateStatus);