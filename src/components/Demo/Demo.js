import React from "react"
import styled from "styled-components"

import VideoChat from '../VideoChat/VideoChat.js';
import AudioRecorder from '../AudioRecorder/AudioRecorder.js';
//import TextMining from '../components/TextMining/kuromoji.js';

const Demo = () => {
  return (
      <DemoWrapper>
        <div id="demo"
        className="content-container"
        style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
        <h2>TRY A DEMO</h2>

        <p style={{marginTop: '50px'}}> STEP 1 Enjoy talking with your language buddy! </p>
        <VideoChat />

        <p style={{marginTop: '50px'}}> STEP 2 Transcribe the target language (select below) </p>
        <AudioRecorder />

        <p style={{marginTop: '30px'}}> 
        STEP 3 Your vocab and expressions will be analised to visualise your speaking skills!
         </p>

        <p style={{marginTop: '30px'}}> 
        ...this feature is currently under development, please let us hear your voice!
        </p>

         </div>
      </DemoWrapper>
  )
}

const DemoWrapper = styled.section`
  text-align: center;
  padding: 100px 30px;

  .content-container {
    max-width: 500px;

    @media (min-width: 768px) {
      max-width: 650px;
    }

    @media (min-width: 1200px) {
      max-width: 900px;
    }
  }

  h2 {
    background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    margin-bottom: 50px;
  }
`

export default Demo
