import { useRef, useState } from 'react'
import style from './app.module.scss'

function App() {
    const [value, setValue] = useState(0)
    const [running, setRunning] = useState(false)
    const [result, setResult] = useState([])
    const [validation, setValidation] = useState('')

    const index = useRef(1)
    const totalRequests = 1000
    const queue = useRef([])
    const activeRequests = useRef(0)

    const sendRequest = async (i) => {
        try {
            const res = await fetch(`http://localhost:5001/api?index=${i}`)
            if (res.ok) {
                const data = await res.json()
                setResult((prev) =>
                    [...prev, data].sort((a, b) => a.index - b.index)
                )
            } else {
                console.error('somethint went wrong')
            }
        } catch (error) {
            console.error('Request failed:', error)
        } finally {
            activeRequests.current--
            if (queue.current.length) {
                const nextIndex = queue.current.shift()
                sendRequest(nextIndex)
            }
        }
    }

    const startRequests = () => {
        const interval = setInterval(() => {
            if (
                index.current >= totalRequests &&
                activeRequests.current === 0
            ) {
                clearInterval(interval)
                setRunning(false)
                return
            }

            for (let i = 0; i < value; i++) {
                if (
                    activeRequests.current < value &&
                    index.current <= totalRequests
                ) {
                    activeRequests.current++
                    queue.current.push(index.current)
                    index.current++
                }
            }

            while (queue.current.length && index.current <= totalRequests) {
                const reqIndex = queue.current.shift()
                sendRequest(reqIndex)
            }
        }, 1000 / value)
    }

    const handleClick = () => {
        if (value > 100 || value <= 0) {
            setValidation('Please enter a value between 1 and 100')
            return
        }
        setValidation('')
        setRunning(true)
        setResult([])
        queue.current = []
        activeRequests.current = 0
        index.current = 1
        startRequests()
    }

    return (
        <main>
            <form className={style.InputForm}>
                <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
                {validation && <p>{validation}</p>}
                <button type="button" onClick={handleClick} disabled={running}>
                    {running ? 'running...' : 'Start'}
                </button>
            </form>
            <ul>
                {result.map((item) => (
                    <li key={item.index}>{item.index}</li>
                ))}
            </ul>
        </main>
    )
}

export default App
