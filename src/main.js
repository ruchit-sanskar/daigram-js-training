import Diagram from "diagram-js";
import InteractionEventsModule from "diagram-js/lib/features/interaction-events";
import CoreModule from "diagram-js/lib/core";
import DrawModule from "diagram-js/lib/draw";
import "diagram-js/assets/diagram-js.css";

const container = document.getElementById("canvas");

const diagram = new Diagram({
  canvas: { container },
  modules: [CoreModule, DrawModule, InteractionEventsModule],
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const eventBus = diagram.get("eventBus");
const elementRegistry = diagram.get("elementRegistry");

// Root
const root = elementFactory.createRoot();
canvas.setRootElement(root);

eventBus.on("shape.added", () => {
  // count only shapes (exclude connections)
  const total = elementRegistry.filter(el => !el.waypoints).length;

  // 2. Fire custom event
  eventBus.fire("myapp.shapeCount", { total });
});

// 3. Second listener → log result
eventBus.on("myapp.shapeCount", ({ total }) => {
  console.log(`total shapes: ${total}`);
});

let shapeCount = 0;

function createShape(x, y) {
  shapeCount++;

  const shape = elementFactory.createShape({
    id: `shape-${shapeCount}`,
    x,
    y,
    width: 120,
    height: 80,
  });

  canvas.addShape(shape, root);
}

createShape(100, 100);
createShape(350, 100);

const button = document.getElementById("addShapeBtn");

button.addEventListener("click", () => {
  const x = Math.random() * 500;
  const y = Math.random() * 250;

  createShape(x, y);
});