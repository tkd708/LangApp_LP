import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

//import {ReactMic} from 'react-mic'; // only local
const {ReactMic} = typeof window !== `undefined` ? require("react-mic") : '' //"window" is not available during server side rendering.

import TranscribeLangs from './transcribeLangs.json';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isLongRecording, setIsLongRecording] = useState(false);
    const [blobRecorded, setBlobRecorded] = useState(null);
    const [recordString, setRecordString] = useState(null);
    const [transcriptChunk, setTranscriptChunk] = useState('');
    const [transcriptAppended, setTranscriptAppended] = useState('');
    const [transcript, setTranscript] = useState('');
    const [transcribeLang, setTranscribeLang] = useState('en-US');

  const startRecording = () => {
    setIsRecording(true);
    console.log('recoding started')
  }
  const stopRecording = () => {
    setIsRecording(false);
    console.log('recoding ended')
  }

  const onData = (recordedBlob) => {
    //console.log('chunk of real-time data is: ', recordedBlob);
  }

  const onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);
    setBlobRecorded(recordedBlob);
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
          console.log('sent audio: '+ recordString.slice(-100))  
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
                        lang: transcribeLang,
                     },
                })
                .then((res) => {
                    //console.log(res)
                    //console.log(res.data.transcript)
                    setTranscriptChunk(res.data.transcript);
                })
                .catch((err) => {
                    console.log('transcribe err :', err);
                });
  }

  const appendTranscript = () => {
      const appendedTranscript = [transcriptAppended, transcriptChunk]
      console.log(appendedTranscript)
      setTranscriptAppended(appendedTranscript.join(' '));
  }

    useEffect(() => {
        console.log('blob updated');
        (blobRecorded !== null) && blobToBase64();
        // Repeat recording during the long recording
        (isLongRecording) && repeatRecoridng();
    }, [blobRecorded])

    useEffect(() => {
        console.log('audio string updated');
        (recordString !== null) && sendGoogle();
    }, [recordString])

    useEffect(() => {
        console.log('transcript chunk updated');
        appendTranscript();
        // Wait for ther last chunk of transcription and then finalise the transcript
        (!isLongRecording) && (setTranscript(transcriptAppended), setTranscriptAppended(''))
    }, [transcriptChunk])

  const repeatRecoridng = () => {
    startRecording();
    console.log('repeated recording resumed')  
    setTimeout(() => {stopRecording()}, 5000);
    console.log('repeated recording cut') 
  }
  const startLongRecording = () => {
    setIsLongRecording(true);
    repeatRecoridng();
    console.log('long recoding started');
  }
  const stopLongRecording = () => {
    setIsLongRecording(false);
    stopRecording();
    console.log('long recoding ended')
  }


    return (
      <div>
        <InputLabel id="demo-simple-select-label">Language</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          style={{color:'white'}}
          value={transcribeLang}
          onChange={(event) => setTranscribeLang(event.target.value)}
        >
                        {Object.keys(TranscribeLangs).map((key, index) => (
                            <MenuItem
                                value={key}
                                key={index}
                            >{TranscribeLangs[key]}</MenuItem>
                        ))}
        </Select>
            { typeof window !== `undefined` &&  // need inline if for the same reason as import
           <ReactMic
                record={isRecording}
                className="sound-wave"
                onStop={onStop}
                onData={onData}
                strokeColor="white"
                backgroundColor="transparent" />
                }
        <button onClick={isLongRecording ? stopLongRecording : startLongRecording} type="button">{isLongRecording ? 'End conversation' : 'Start conversation!'}</button>
        <p>Transcript below</p>
            <p>{transcript}</p>
      </div>

    );
}    

export default AudioRecorder;
