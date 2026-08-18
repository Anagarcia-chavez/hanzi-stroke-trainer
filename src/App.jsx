import { useEffect, useRef, useState } from 'react'
import strokeData from 'hanzi-writer-data/一.json'
import './App.css'

const SIZE = 400
const SCALE = SIZE / 1024

function toCanvasPoints(points) {
  return points.map(([x, y]) => [x * SCALE, (900 - y) * SCALE])
}

function App() {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const currentStroke = useRef([])

  function draw() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, SIZE, SIZE)

    // rice grid
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, SIZE, SIZE)
    ctx.beginPath()
    ctx.moveTo(0, 0); ctx.lineTo(SIZE, SIZE)
    ctx.moveTo(SIZE, 0); ctx.lineTo(0, SIZE)
    ctx.moveTo(SIZE / 2, 0); ctx.lineTo(SIZE / 2, SIZE)
    ctx.moveTo(0, SIZE / 2); ctx.lineTo(SIZE, SIZE / 2)
    ctx.stroke()

    // ghost reference character
    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    strokeData.medians.forEach((stroke) => {
      const points = toCanvasPoints(stroke)
      ctx.beginPath()
      points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
      ctx.stroke()
    })

    // your in-progress stroke, in red
    if (currentStroke.current.length > 1) {
      ctx.strokeStyle = '#c00'
      ctx.lineWidth = 8
      ctx.beginPath()
      currentStroke.current.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
      ctx.stroke()
    }
  }

  useEffect(draw, [])

  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }

  function handleMouseDown(e) {
    setDrawing(true)
    currentStroke.current = [getPos(e)]
  }

  function handleMouseMove(e) {
    if (!drawing) return
    currentStroke.current = [...currentStroke.current, getPos(e)]
    draw()
  }

  function handleMouseUp() {
    setDrawing(false)
    console.log('finished stroke:', currentStroke.current)
  }

  return (
    <div className="page">
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}

export default App