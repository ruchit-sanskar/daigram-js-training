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

const root = canvas.addRootElement({ id: "root" });
canvas.setRootElement(root);

const shapes = [];

for (let i = 0; i < 3; i++) {
  const shape = elementFactory.createShape({
    id: `node-${i}`,
    x: 100 + i * 150,
    y: 120,
    width: 100,
    height: 80
  });

  shapes.push(shape);
}

for (const shape of shapes) {
  canvas.addShape(shape, root);
}
canvas.zoom("fit-viewport");

console.log("3 shapes created using factory, then added via canvas");