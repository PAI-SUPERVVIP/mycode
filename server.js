cat > server.js << 'EOF'
const express = require("express");
const { WebSocketServer } = require("ws");
const pty = require("node-pty");

const app = express();
app.use(express.static("public"));

const server = app.listen(process.env.PORT || 8080, () => {
  console.log("Terminal server running");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  const shell = "bash";
  const ptyProcess = pty.spawn(shell, ["-l"], {
    name: "xterm-color",
    cols: 100,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  });

  ptyProcess.onData((data) => ws.send(data));
  ws.on("message", (msg) => ptyProcess.write(msg));
  ws.on("close", () => ptyProcess.kill());
});
EOF