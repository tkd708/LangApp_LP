import React, { useState, useEffect, useRef } from 'react';
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


import TranscribeLangs from './transcribeLangs.json';

const AudioRecorder = () => {
    const [ streamMic, setStreamMic ] = useState( null ); //
    const [ streamScreen, setStreamScreen ] = useState( null ); //
    const [ streamCombined, setStreamCombined ] = useState( null ); //

    const [ mediaRecorderMic, setMediaRecorderMic ] = useState( null ); //
    const [ blobArrayMic, setBlobArrayMic ] = useState( [] );
    const blobArrayMicRef = useRef( blobArrayMic )
    useEffect( () => {
        blobArrayMicRef.current = blobArrayMic
    }, [ blobArrayMic ] )

    const [ mediaRecorderScreen, setMediaRecorderScreen ] = useState( null ); //
    const [ blobArrayScreen, setBlobArrayScreen ] = useState( [] );
    const blobArrayScreenRef = useRef( blobArrayScreen )
    useEffect( () => {
        blobArrayScreenRef.current = blobArrayScreen
    }, [ blobArrayScreen ] )

    const [ mediaRecorderCombined, setMediaRecorderCombined ] = useState( null ); //
    const [ blobArrayCombined, setBlobArrayCombined ] = useState( [] );
    const blobArrayCombinedRef = useRef( blobArrayCombined )
    useEffect( () => {
        blobArrayCombinedRef.current = blobArrayCombined
    }, [ blobArrayCombined ] )

    const [ isRecording, setIsRecording ] = useState( false );
    const isRecordingRef = useRef( isRecording )
    useEffect( () => {
        isRecordingRef.current = isRecording
    }, [ isRecording ] )

    const [ startTime, setStartTime ] = useState( '' ); // milliseconds
    const [ endTime, setEndTime ] = useState( '' ); // milliseconds

    const [ blobAppendedCombined, setBlobAppendedCombined ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( null );

    const [ transcriptChunkYou, setTranscriptChunkYou ] = useState( null );
    const [ transcriptChunkPartner, setTranscriptChunkPartner ] = useState( null );
    const [ transcriptAppendedYou, setTranscriptAppendedYou ] = useState( null );
    const [ transcriptAppendedPartner, setTranscriptAppendedPartner ] = useState( null );
    const [ transcript, setTranscript ] = useState( null );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );

    const myURL = typeof window !== `undefined` ? window.URL || window.webkitURL : ''

    const initialiseMediaStreams = () => {
        navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            //console.log( 'mic stream', stream );
            setStreamMic( stream )
            constructMediaRecorderMic( stream )
        } ).catch( error => {
            console.log( error );
        } )

        navigator.mediaDevices.getDisplayMedia( {
            audio: true,
            video: true
        } ).then( stream => {
            //console.log( 'screen stream', stream );
            setStreamScreen( stream )
            constructMediaRecorderScreen( stream )
        } ).catch( error => {
            console.log( error );
        } )
    }

    ///// Make a combined stream //////
    useEffect( () => {
        if( !streamMic || !streamScreen ) return
        const audioContext = new AudioContext();
        const source1 = audioContext.createMediaStreamSource( streamMic );
        const source2 = audioContext.createMediaStreamSource( streamScreen );
        const destination = audioContext.createMediaStreamDestination();
        //connect sources to destination... you can add gain nodes if you want 
        source1.connect( destination );
        source2.connect( destination );

        // console.log( 'combined stream', destination.stream );
        setStreamCombined( destination.stream )
        constructMediaRecorderCombined( destination.stream )

    }, [ streamMic, streamScreen ] )

    //////////////// Construct a media recorder for mic
    const constructMediaRecorderMic = ( streamMic ) => {

        const recorder = new MediaRecorder( streamMic, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 41 * 1000
        } );
        recorder.addEventListener( 'start', () => {
            setBlobArrayMic( [] );
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                setBlobArrayMic( [ ...blobArrayMicRef.current, e.data ] )

            }
        } );
        recorder.addEventListener( 'stop', () => {
            const blob = new Blob( blobArrayMicRef.current, { 'type': 'audio/webm;codecs=opus' } );
            const destination = 'you'
            blobToBase64( blob, destination )
        } );
        setMediaRecorderMic( recorder );
    }

    ///////////////// Construct a media recorder for screen
    const constructMediaRecorderScreen = ( streamScreen ) => {

        const recorder = new MediaRecorder( streamScreen, {
            mimeType: 'video/webm;codecs=vp8',
            audioBitsPerSecond: 41 * 1000
        } );
        recorder.addEventListener( 'start', () => {
            setBlobArrayScreen( [] )
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                setBlobArrayScreen( [ ...blobArrayScreenRef.current, e.data ] )
            }
        } );
        recorder.addEventListener( 'stop', () => {
            const blob = new Blob( blobArrayScreenRef.current, { 'type': 'audio/webm;codecs=opus' } );
            const destination = 'partner'
            blobToBase64( blob, destination )

        } );
        setMediaRecorderScreen( recorder );
    }

    ///////////////// Construct a media recorder combined ///////////////////////
    const constructMediaRecorderCombined = ( streamCombined ) => {

        const recorderCombined = new MediaRecorder( streamCombined, { mimeType: 'video/webm; codecs=vp9' } )

        recorderCombined.addEventListener( 'start', () => {
            setBlobArrayCombined( [] )
        } );

        recorderCombined.addEventListener( 'dataavailable', ( e ) => {
            if( e.data && e.data.size > 0 ) {
                setBlobArrayCombined( [ ...blobArrayCombinedRef.current, e.data ] )
            }
        } );

        recorderCombined.addEventListener( 'stop', () => {
            // console.log( 'blob chunk array from both', blobChunkArray )
            const blob = new Blob( blobArrayCombinedRef.current, { 'type': 'audio/wav; codecs=opus' } );
            setBlobAppendedCombined( blob )
        } );

        setMediaRecorderCombined( recorderCombined );
        // console.log( 'recorder combined constructed', recorderCombined );
    }


    /////////////// Audio recorder operation ////////////////
    const startRecording = () => {
        /// delete previous records if exist
        setTranscriptAppendedYou( null )
        setTranscriptAppendedPartner( null )
        setDownloadUrl( null )

        setIsRecording( true );
        startMediaRecorders();
        mediaRecorderCombined.start( 1000 )

        const startTime = new Date();
        setStartTime( startTime.getTime() );
        // console.log( 'recoding started' );
    }

    const startMediaRecorders = () => {
        console.log( 'recorders on' )
        mediaRecorderMic.start( 1000 );
        mediaRecorderScreen.start( 1000 );
        setTimeout( () => { repeatMediaRecorders(); }, 10000 );
    }

    const repeatMediaRecorders = () => {
        if( !isRecordingRef.current ) return
        console.log( 'recorders off' )
        mediaRecorderMic.stop();
        mediaRecorderScreen.stop();
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        mediaRecorderCombined.stop()
        mediaRecorderMic.stop()
        mediaRecorderScreen.stop()

        const endTime = new Date();
        setEndTime( endTime.getTime() );

        // console.log( 'recoding ended' );
    }

    const playMediaRecorderCombined = () => {
        if( !blobAppendedCombined ) return
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        const tmp = new Audio( blobURL );
        tmp.play()
    }

    useEffect( () => {
        if( !blobAppendedCombined ) return
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        setDownloadUrl( blobURL );
    }, [ blobAppendedCombined ] )



    ///////////////// Functions to convert and send blobs to transcribe //////////////////
    const blobToBase64 = ( blob, destination ) => {
        const reader = new FileReader();
        reader.readAsDataURL( blob );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent audio for ', destination, 'as string of', recordString.slice( -100 ) )
            sendGoogle( recordString, destination )
        }
    }


    ////////////////////////// Send audio strings to Google for transcription //////////////////////
    const sendGoogle = ( recordString, destination ) => {
        const url = 'https://langapp.netlify.app/.netlify/functions/speech-to-text-expo';

        axios
            .request( {
                url,
                method: 'POST',
                data: {
                    audio: recordString,
                    lang: transcribeLang,
                },
            } )
            .then( ( res ) => {
                //console.log(res)
                //console.log(res.data.transcript)
                ( destination === 'you' ) ? setTranscriptChunkYou( res.data.transcript ) : setTranscriptChunkPartner( res.data.transcript );
            } )
            .catch( ( err ) => {
                console.log( 'transcribe err :', err );
            } );
    }

    ////////////////////// Handle transcript chunks //////////////////////////
    useEffect( () => {
        ( transcriptChunkYou !== null ) && setTranscriptAppendedYou( [ transcriptAppendedYou, transcriptChunkYou ].join( ' ' ) );
    }, [ transcriptChunkYou ] )

    useEffect( () => {
        ( transcriptChunkPartner !== null ) && setTranscriptAppendedPartner( [ transcriptAppendedPartner, transcriptChunkPartner ].join( ' ' ) );
    }, [ transcriptChunkPartner ] )

    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript
        ( !isRecording && transcriptAppendedYou !== null ) && setTranscript( transcriptAppendedYou );
        //console.log('last chunk of transcript appended');
    }, [ transcriptAppendedYou ] )



    //////// After transcribing... vocab analysis
    const vocabAnalysis = () => {
        const transcriptArray = transcript.split( " " );
        setVocab1( transcriptArray.length );
        const conversationLength = ( endTime - startTime ) / 1000 / 60;
        setVocab2( ( transcriptArray.length / conversationLength ).toFixed( 1 ) );
        const uniq = [ ...new Set( transcriptArray ) ];
        setVocab3( uniq.length );
        //console.log( uniq )
    }

    useEffect( () => {
        ( transcript !== null ) && vocabAnalysis();
    }, [ transcript ] )



    /////////////// UI //////////////////////
    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }
        >
            <div style={ { display: 'none' } }>
                <Select
                    id="demo-simple-select"
                    style={ { color: 'white' } }
                    value={ transcribeLang }
                    onChange={ ( event ) => setTranscribeLang( event.target.value ) }
                >
                    { Object.keys( TranscribeLangs ).map( ( key, index ) => (
                        <MenuItem
                            value={ key }
                            key={ index }
                        >{ TranscribeLangs[ key ] }</MenuItem>
                    ) ) }
                </Select>
            </div>

            <h2>デモ</h2>
            <p>実際に英会話レッスンを録音してみましょう！(マイク付きイヤフォン推奨)</p>
            <p>なお、スピーカーからの音声記録のため、画面と音声の共有を許可してください。</p>

            <button style={ { margin: '10px' } } onClick={ () => initialiseMediaStreams() }> 共有を許可 </button>

            <p>マイクからの音声は「あなた」に、スピーカーからの音声は「相手」に記録されます！</p>

            <Button
                //style={{marginTop: '10px'}}
                //variant="contained"
                //color="primary"
                cta={ isRecording ? 'End' : 'Start!' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>


            <div style={ { display: 'flex', flexDirection: 'row' } }>
                <Card style={ { width: '40vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>相手</Typography>
                        <Typography>{ transcriptAppendedPartner }</Typography>
                    </CardContent>
                </Card>
                <Card style={ { width: '40vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>あなた</Typography>
                        <Typography>{ transcriptAppendedYou }</Typography>
                    </CardContent>
                </Card>
            </div>

            { ( transcript !== null ) &&
                <Card style={ { width: '80vw', marginTop: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>今回の会話の分析結果はこちら！</Typography>
                        {/*<Typography>{ 'Transcript: ' + transcript }</Typography> 
                        <Typography>{ `今回の会話での単語数: ${ vocab1 }` }</Typography> */ }
                        <Typography>{ `今回の会話での流暢さ(word per minute): ${ vocab2 } ` }</Typography>
                        <Typography>{ `使用した単語数: ${ vocab3 } ` }</Typography>
                    </CardContent>
                </Card>
            }
            { ( !isRecording && blobAppendedCombined !== null ) &&
                // ( transcript !== null ) &&
                <button style={ { margin: '20px' } } onClick={ playMediaRecorderCombined }> PLAY </button>
            }
            <a href={ downloadUrl } download id="download">{ ( downloadUrl !== null ) ? 'Download' : '' }</a>

            <h2 style={ { marginTop: '50px' } }>{ "英会話分析登録フォーム" } </h2>
            <ContactWrapper id="contact">
                <div className="content-container"
                    style={ { width: '80vw' } }>

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
                                <span className="content-name">名前</span>
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
                                <span className="content-name">メールアドレス</span>
                            </label>
                        </div>

                        <div className="input-area">
                            <input
                                type="file"
                                name="audio"
                                aria-label="audio"
                                //required
                                autoComplete="off"
                            />
                            <label className="label-name" for="audio">
                                <span className="content-name">音声ファイル</span>
                            </label>
                        </div>

                        <div className="input-area"
                            style={ {
                                display: 'none'
                            } }>
                            <input
                                type="text"
                                name="Transcript_you"
                                aria-label="Transcript_you"
                                value={ transcriptAppendedYou }
                                autoComplete="off"
                            />
                            <label className="label-name" for="Transcript_you">
                                <span className="content-name">Transcript_you</span>
                            </label>
                        </div>

                        <div className="input-area"
                            style={ {
                                display: 'none'
                            } }>
                            <input
                                type="text"
                                name="Transcript_partner"
                                aria-label="Transcript_partner"
                                value={ transcriptAppendedPartner }
                                autoComplete="off"
                            />
                            <label className="label-name" for="Transcript_partner">
                                <span className="content-name">Transcript_partner</span>
                            </label>
                        </div>

                        <div
                            className="input-area button-area"
                            style={ { marginBottom: '30px' } }
                        >
                            <Button
                                label="Send Contact Form"
                                cta={ "送信" }
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
