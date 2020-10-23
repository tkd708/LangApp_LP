import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import {ReactMic} from 'react-mic'; // only local
const {ReactMic} = typeof window !== `undefined` ? require("react-mic") : null //"window" is not available during server side rendering.

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [blobRecorded, setBlobRecorded] = useState(null);
    const [recordString, setRecordString] = useState(null);

  const startRecording = () => {
    setIsRecording(true);
  }

  const stopRecording = () => {
    setIsRecording(false);
  }

  const onData = (recordedBlob) => {
    //console.log('chunk of real-time data is: ', recordedBlob);
  }

  const onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);
    setBlobRecorded(recordedBlob)
  }
  
  const playRecording = () => {
    const tmp = new Audio(blobRecorded.blobURL); //passing your state (hook)
    tmp.play() //simple play of an audio element. 
  }

  const blobToBase64 = () => {
      const reader = new FileReader(); 
      reader.readAsDataURL(blobRecorded.blob); 
      reader.onloadend = function () { 
          const recordString = reader.result.toString().replace('data:audio/webm;codecs=opus;base64,','');
          console.log('sent audio: '+ recordString.slice(-300))  
          setRecordString(recordString)
        }
    } 

  const sendGoogle = () => {
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
  }

    return (
      <div>
           <ReactMic
                record={isRecording}
                className="sound-wave"
                onStop={onStop}
                onData={onData}
                strokeColor="#000000"
                backgroundColor="#FF4081" />
        <button onClick={startRecording} type="button">Start</button>
        <button onClick={stopRecording} type="button">Stop</button>
        <button onClick={playRecording} type="button">Play</button>
        <button onClick={blobToBase64} type="button">Convert</button>
        <button onClick={sendGoogle} type="button">Transcribe</button>
      </div>
    );
}    

export default AudioRecorder;
