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

/* =========================
   Assignment 3: Custom Event Bus
========================= */

eventBus.on("shape.added", () => {
  const total = elementRegistry.filter(el => !el.waypoints).length;
  eventBus.fire("myapp.shapeCount", { total });
});

eventBus.on("myapp.shapeCount", ({ total }) => {
  console.log(`total shapes: ${total}`);
});

/* =========================
   Shapes Setup
========================= */

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

// initial shapes
createShape(100, 100);
createShape(350, 100);

/* =========================
   Button → Add Shape
========================= */

document.getElementById("addShapeBtn").addEventListener("click", () => {
  const x = Math.random() * 500;
  const y = Math.random() * 250;
  createShape(x, y);
});

function handleClickOnce(event) {
  const { element } = event;

  if (!element || element === root) return;

  console.log(`clicked once: ${element.id}`);
  eventBus.off("element.click", handleClickOnce);
}

eventBus.on("element.click", handleClickOnce);