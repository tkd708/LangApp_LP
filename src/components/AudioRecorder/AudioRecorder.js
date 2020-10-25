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
    const [blobRecorded, setBlobRecorded] = useState(null);
    const [recordString, setRecordString] = useState(null);
    const [transcriptChunk, setTranscriptChunk] = useState('');
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
      const appendedTranscript = [transcript, transcriptChunk]
      console.log(appendedTranscript)
        setTranscript(appendedTranscript.join(' '));
        setTranscriptChunk('')
  }

    React.useEffect(() => {
    (async () => {
        await blobToBase64;
        await sendGoogle;
        await appendTranscript
    })()
  }, [blobRecorded])

  const transcribeLongRecoridng = async () => {
    startRecording()
    console.log('started rec')  
    await setTimeout(stopRecording, 10000);
    console.log('ended rec')  
      await blobToBase64()
    console.log('converted blob')  
      await sendGoogle()
    console.log('sent audio')  
      await appendTranscript()
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
        <button onClick={isRecording ? stopRecording : startRecording} type="button">{isRecording ? 'Stop Recording' : 'Start Recording'}</button>
        <button onClick={playRecording} type="button">Play</button>
        <button onClick={blobToBase64} type="button">Convert</button>
        <button onClick={sendGoogle} type="button">Transcribe</button>
        <button onClick={appendTranscript} type="button">Append Transcript</button>
        <button onClick={transcribeLongRecoridng} type="button">Transcribe longer recording</button>
        <p>TranscriptChunk below</p>
        <p>{transcriptChunk}</p>
        <p>TranscriptAppended below</p>
            <p>{transcript}</p>
      </div>

    );
}    

export default AudioRecorder;
