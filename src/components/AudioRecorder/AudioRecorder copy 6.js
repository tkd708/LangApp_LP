import React, { useState, useEffect, Component } from 'react';
import RecorderJS from 'recorder-js';

import { getAudioStream, exportBuffer } from './AudioRecorderUtil';

// https://medium.com/@mattywilliams/recording-audio-with-react-for-amazon-lex-646bdc1b9f75

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [stream, setStream] = useState(null);
    const [blobRecorded, setBlobRecorded] = useState(null);

    React.useEffect(async () => {
        try {
        const stream = await getAudioStream();
        setStream(stream);
        } catch (error) {
        // Users browser doesn't support audio...Add your handler here.
        console.log(error);
        }
    }, []);

    const startRecord = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const recorder = new RecorderJS(audioContext);
        recorder.init(stream);
        setRecorder(recorder)
        setIsRecording(true)
        recorder.start();
    }

    const stopRecord = async () => {
        const { buffer } = await recorder.stop()
        const audio = exportBuffer(buffer[0]);
        // Process the audio here.
        console.log(audio);
        //const base64String = buffer.toString('base64');
        //console.log(base64String);
        setIsRecording(false)
    }

    if (!stream) {
      return null;
    }

    return (
      <button
        onClick={() => {
          isRecording ? stopRecord() : startRecord();
        }}
        >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    );
}


export default AudioRecorder;
