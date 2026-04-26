import Diagram from 'diagram-js';
import CoreModule from 'diagram-js/lib/core';

const diagram = new Diagram({
  canvas: {
    container: document.getElementById('canvas')
  },
  modules: [CoreModule]
});

const canvas = diagram.get('canvas');
const elementFactory = diagram.get('elementFactory');

// Root
const root = canvas.addRootElement({ id: 'root' });
canvas.setRootElement(root);

// Shape
const shape = elementFactory.createShape({
  id: 'rectangle-1',
  x: 150,
  y: 100,
  width: 120,
  height: 60
});

canvas.addShape(shape, root);

canvas.zoom('fit-viewport');

console.log('Canvas initialized successfully');