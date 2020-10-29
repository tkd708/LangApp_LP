import React from "react"
import styled from "styled-components"

import VideoChat from '../VideoChat/VideoChat.js';
import AudioRecorder from '../AudioRecorder/AudioRecorder.js';
//import TextMining from '../components/TextMining/kuromoji.js';

const Demo = () => {
        const browserLang =  (typeof window !== `undefined`)
   ? (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage
    : '';

  return (
      <DemoWrapper>
        <div id="demo"
        className="content-container"
        style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
        <h2>DEMO</h2>

        <p style={{marginTop: '50px'}}> {browserLang=='ja'? 
        "STEP 1 友人や先生とビデオチャットで会話してみましょう！"
        : "STEP 1 Enjoy talking with your language buddy on the video chat!"}
        </p>
        <VideoChat />

        <p style={{marginTop: '50px'}}> {browserLang=='ja'
        ? "STEP 2 言語を選んで、会話内容を記録しましょう" 
        : "STEP 2 Transcribe the conversation with the target language (select below)"}
        </p>
        <AudioRecorder />


        <p style={{marginTop: '50px'}}> {browserLang=='ja'
        ? "STEP 3 （開発中）フィードバックのまとめや前回からの改善点などが以下に示されます！" 
        : "STEP 3 (Under development) Summary of feedback and your improvement will be shown below!"}
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

        font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.5rem;
        }

        @media (min-width: 1200px) {
          font-size: 4.5rem;
        }

  }

  p {
    margin-bottom: 50px;

             font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }

  }
`

export default Demo
