import Diagram from "diagram-js";
import CoreModule from "diagram-js/lib/core";

const container = document.querySelector("#canvas");

function CustomRenderer(eventBus) {

  // 🔹 Draw shapes
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

  //  Draw connections
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

//  Diagram init
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

// Get shapes
const s1 = elementRegistry.get("shape-1");
const s2 = elementRegistry.get("shape-2");
const s3 = elementRegistry.get("shape-3");

//  Connections (WITH WAYPOINTS)
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

//  Fit view
canvas.zoom("fit-viewport");

console.log("Now everything visible");