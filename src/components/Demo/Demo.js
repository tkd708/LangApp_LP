import React from "react"
import styled from "styled-components"
import Button from '@material-ui/core/Button';

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

        <p style={{marginTop: '50px'}}> {browserLang=='ja'
        ? `会話を分析してみましょう!` 
        : "Let's try analysing your conversation!"}
        </p>
        <p style={{marginTop: '5px'}}> {browserLang=='ja'
        ? `Startを押すと会話の録音が開始され、Endを押すと分析結果が表示されます。` 
        : "Record conversation with 'Start' and show the results with 'End'"}
        </p>

        <AudioRecorder />

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
