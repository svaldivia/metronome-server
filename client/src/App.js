import React, { Component } from 'react';
import styled from 'styled-components';
import ioClient from 'socket.io-client';
import { Howl } from 'howler';

import clickSound from './sounds/click.mp3';

const SERVER_URL = '/';

//TEMP
const SUBDIVISION = 1; //1/4

const calculateInterval = bpm => {
  return Math.floor(60000 / (bpm * SUBDIVISION));
};

const PageLayout = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
`;

const MetronomeLayout = styled.div`
  display: grid;
  grid-template-rows: 40px min-content 300px;
  grid-row-gap: 4px;
  padding: 24px;
  background-color: #e9e9e9;
`;

class App extends Component {
  state = {
    serverStartTime: '',
    clientStartTime: '',
    currentBpm: ''
  };

  clickSounds = [
    new Howl({
      src: [clickSound],
      preload: true
    })
  ];

  constructor() {
    super();

    this.socket = ioClient(SERVER_URL);
  }

  componentDidMount() {
    this.socket.on('connect', () => {
      console.log('Connected to Server');
    });

    this.socket.on('BPM Start', ({ bpm, serverStartTime }) => {
      console.log('I got bpm ', bpm, 'start at', serverStartTime);
      if (this.timerID) {
        clearInterval(this.timerID);
      }
      this.delayBpmUntilStartTime(bpm, serverStartTime);
    });

    this.socket.on('BPM Stop', () => {
      console.log('STOP IT');
      clearInterval(this.timerID);
    });
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  delayBpmUntilStartTime = (bpm, serverStartTime) => {
    if (!serverStartTime || !bpm) {
      console.error('Problem receiving data from server');
      return;
    }

    // if (Date.now() === serverStartTime) {
    //   this.setState({
    //     serverStartTime,
    //     currentBpm: bpm,
    //     clientStartTime: Date.now()
    //   });
    // } else if (Date.now() > serverStartTime) {
    //   console.error('Problem Synchronizing clock');
    // } else {
    //   // console.log('?????', bpm, serverStartTime);
    //   this.delayBpmUntilStartTime(bpm, serverStartTime);
    // }

    let isBeforeStartTime = true;
    while (isBeforeStartTime) {
      if (Date.now() === serverStartTime) {
        this.startMetronome(bpm);
        isBeforeStartTime = false;
      } else if (Date.now() > serverStartTime) {
        console.error('Problem Synchronizing clock');
        isBeforeStartTime = false;
      }
    }
  };

  startMetronome = (bpm, serverStartTime) => {
    this.setState({
      serverStartTime,
      currentBpm: bpm,
      clientStartTime: Date.now()
    });

    this.timerID = setInterval(() => {
      this.clickSounds[0].play();
    }, calculateInterval(bpm));
  };

  handleSubmitBpm = submitEvent => {
    submitEvent.preventDefault();
    const inputValue = submitEvent.target.bpm.value;
    this.socket.emit('BPM Start', inputValue);
  };

  stopBPM = () => {
    this.socket.emit('BPM Stop');
  };

  render() {
    const { serverStartTime, clientStartTime, currentBpm } = this.state;

    return (
      <PageLayout>
        <MetronomeLayout>
          <div>Metronome</div>
          <div>
            <div>Information:</div>
            <div>BPM Set To: {currentBpm}</div>
            <div>By: ??</div>
            <div>Start Time: {serverStartTime}</div>
            <div>Started at: {clientStartTime}</div>
          </div>
          <form onSubmit={this.handleSubmitBpm}>
            <label>BPM</label>
            <input
              defaultValue={currentBpm}
              name="bpm"
              type="number"
              required
            />
            <button type="submit">Start</button>
            <button type="button" onClick={this.stopBPM}>
              Stop
            </button>
          </form>
        </MetronomeLayout>
      </PageLayout>
    );
  }
}

export default App;
