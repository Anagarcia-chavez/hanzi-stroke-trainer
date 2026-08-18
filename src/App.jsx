import { useEffect, useRef, useState } from 'react'
import strokeData from 'hanzi-writer-data/一.json'
import './App.css'

const SIZE = 400
const SCALE = SIZE / 1024

function toCanvasPoints(points) {
  return points.map(([x, y]) => [x * SCALE, (900 - y) * SCALE])
}

// Walk along a path and pick n points evenly spaced by distance travelled,
// not by index — so a stroke drawn slowly (lots of points bunched up)
// compares fairly against one drawn fast (few points, spread out).
function resample(points, n) {
  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1]
    const [x1, y1] = points[i]
    lengths.push(lengths[i - 1] + Math.hypot(x1 - x0, y1 - y0))
  }
  const total = lengths[lengths.length - 1] || 1

  const out = []
  for (let i = 0; i < n; i++) {
    const target = (i / (n - 1)) * total
    let seg = 1
    while (seg < lengths.length - 1 && lengths[seg] < target) seg++
    const segStart = lengths[seg - 1]
    const segEnd = lengths[seg]
    const t = segEnd > segStart ? (target - segStart) / (segEnd - segStart) : 0
    const [x0, y0] = points[seg - 1]
    const [x1, y1] = points[seg]
    out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
  }
  return out
}

// Returns a 0-1 score: how close the drawn stroke is to the reference.
function scoreStroke(drawn, reference) {
  const n = 20
  const a = resample(drawn, n)
  const b = resample(reference, n)

  let totalDist = 0
  for (let i = 0; i < n; i++) {
    totalDist += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1])
  }
  const avgDist = totalDist / n

  // avgDist of 0 = perfect match. Tune the divisor to taste —
  // 60px of average slop still counts as a pass for now.
  return Math.max(0, 1 - avgDist / 60)
}

function App() {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const currentStroke = useRef([])

  const referenceStroke = toCanvasPoints(strokeData.medians[0])

  function draw() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, SIZE, SIZE)

    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, SIZE, SIZE)
    ctx.beginPath()
    ctx.moveTo(0, 0); ctx.lineTo(SIZE, SIZE)
    ctx.moveTo(SIZE, 0); ctx.lineTo(0, SIZE)
    ctx.moveTo(SIZE / 2, 0); ctx.lineTo(SIZE / 2, SIZE)
    ctx.moveTo(0, SIZE / 2); ctx.lineTo(SIZE, SIZE / 2)
    ctx.stroke()

    ctx.strokeStyle = '#ccc'
    ctx.lineWidth = 12
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    referenceStroke.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.stroke()

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
    setFeedback(null)
    currentStroke.current = [getPos(e)]
  }

  function handleMouseMove(e) {
    if (!drawing) return
    currentStroke.current = [...currentStroke.current, getPos(e)]
    draw()
  }

  function handleMouseUp() {
    if (!drawing) return
    setDrawing(false)
    const drawn = currentStroke.current
    if (drawn.length < 2) return

    const score = scoreStroke(drawn, referenceStroke)
    setFeedback(score > 0.5 ? `good — score ${score.toFixed(2)}` : `try again — score ${score.toFixed(2)}`)
  }

  return (
    <div className="page">
      <div>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        {feedback && <p>{feedback}</p>}
      </div>
    </div>
  )
}

export default App