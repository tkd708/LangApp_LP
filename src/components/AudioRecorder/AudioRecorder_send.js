import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
//import Button from '@material-ui/core/Button';
import Button from "../Button/button"

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

//import { ReactMic } from 'react-mic'; // only local
const { ReactMic } = typeof window !== `undefined` ? require( "react-mic" ) : '' //"window" is not available during server side rendering.
//const { ReactMic } = ''

const browserLang = 'ja' // tentatively all in Japanese
//(typeof window !== `undefined`)
//? (window.navigator.languages && window.navigator.languages[0]) ||
//         window.navigator.language ||
//         window.navigator.userLanguage ||
//         window.navigator.browserLanguage
// : ''; 


const AudioRecorder = () => {
    const [ isRecording, setIsRecording ] = useState( false );
    const [ blobRecorded, setBlobRecorded ] = useState( null );
    const [ recordString, setRecordString ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( '' );

    const startRecording = () => {
        setIsRecording( true );
        console.log( 'recoding started' )
    }
    const stopRecording = () => {
        setIsRecording( false );
        console.log( 'recoding ended' )
    }

    const onData = ( recordedBlob ) => {
        //console.log('chunk of real-time data is: ', recordedBlob);
    }

    const onStop = ( recordedBlob ) => {
        setBlobRecorded( recordedBlob );
        console.log( 'recordedBlob is: ', recordedBlob );
    }

    const playRecording = () => {
        const tmp = new Audio( blobRecorded.blobURL ); //passing your state (hook)
        tmp.play() //simple play of an audio element. 
    }


    const blobToBase64 = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecorded.blob );
        reader.onloadend = function () {
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            setRecordString( recordString )
        }
        console.log( recordString )
    }



    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }
        >
            <div style={ { display: 'none' } }>
                { typeof window !== `undefined` &&  // need inline if for the same reason as import
                    <ReactMic
                        record={ isRecording }
                        className="sound-wave"
                        onStop={ onStop }
                        onData={ onData }
                        strokeColor="white"
                        backgroundColor="transparent" />
                }
            </div>

            <Button
                style={ { marginTop: '10px' } }
                //variant="contained"
                //color="primary"
                cta={ isRecording ? 'End' : 'Start!' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>

            <Button
                style={ { marginTop: '10px' } }
                cta={ 'Play!' } // from the template
                onClick={ () => { playRecording() } }
            >
            </Button>

            <Button
                style={ { marginTop: '10px' } }
                cta={ 'Convert recording' } // from the template
                onClick={ () => { blobToBase64() } }
            >
            </Button>

            <ContactWrapper id="contact">
                <div className="content-container">
                    <h2>{ browserLang == 'ja'
                        ? "先行登録"
                        : "CONTACT US" }
                    </h2>
                    <p> { browserLang == 'ja'
                        ? "LangAppは期間限定で無料テストユーザーを募集中です。"
                        : "LangApp is currently under development and needs your voice..." }
                    </p>
                    <p> { browserLang == 'ja'
                        ? "下記フォームよりメールアドレスをご登録ください。"
                        : "We'd love to in touch with you!" }
                    </p>

                    <form
                        name="contact"
                        method="POST"
                        data-netlify="true"
                        data-netlify-honeypot="bot-field"
                    >
                        <input type="hidden" name="form-name" value="contact" />
                        <div className="input-area">
                            <input
                                type="text"
                                name="name"
                                aria-label="Name"
                                required
                                autoComplete="off"
                            />
                            <label className="label-name" for="name">
                                <span className="content-name">Name</span>
                            </label>
                        </div>

                        <div className="input-area">
                            <input
                                type="email"
                                name="email"
                                aria-label="Email"
                                required
                                autoComplete="off"
                            />
                            <label className="label-name" for="email">
                                <span className="content-name">Email</span>
                            </label>
                        </div>

                        <div className="input-area"
                            style={ {
                                //display: 'none'
                            } }>
                            <input
                                type="text"
                                name="audio_base64"
                                aria-label="audio_base64"
                                value={ recordString }
                                autoComplete="off"
                            />
                            <label className="label-name" for="audio">
                                <span className="content-name">Audio_base64</span>
                            </label>
                        </div>

                        <div
                            className="input-area button-area"
                            style={ { marginBottom: '50px' } }
                        >
                            <Button
                                label="Send Contact Form"
                                cta={ browserLang == 'ja' ? "登録" : "SEND！" }
                                type="submit"
                            />
                        </div>
                    </form>
                </div>
            </ContactWrapper>

        </div>

    );
}

const ContactWrapper = styled.section`
  padding: 50px 30px;
  background-color: #fff;

  .content-container {
    width: 100%;
    margin: 0 auto;

    h2 {
      text-align: left;
      background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      @media (min-width: 768px) {
        text-align: center;
      }

          font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.0rem;
        }

        @media (min-width: 1200px) {
          font-size: 3.5rem;
        }

    }
    p {
      margin-bottom: 2rem;
      color: black;

      @media (min-width: 768px) {
        text-align: center;
      }

         font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }
 
    }

    form {
      position: relative;
      overflow: hidden;

      .input-area {
        margin-bottom: 40px;
        position: relative;

        &.button-area {
          text-align: center;
          margin-bottom: 0;
        }
      }

      input,
      textarea {
        height: 100%;
        font-size: 1rem;
        letter-spacing: 0.25rem;
        padding: 20px;
        display: block;
        width: 100% !important;
        border: none;
        background-color: #0b132e;
        color: #fff;
        text-transform: uppercase;
        position: relative;
        box-sizing: border-box;
        outline: none;

        &:focus,
        &:valid {
          + .label-name {
            .content-name {
              transform: translateY(-25%);
              font-size: 0.7rem;
              opacity: 0.2;
            }
            &::after {
              transform: translateX(0%);
            }
          }
        }
      }

      label {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        pointer-events: none;

        &::after {
          content: "";
          position: absolute;
          left: 0px;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, #f441a5, #03a9f4);
          width: 100%;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
      }

      .content-name {
        position: absolute;
        top: 10px;
        left: 20px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.25rem;
        font-size: 0.8rem;
      }
    }
  }
`

export default AudioRecorder;
