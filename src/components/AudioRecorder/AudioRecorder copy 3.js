import React, { useState, useEffect } from 'react';
import { ReactMic } from 'react-mic';
import axios from 'axios';

const reader = new FileReader();
const xhr = new XMLHttpRequest();

class AudioRecorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: false
    }
  }

  startRecording = () => {
    this.setState({ record: true });
  }

  stopRecording = () => {
    this.setState({ record: false });
  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  onStop(recordedBlob) {
    console.log('recordedBlob is: ', recordedBlob);
    //xhr.responseType = "blob";
    //xhr.open("GET", recordedBlob.blobURL);
    //xhr.setRequestHeader('Content-Type', 'application/json');
    //xhr.send();
    //xhr.onload = function() {
        //console.log(`Loaded: ${xhr.status} ${xhr.response}`);
        //reader.readAsDataURL(xhr.response)
        reader.readAsDataURL(recordedBlob.blob)
        reader.onload = function(){
            //const recordString = reader.result;
            //const recordString = reader.result.replace('data:audio/webm;base64,','').replace('==','');
            const recordString = reader.result.replace('data:audio/webm;codecs=opus;base64,','');
            //console.log(recordString)
            console.log('sent audio: '+ recordString.slice(0,100))
            //const url = 'https://langapp.netlify.app/.netlify/functions/hello';
            const url = 'https://langapp.netlify.app/.netlify/functions/speech-to-text-expo';
        
            axios
                .request({
                    url,
                    method: 'POST',
                    data:  {
                        audio: recordString,
                     },
                })
                .then((res) => {
                    console.log(res)
                    console.log(res.data.transcript)
                    //setTranscript(res.data.transcript);
                })
                .catch((err) => {
                    console.log('transcribe err :', err);
                });
        };
    //};
  }

  testAPI = () => {
    const url = 'https://langapp.netlify.app/.netlify/functions/hello';
      axios
                .request({
                    url,
                    method: 'POST',
                    data:  {
                        audio: 'recordString',
                     },
                })
                .then((res) => {
                    console.log(res)
                    //console.log(res.data.transcript)
                    //setTranscript(res.data.transcript);
                })
                .catch((err) => {
                    console.log('transcribe err :', err);
                });
    };

  render() {
    return (
      <div>
        <ReactMic
          record={this.state.record}
          className="sound-wave"
          onStop={this.onStop}
          onData={this.onData}
          strokeColor="#000000"
          backgroundColor="#FF4081" />
        <button onClick={this.startRecording} type="button">Start</button>
        <button onClick={this.stopRecording} type="button">Stop</button>
        <button onClick={this.testAPI} type="button">Test</button>
      </div>
    );
  }
}

export default AudioRecorder;
