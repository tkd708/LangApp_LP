import React, { useState, useEffect } from 'react';
import Recorder from 'recorder-js';


const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [blobRecorded, setBlobRecorded] = useState(null);


const initialiseRecording = () => {
    const audioContext =  new (window.AudioContext || window.webkitAudioContext)();
    
    const recorder = new Recorder(audioContext, {
        //onAnalysed: data => console.log(data),
    });
    
    setRecorder(recorder)

    navigator.mediaDevices.getUserMedia({audio: true})
    .then(stream => recorder.init(stream))
    .catch(err => console.log('Uh oh... unable to get stream...', err));
}

const startRecording = () => {
  recorder.start()
    .then(() => setIsRecording(true));
}

const stopRecording = () => {
   recorder.stop()
    .then(({blob, buffer}) => {
      setBlobRecorded(blob) 
      //console.log(blob)
      const base64String = buffer.toString('base64');
      console.log(base64String)
    })
 }
 
    return (
      <div className="App">
          <div className="controls">
            <button onClick={initialiseRecording}>initialise recording</button>
            <button onClick={startRecording}>start recording</button>
            <button onClick={stopRecording}>stop recording</button>
          </div>
      </div>
    );
}

export default AudioRecorder;
