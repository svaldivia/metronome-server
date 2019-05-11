const socket = io();
var sound = new Howl({
  src: ['click.mp3']
});

// Temp
const SUBDIVISION = 4; //1/4

const calculateInterval = bpm => {
  return Math.floor(60000 / (bpm * SUBDIVISION));
};

// document.getElementById('bpmForm').addEventListener('submit', submitEvent => {
//   submitEvent.preventDefault();
//   const inputValue = document.getElementById('bpm').value;
//   socket.emit('BPM Start', inputValue);
// });
// document.getElementById('bpmStop').addEventListener('click', () => {
//   socket.emit('BPM Stop');
// });

socket.on('BPM Start', ({ bpm, startTime }) => {
  const currentDate = Date.now();

  console.log('timestamp: ' + currentDate);
  console.log('startTime: ' + startTime);

  sound.play();

  let isBeforeStartTime = true;
  while (isBeforeStartTime) {
    if (Date.now() === startTime) {
      document.getElementById('currentBpm').innerText = bpm;
      document.getElementById('timestamp').innerText = Date.now();
      isBeforeStartTime = false;
    }

    if (Date.now() > startTime) {
      document.getElementById('currentBpm').innerText =
        'Error synchronizing clock';
      isBeforeStartTime = false;
    }
  }
});

socket.on('BPM Stop', () => {
  document.getElementById('currentBpm').innerText = 'none';
  document.getElementById('timestamp').innerText = Date.now();
});
