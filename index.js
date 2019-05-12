const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const port = process.env.PORT || 5000;
const LATENCY_DELAY = 100;

// Static File Declaration
app.use(express.static(path.join(__dirname, 'client/build')));

// Production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build'))); //TODO: I think this is redundant
  //
  app.get('*', (req, res) => {
    res.sendfile(path.join((__dirname = 'client/build/index.html')));
  });
}

// Build mode
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/public/index.html'));
});

io.on('connection', async socket => {
  console.log('an user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('BPM Start', bpm => {
    console.log('BPM: ' + bpm);
    console.log('timestamp: ' + Date.now());
    const serverStartTime = Date.now() + LATENCY_DELAY;
    console.log('serverStartTime: ' + serverStartTime);

    io.emit('BPM Start', { bpm, serverStartTime });
  });

  socket.on('BPM Stop', bpm => {
    console.log('Stop');
    io.emit('BPM Stop');
  });
});

http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
