import { useEffect, useRef } from 'react'
import './App.css'

const SIZE = 400

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, SIZE, SIZE)

    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1

    // outer border
    ctx.strokeRect(0, 0, SIZE, SIZE)

    // diagonals (corner to corner)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(SIZE, SIZE)
    ctx.moveTo(SIZE, 0)
    ctx.lineTo(0, SIZE)
    ctx.stroke()

    // midpoint cross
    ctx.beginPath()
    ctx.moveTo(SIZE / 2, 0)
    ctx.lineTo(SIZE / 2, SIZE)
    ctx.moveTo(0, SIZE / 2)
    ctx.lineTo(SIZE, SIZE / 2)
    ctx.stroke()
  }, [])

  return (
    <div className="page">
      <canvas ref={canvasRef} width={SIZE} height={SIZE} />
    </div>
  )
}

export default App