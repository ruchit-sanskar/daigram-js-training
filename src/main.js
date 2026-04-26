import './style.css'
import Diagram from 'diagram-js'
import CoreModule from 'diagram-js/lib/core'

// Get canvas element
const container = document.querySelector('#canvas')

// Init diagram
const diagram = new Diagram({
  canvas: {
    container: container
  },
  modules: [CoreModule]
})

// Get services
const canvas = diagram.get('canvas')
const elementFactory = diagram.get('elementFactory')

// Create root
const root = canvas.addRootElement({ id: 'root' })
canvas.setRootElement(root)

// Shape config
const shapeWidth = 100
const shapeHeight = 100
const gap = 40
const startX = 10
const startY = 50

// Shapes data
const shapes = [
  { id: 'shape-1', x: startX, y: startY },
  { id: 'shape-2', x: startX + shapeWidth + gap, y: startY },
  { id: 'shape-3', x: startX + (shapeWidth + gap) * 2, y: startY }
]

// Create + add shapes
shapes.forEach((data) => {
  const shape = elementFactory.createShape({
    id: data.id,
    x: data.x,
    y: data.y,
    width: shapeWidth,
    height: shapeHeight
  })

  canvas.addShape(shape, root)
})

canvas.zoom('fit-viewport')

console.log(' 3 shapes rendered successfully')