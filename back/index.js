import express from 'express'
import cors from 'cors'

const PORT = 5001

const app = express()
app.use(cors())

let countRequestPerSecond = 0
let lastSecond = Date.now()

app.get('/api', (req, res) => {
    const index = parseInt(req.query.index, 10)

    const currentTime = Date.now()
    if (currentTime - lastSecond >= 1000) {
        lastSecond = currentTime
        countRequestPerSecond = 0
    }

    if (countRequestPerSecond > 50) {
        return res.status(429).json({ message: 'Too many request' })
    }
    countRequestPerSecond++

    const delay = Math.floor(Math.random() * 1000) + 1
    setTimeout(() => {
        res.json({ index })
    }, delay)
})

app.listen(PORT, () => {
    console.log(`Server was started on Port: ${PORT}`)
})
