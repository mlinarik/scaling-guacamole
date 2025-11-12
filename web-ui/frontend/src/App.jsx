import React, { useEffect, useState, useRef } from 'react'

export default function App() {
  const [tools, setTools] = useState([])
  const [selected, setSelected] = useState('')
  const [args, setArgs] = useState('')
  const [output, setOutput] = useState([])
  const evtRef = useRef(null)

  useEffect(() => {
    fetch('/api/tools').then(r => r.json()).then(data => {
      setTools(data.tools || [])
      if ((data.tools || []).length) setSelected(data.tools[0].name)
    })
  }, [])

  const run = async () => {
    setOutput([])
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: selected, args: args ? args.split(' ') : [] })
    })
    const { id } = await res.json()
    const es = new EventSource(`/api/stream/${id}`)
    evtRef.current = es
    es.addEventListener('stdout', e => {
      const d = JSON.parse(e.data)
      setOutput(o => [...o, { t: 'out', text: d.text }])
    })
    es.addEventListener('stderr', e => {
      const d = JSON.parse(e.data)
      setOutput(o => [...o, { t: 'err', text: d.text }])
    })
    es.addEventListener('exit', e => {
      const d = JSON.parse(e.data)
      setOutput(o => [...o, { t: 'exit', code: d.code }])
      es.close()
    })
  }

  return (
    <div className="app">
      <header>
        <h1>Scaling Guacamole — Web UI</h1>
      </header>
      <section className="controls">
        <label>Tool
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            {tools.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </label>
        <label>Args
          <input value={args} onChange={e => setArgs(e.target.value)} placeholder="space-separated args" />
        </label>
        <button onClick={run}>Run</button>
      </section>

      <section className="output">
        <h2>Output</h2>
        <pre>
          {output.map((line, i) => (
            <div key={i} className={line.t === 'err' ? 'err' : line.t === 'exit' ? 'exit' : 'out'}>
              {line.t === 'exit' ? `Process exited (${line.code})` : line.text}
            </div>
          ))}
        </pre>
      </section>
    </div>
  )
}
