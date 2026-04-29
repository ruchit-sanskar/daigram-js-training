import Diagram from "diagram-js";
import CoreModule from "diagram-js/lib/core";
import InteractionEventsModule from "diagram-js/lib/features/interaction-events";

const container = document.querySelector("#canvas");

function CustomRenderer(eventBus) {

  eventBus.on("render.shape", function (event) {
    const { gfx, element } = event;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rect.setAttribute("width", element.width);
    rect.setAttribute("height", element.height);
    rect.setAttribute("fill", "#fff");
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

const diagram = new Diagram({
  canvas: { container },
  modules: [CoreModule, InteractionEventsModule, customModule]
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const elementRegistry = diagram.get("elementRegistry");

const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

const shapes = [
  elementFactory.createShape({ id: "shape-1", x: 50,  y: 100, width: 100, height: 80 }),
  elementFactory.createShape({ id: "shape-2", x: 200, y: 100, width: 100, height: 80 }),
  elementFactory.createShape({ id: "shape-3", x: 350, y: 100, width: 100, height: 80 }),
  elementFactory.createShape({ id: "shape-4", x: 500, y: 100, width: 100, height: 80 })
];

shapes.forEach(shape => canvas.addShape(shape, root));

const s1 = elementRegistry.get("shape-1");
const s2 = elementRegistry.get("shape-2");
const s3 = elementRegistry.get("shape-3");
const s4 = elementRegistry.get("shape-4");

const connections = [
  elementFactory.createConnection({
    id: "conn-1",
    source: s1,
    target: s2,
    waypoints: [
      { x: s1.x + s1.width, y: s1.y + s1.height / 2 },
      { x: s2.x, y: s2.y + s2.height / 2 }
    ]
  }),
  elementFactory.createConnection({
    id: "conn-2",
    source: s2,
    target: s3,
    waypoints: [
      { x: s2.x + s2.width, y: s2.y + s2.height / 2 },
      { x: s3.x, y: s3.y + s3.height / 2 }
    ]
  }),
  elementFactory.createConnection({
    id: "conn-3",
    source: s3,
    target: s4,
    waypoints: [
      { x: s3.x + s3.width, y: s3.y + s3.height / 2 },
      { x: s4.x, y: s4.y + s4.height / 2 }
    ]
  })
];

connections.forEach(conn => canvas.addConnection(conn, root));

canvas.zoom("fit-viewport");

function findShapeAt(px, py) {
  const shapes = elementRegistry.filter(el => !el.waypoints);

  return shapes.find(el => {
    return (
      px >= el.x &&
      px <= el.x + el.width &&
      py >= el.y &&
      py <= el.y + el.height
    );
  });
}

container.addEventListener("click", (e) => {
  const rect = container.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const shape = findShapeAt(x, y);

  if (shape) {
    console.log("Found shape:", shape.id);
  } else {
    console.log("No shape found");
  }
});

// Example test
console.log(findShapeAt(150, 120));