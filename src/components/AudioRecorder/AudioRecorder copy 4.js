import React, { useState, useEffect } from 'react';
import {Recorder} from 'react-voice-recorder'
import axios from 'axios';

const reader = new FileReader();
const xhr = new XMLHttpRequest();

class AudioRecorder extends React.Component {
  constructor(props) {
    super(props);
  this.state = {
    audioDetails: {
        url: null,
        blob: null,
        chunks: null,
        duration: {
          h: 0,
          m: 0,
          s: 0
        }
      }
    }
}

 
handleAudioStop(data){
    console.log(data);
    console.log(data.duration);
    this.setState({ audioDetails: data });
    reader.readAsDataURL(data.blob)
    reader.onload = function(){
            //const recordString = reader.result;
            //const recordString = reader.result.replace('data:audio/webm;base64,','').replace('==','');
            const recordString = reader.result.replace('data:audio/*;base64,','');
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
}

handleAudioUpload(file) {
    console.log(file);
}
handleRest() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0
      }
    };
    this.setState({ audioDetails: reset });
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
<Recorder
    record={true}
    title={"New recording"}
    audioURL={this.state.audioDetails.url}
    showUIAudio
    handleAudioStop={data => this.handleAudioStop(data)}
    handleAudioUpload={data => this.handleAudioUpload(data)}
    handleRest={() => this.handleRest()} 
/>
      </div>
    );
  }
}

export default AudioRecorder;
