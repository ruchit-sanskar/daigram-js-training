import Diagram from "diagram-js";
import CoreModule from "diagram-js/lib/core";

//  Get container
const container = document.querySelector("#canvas");

//  Custom Renderer
function CustomRenderer(eventBus) {

  // Draw shapes
  eventBus.on("render.shape", function (event) {
    const { gfx, element } = event;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    rect.setAttribute("width", element.width);
    rect.setAttribute("height", element.height);
    rect.setAttribute("fill", "white");
    rect.setAttribute("stroke", "black");
    rect.setAttribute("stroke-width", "2");

    gfx.appendChild(rect);
    return rect;
  });

  // Draw connections
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

//  Init diagram
const diagram = new Diagram({
  canvas: {
    container: container
  },
  modules: [CoreModule, customModule]
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const elementRegistry = diagram.get("elementRegistry");

//  Root
const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

//  Shapes
const shapeWidth = 120;
const shapeHeight = 60;
const gap = 40;
const startX = 150;
const startY = 120;

for (let i = 0; i < 3; i++) {
  const shape = elementFactory.createShape({
    id: `shape${i + 1}`,
    x: startX + i * (shapeWidth + gap),
    y: startY,
    width: shapeWidth,
    height: shapeHeight
  });

  canvas.addShape(shape, root);
}

//  Get shapes
const s1 = elementRegistry.get("shape1");
const s2 = elementRegistry.get("shape2");
const s3 = elementRegistry.get("shape3");

//  Connections
const conn1 = elementFactory.createConnection({
  id: "conn1",
  source: s1,
  target: s2,
  waypoints: [
    { x: s1.x + s1.width, y: s1.y + s1.height / 2 },
    { x: s2.x, y: s2.y + s2.height / 2 }
  ]
});

const conn2 = elementFactory.createConnection({
  id: "conn2",
  source: s2,
  target: s3,
  waypoints: [
    { x: s2.x + s2.width, y: s2.y + s2.height / 2 },
    { x: s3.x, y: s3.y + s3.height / 2 }
  ]
});

canvas.addConnection(conn1, root);
canvas.addConnection(conn2, root);

//  Fit on load
canvas.zoom("fit-viewport");

//  Button zoom (200%)

// Zoom button (200%) with dynamic center
document.querySelector("#zoomBtn").addEventListener("click", () => {

  const shapes = elementRegistry.filter(el =>
    !el.waypoints && el.id !== "root"
  );

  if (!shapes.length) return;

  // calculate bounding box
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  shapes.forEach(s => {
    minX = Math.min(minX, s.x);
    minY = Math.min(minY, s.y);
    maxX = Math.max(maxX, s.x + s.width);
    maxY = Math.max(maxY, s.y + s.height);
  });

  // center of all shapes
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  canvas.zoom(2, {
    x: centerX,
    y: centerY
  });

});