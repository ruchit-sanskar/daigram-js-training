import Diagram from 'diagram-js';
import CoreModule from 'diagram-js/lib/core';

function CustomRenderer(eventBus) {
  // Render Shapes
  eventBus.on('render.shape', function(event) {
    const { gfx, element } = event;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', element.width);
    rect.setAttribute('height', element.height);
    rect.setAttribute('fill', 'white');
    rect.setAttribute('stroke', '#333');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '6');
    gfx.appendChild(rect);
    return rect;
  });

  eventBus.on('render.connection', function(event) {
    const { gfx, element } = event;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    const points = element.waypoints.map(p => `${p.x},${p.y}`).join(' ');
    line.setAttribute('points', points);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#333');
    line.setAttribute('stroke-width', '2');
    gfx.appendChild(line);
    return line;
  });
}

CustomRenderer.$inject = ['eventBus'];

const customModule = {
  __init__: ['customRenderer'],
  customRenderer: ['type', CustomRenderer]
};

// Initialize Diagram
const diagram = new Diagram({
  canvas: { container: document.getElementById('canvas') },
  modules: [CoreModule, customModule]
});

const canvas = diagram.get('canvas');
const elementFactory = diagram.get('elementFactory');
const elementRegistry = diagram.get('elementRegistry');
const eventBus = diagram.get('eventBus');

// Root Element
const root = elementFactory.createRoot({ id: 'root' });
canvas.setRootElement(root);

// Shapes Setup
const w = 120, h = 60, gap = 80;
const startX = 250, startY = 100;

const start = elementFactory.createShape({ id: 'start', x: startX, y: startY, width: w, height: h });
const process = elementFactory.createShape({ id: 'process', x: startX + (w + gap), y: startY, width: w, height: h });
const end = elementFactory.createShape({ id: 'end', x: startX + 2 * (w + gap), y: startY, width: w, height: h });
const errorShape = elementFactory.createShape({ id: 'error', x: startX + (w + gap), y: startY + h + 120, width: w, height: h });

canvas.addShape(start, root);
canvas.addShape(process, root);
canvas.addShape(end, root);
canvas.addShape(errorShape, root);

// Create Connections
canvas.addConnection(elementFactory.createConnection({
  id: 'c1', source: start, target: process,
  waypoints: [{ x: start.x + w, y: start.y + h/2 }, { x: process.x, y: process.y + h/2 }]
}), root);

canvas.addConnection(elementFactory.createConnection({
  id: 'c2', source: process, target: end,
  waypoints: [{ x: process.x + w, y: process.y + h/2 }, { x: end.x, y: end.y + h/2 }]
}), root);

canvas.addConnection(elementFactory.createConnection({
  id: 'c-error', source: process, target: errorShape,
  waypoints: [{ x: process.x + w/2, y: process.y + h }, { x: errorShape.x + w/2, y: errorShape.y }]
}), root);

// 1. Define countEl (The Counter Fix)
const countEl = document.getElementById('count');

function updateCount() {
  const all = elementRegistry.getAll();
  const shapes = all.filter(e => !e.waypoints &&  e.id !== 'root' );
  countEl.textContent = 'Shapes: ' + shapes.length;
}

// listen to future additions
eventBus.on('shape.added', updateCount);

// initial count
updateCount();

// 2. Toolbar Functionality (The Zoom Out Fix)
document.getElementById('fitBtn').onclick = () => canvas.zoom('fit-viewport');
document.getElementById('zoomInBtn').onclick = () => canvas.zoom((canvas.zoom() || 1) + 0.25);
document.getElementById('zoomOutBtn').onclick = () => canvas.zoom((canvas.zoom() || 1) - 0.25);
document.getElementById('resetBtn').onclick = () => canvas.zoom(1);

canvas.zoom('fit-viewport');