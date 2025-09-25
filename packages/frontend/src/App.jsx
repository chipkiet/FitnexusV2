import { useEffect, useState } from 'react'
import axios from 'axios'
import AiTrainer from './components/AiTrainer'

function App() {
    const [message, setMessage] = useState('Loading...')

    useEffect(() => {
        axios.get('http://localhost:3001')
            .then(response => {
                setMessage(response.data.message)
            })
            .catch(error => {
                setMessage('Error connecting to backend: ' + error.message)
            })
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <AiTrainer />
        </div>
    )
}

export default App