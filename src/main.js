import Diagram from "diagram-js";
import CoreModule from "diagram-js/lib/core";

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
}

CustomRenderer.$inject = ["eventBus"];

const customModule = {
  __init__: ["customRenderer"],
  customRenderer: ["type", CustomRenderer]
};

const diagram = new Diagram({
  canvas: { container },
  modules: [CoreModule, customModule]
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const elementRegistry = diagram.get("elementRegistry");

const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

const shape = elementFactory.createShape({
  id: "shape-1",
  x: 200,
  y: 150,
  width: 120,
  height: 80
});

canvas.addShape(shape, root);

canvas.zoom("fit-viewport");

const targetShape = elementRegistry.get("shape-1");

setTimeout(() => {
  console.log("Removing shape...");
  canvas.removeShape(targetShape);
}, 1000);

setTimeout(() => {
  console.log("Re-adding shape...");
  canvas.addShape(targetShape, root);
}, 3000);