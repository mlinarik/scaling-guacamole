const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const toolsPath = path.resolve(__dirname, '..', 'tools.json');
let tools = { tools: [] };
try {
  tools = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
} catch (err) {
  console.warn('Could not read tools.json at', toolsPath);
}

const jobs = new Map();

app.get('/api/tools', (req, res) => {
  res.json(tools);
});

// start a job and return id
app.post('/api/run', (req, res) => {
  const { name, args } = req.body || {};
  const tool = tools.tools.find(t => t.name === name);
  if (!tool) return res.status(400).json({ error: 'Unknown tool' });

  const jobId = uuidv4();
  const cmdArgs = (tool.args || []).concat(args || []);
  const child = spawn(tool.cmd, cmdArgs, { shell: false });

  jobs.set(jobId, { proc: child, exited: false });

  child.on('exit', (code, signal) => {
    const job = jobs.get(jobId);
    if (job) job.exited = true;
  });

  res.json({ id: jobId });
});

// SSE stream for job output
app.get('/api/stream/:id', (req, res) => {
  const id = req.params.id;
  const job = jobs.get(id);
  if (!job) return res.status(404).send('job not found');

  const proc = job.proc;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  const send = (type, data) => {
    res.write(`event: ${type}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  proc.stdout.on('data', chunk => send('stdout', { text: chunk.toString() }));
  proc.stderr.on('data', chunk => send('stderr', { text: chunk.toString() }));
  proc.on('close', code => {
    send('exit', { code });
    res.end();
  });

  // If client closes connection, kill child
  req.on('close', () => {
    if (!job.exited) {
      try { proc.kill(); } catch (e) {}
    }
  });
});

// Serve frontend static build if present
const frontDist = path.resolve(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontDist)) {
  app.use(express.static(frontDist));
  app.get('/', (req, res) => res.sendFile(path.join(frontDist, 'index.html')));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`web-ui backend listening on ${PORT}`));
