import React from "react"
import styled from "styled-components"
//import Button from '@material-ui/core/Button';
import Button from "../Button/button"

import AudioRecorder from '../AudioRecorder/AudioRecorder.js';

const browserLang = 'ja' // tentatively all in Japanese
//(typeof window !== `undefined`)
//? (window.navigator.languages && window.navigator.languages[0]) ||
//         window.navigator.language ||
//         window.navigator.userLanguage ||
//         window.navigator.browserLanguage
// : ''; 

const Demo = () => {

    return (
        <DemoWrapper>
            <div id="demo"
                className="content-container"
                style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }
            >
                <h2>デモ</h2>
                <p>実際に英会話レッスンを録音してみましょう！</p>
                <p>マイク付きイヤフォンの使用を推奨しております。なお、スピーカーからの音声記録のため、画面と音声の共有を許可してください。</p>
                <p>マイクからの音声は「あなた」に、スピーカーからの音声は「相手」に記録されます！</p>
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
    margin-bottom: 30px;

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
