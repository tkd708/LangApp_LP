import React, { useState, useEffect } from 'react';
import { ReactMic } from 'react-mic';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioAccess, setAudioAccess] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [audioContext, setAudioContext] = useState(null);

   const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    setAudioAccess(audio);
  }

  const stopMicrophone = () => {
    audioAccess.getTracks().forEach(track => track.stop());
    setAudioAccess(null);
  }

  const toggleMicrophone = () => {
    audioAccess ? stopMicrophone() : getMicrophone()
  }

  const storeAudio = () => {
   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
   setAudioContext(audioContext)

   const analyser = audioContext.createAnalyser();
   const dataArray = new Uint8Array(analyser.frequencyBinCount);
   //const source = audioContext.createMediaStreamSource(audioAccess);
   //source.connect(analyser);
  // analyser.getByteTimeDomainData(dataArray);
   setAudioData(dataArray);
   console.log(dataArray);
  }

    const resetAudio = () => {

    }

    const loadSound = (url) => {
    return new Promise((resolve) => {
        // リクエストの生成
        const request = new XMLHttpRequest()
        request.open('GET', url, true)
        request.responseType = 'arraybuffer'

        // 読み込み完了時に呼ばれる
        request.onload = () => {
            audioContext.decodeAudioData(request.response, (buffer) => {
                resolve(buffer)
            })
        }
        request.send()
    })
}

// サウンドの再生
const playSound = (buffer) => {
    // Source
    const source = audioContext.createBufferSource()
    source.buffer = buffer

    // Destination
    source.connect(audioContext.destination)

    // Sourceの再生
    source.start(0)
}

const playAudio = async () => {
    const buffer = await loadSound('sample.mp3')
    playSound(buffer)
}

  const tentative = () => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
        var recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        //音を拾い続けるための配列。chunkは塊という意味
        var chunks = [];

        //集音のイベントを登録する
        recorder.addEventListener('dataavailable', function(ele) {
            if (ele.data.size > 0) {
                chunks.push(ele.data);
            }
        });

        // recorder.stopが実行された時のイベント
        recorder.addEventListener('stop', function() {
            var dl = document.querySelector("#dl");
            //集音したものから音声データを作成する
            dl.href = URL.createObjectURL(new Blob(chunks));
            dl.download = 'sample.wav';
        });

        recorder.start();

        //10秒後に集音を終了する。
        setTimeout(function() {
            alert("stop");
            recorder.stop();
        }, 10000);

    })
    .catch((e) => {
        console.log(e)
    })
}
        

  const startRecording = () => {
      setIsRecording(true);
  }
  const stopRecording = () => {
      setIsRecording(false);
  }

  const onData = (recordedBlob) => {
    console.log('chunk of real-time data is: ', recordedBlob);
  }

  const onStop = (recordedBlob) => {
    console.log('recordedBlob is: ', recordedBlob);
    //const reader = new FileReader();
    //const blob64 = reader.readAsDataURL(recordedBlob)
    //console.log(blob64.slice(0,100))
  }

    //return (
    //  <div>
    //    <ReactMic
    //      record={isRecording}
    //      className="sound-wave"
    //      onStop={onStop()}
    //      onData={onData()}
    //      strokeColor="#000000"
    //      backgroundColor="#FF4081" />
    //    <button onClick={startRecording()} type="button">Start</button>
    //    <button onClick={stopRecording()} type="button">Stop</button>
    //  </div>
    //);

    return (
      <div className="App">
          <div className="controls">
            <button onClick={toggleMicrophone}>
              {audioAccess ? 'Stop microphone' : 'Get microphone input'}
            </button>
            <button onClick={storeAudio}>store audio</button>
            <button onClick={resetAudio}>reset audio</button>
            <button onClick={playAudio}>play audio</button>
          </div>
      </div>
    );
}

export default AudioRecorder;
