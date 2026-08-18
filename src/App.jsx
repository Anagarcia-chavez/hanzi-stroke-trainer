import { useEffect, useRef } from 'react'
import strokeData from 'hanzi-writer-data/一.json'
import './App.css'

const SIZE = 400
const SCALE = SIZE / 1024

// hanzi-writer-data's Y axis increases upward from a baseline near 900.
// Flip it and scale it down to fit our canvas.
function toCanvasPoints(points) {
  return points.map(([x, y]) => [x * SCALE, (900 - y) * SCALE])
}

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
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
  }, [])

  return (
    <div className="page">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} />
    </div>
  )
}

export default App