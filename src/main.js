import Diagram from "diagram-js";
import InteractionEventsModule from "diagram-js/lib/features/interaction-events";
import "diagram-js/assets/diagram-js.css";

const diagram = new Diagram({
  canvas: { container: document.getElementById("canvas") },
  modules: [InteractionEventsModule],
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const eventBus = diagram.get("eventBus");

// Root
const root = elementFactory.createRoot();
canvas.setRootElement(root);

// ── Shapes
const shape1 = elementFactory.createShape({
  id: "shape-1",
  x: 100,
  y: 100,
  width: 120,
  height: 80,
});

const shape2 = elementFactory.createShape({
  id: "shape-2",
  x: 350,
  y: 100,
  width: 120,
  height: 80,
});

canvas.addShape(shape1, root);
canvas.addShape(shape2, root);

// 
const connection = elementFactory.createConnection({
  id: "conn-1",
  source: shape1,
  target: shape2,
  waypoints: [
    {
      x: shape1.x + shape1.width, 
      y: shape1.y + shape1.height / 2,
    },
    {
      x: shape2.x, // left edge of shape2
      y: shape2.y + shape2.height / 2,
    },
  ],
});

canvas.addConnection(connection, root);

eventBus.on("element.click", ({ element }) => {
  if (!element || element === root) return;

  const type = element.waypoints ? "connection" : "shape";
  console.log(`clicked ${type}: ${element.id}`);
});

eventBus.on("element.hover", ({ element }) => {
  if (!element || element === root) return;

  console.log(`entered: ${element.id}`);
});

eventBus.on("element.out", ({ element }) => {
  if (!element || element === root) return;

  console.log(`left: ${element.id}`);
});