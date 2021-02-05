import React, { useState, useEffect, useRef } from 'react';


import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';
import Button from "../Button/button";

import instructionImg from "../../images/line-bot-qr.png";
import lineButtonBase from "../../images/btn_login_base.png";
import lineButtonHover from "../../images/btn_login_hover.png";
import lineButtonPress from "../../images/btn_login_press.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLine } from '@fortawesome/free-brands-svg-icons'

import MicNoneTwoToneIcon from '@material-ui/icons/MicNoneTwoTone';
import StopTwoToneIcon from '@material-ui/icons/StopTwoTone';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import TranscribeLangs from './transcribeLangs.json';

import { v4 as uuidv4 } from 'uuid';

//const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.

const AudioRecorder = () => {

    // tentatively using again
    const [ appID, setAppID ] = useState( '' );
    const appIDRef = useRef( appID )
    useEffect( () => {
        appIDRef.current = appID
    }, [ appID ] )

    // line login
    const [ lineLoginStatus, setLineLoginStatus ] = useState( false );
    const [ lineIdToken, setLineIdToken ] = useState( '' );
    const lineIdTokenRef = useRef( lineIdToken )
    useEffect( () => {
        lineIdTokenRef.current = lineIdToken
    }, [ lineIdToken ] )

    const [ recordingID, setRecordingID ] = useState( null );
    const recordingIDRef = useRef( recordingID )
    useEffect( () => {
        recordingIDRef.current = recordingID
    }, [ recordingID ] )

    const [ mediaRecorderMic, setMediaRecorderMic ] = useState( null ); //
    const [ isRecording, setIsRecording ] = useState( false );
    const isRecordingRef = useRef( isRecording )
    useEffect( () => {
        isRecordingRef.current = isRecording
    }, [ isRecording ] )

    const [ startTime, setStartTime ] = useState( '' ); // milliseconds
    const startTimeRef = useRef( startTime )
    useEffect( () => {
        startTimeRef.current = startTime
    }, [ startTime ] )
    const [ endTime, setEndTime ] = useState( '' ); // milliseconds

    const [ transcribeErrorArrray, setTranscribeErrorArray ] = useState( [] );
    const transcribeErrorArrrayRef = useRef( transcribeErrorArrray )
    useEffect( () => {
        transcribeErrorArrrayRef.current = transcribeErrorArrray
    }, [ transcribeErrorArrray ] )

    const [ transcriptArrayYou, setTranscriptArrayYou ] = useState( [] );
    const transcriptArrayYouRef = useRef( transcriptArrayYou )
    useEffect( () => {
        transcriptArrayYouRef.current = transcriptArrayYou
    }, [ transcriptArrayYou ] )

    const [ isAnalysis, setIsAnalysis ] = useState( false );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const myURL = typeof window !== `undefined` ? window.URL || window.webkitURL : ''
    const intervalSeconds = 30; // interval of the repeating audio recording


    //////////////// Construct a media recorder for mic to be repeated for transcription
    const constructMediaRecorderMic = async () => {
        const streamMic = await navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            //console.log( 'mic stream', stream );
            return ( stream )
        } ).catch( error => {
            console.log( error );
        } )

        const recorder = new MediaRecorder( streamMic, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 16 * 1000
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                const speaker = 'you'
                blobToBase64( e.data, speaker );
                // const base64Audio = await blobToBase64( blob );
                // sendGoogle(base64Audio)
            }
        } );
        setMediaRecorderMic( recorder );
        //console.log( 'mic recorder set...', recorder );
    }


    const getParam = ( name, url ) => {
        if( !url ) url = window.location.href;
        name = name.replace( /[\[\]]/g, "\\$&" );
        var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ),
            results = regex.exec( url );
        if( !results ) return null;
        if( !results[ 2 ] ) return '';
        return decodeURIComponent( results[ 2 ].replace( /\+/g, " " ).replace( " ", "" ) );
    }

    ///////////////////// initialise recorders and liff
    useEffect( () => {
        constructMediaRecorderMic()
        lineFetchAccessToken();
    }, [] )

    const redirectUrl = "https://langapp.netlify.app/"; //"https://f21709857d27.ngrok.io/ " //https://langapp.netlify.app/
    const lineLoginUrl = 'https://access.line.me/oauth2/v2.1/authorize' +
        `?response_type=code` +
        `&client_id=${ process.env.GATSBY_LINE_LIFF_Channel_ID }` +
        `&redirect_uri=${ redirectUrl }` +
        `&state=${ uuidv4() }` +
        `&bot_prompt=aggressive` +
        `&scope=profile%20openid` //&nonce=09876xyz

    const lineFetchAccessToken = async () => {
        const authorisationCode = getParam( 'code' );

        if( authorisationCode === null ) return
        var qs = require( 'qs' );
        const lineAccessTokenObject = await axios
            .request( {
                url: 'https://api.line.me/oauth2/v2.1/token',
                method: 'POST',
                header: qs.stringify( {
                    'Content-Type': 'application/x-www-form-urlencoded',
                } ),
                data: qs.stringify( {
                    grant_type: 'authorization_code',
                    code: authorisationCode,
                    redirect_uri: redirectUrl,
                    client_id: process.env.GATSBY_LINE_LIFF_Channel_ID,
                    client_secret: process.env.GATSBY_LINE_LIFF_Channel_Secret,
                } ),
            } )
            .then( res => {
                //alert( 'Success in fetching access token!' )
                console.log( 'Success in fetching access token...' + res.data )
                setLineLoginStatus( true )
                return ( res.data )
            } )
            .catch( err => {
                //alert( 'Error in fetching access token!' )
                console.log( 'Error in fetching access token...', err )
                return ( err )
            } );
        //alert( lineAccessTokenObject.id_token )
        setLineIdToken( lineAccessTokenObject.id_token )
    }


    /////////////// Audio recorder operation ////////////////
    const startRecording = () => {
        const uuid = uuidv4();
        setRecordingID( uuid )

        // delete previous records if exist
        setTranscriptArrayYou( [] )

        setIsRecording( true );
        startMediaRecorders();

        const startTime = new Date();
        setStartTime( startTime.getTime() );
        // console.log( 'recoding started' );
    }

    const startMediaRecorders = () => {
        console.log( 'recorders on' )
        mediaRecorderMic.start();
        setTimeout( () => { repeatMediaRecorders(); }, intervalSeconds * 1000 );
    }


    const repeatMediaRecorders = () => {
        //mediaRecorderMic.stop();
        if( !isRecordingRef.current ) return
        mediaRecorderMic.stop();
        console.log( 'recorders off' )
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        mediaRecorderMic.stop()

        const endTime = new Date();
        setEndTime( endTime.getTime() );
        const recordLengthSeconds = ( endTime.getTime() - startTime ) / 1000;
        console.log( 'recoding ended, it took', recordLengthSeconds, 'seconds' );

        setIsAnalysis( true );
        console.log( 'analysis started...' );
        setTimeout( () => { conversationAnalysis( transcriptArrayYouRef.current.join( ' ' ), recordLengthSeconds ); }, 30 * 1000 );
    }



    ///////////////// Functions to convert and send blobs to transcribe //////////////////
    const blobToBase64 = ( blob, speaker ) => {
        const newBlob = new Blob( [ blob ], { type: blob.type } )
        const reader = new FileReader();
        reader.readAsDataURL( newBlob );
        reader.onloadend = function () {
            console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            console.log( 'audio string length: ' + reader.result.toString().length )
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent audio from ', speaker, 'as string of', recordString.slice( -100 ) )
            sendGoogle( recordString, speaker )
        }
    }


    ////////////////////////// Send audio strings to Google for transcription //////////////////////
    const sendGoogle = async ( recordString, speaker ) => {
        const url = 'https://langapp.netlify.app/.netlify/functions/speech-to-text-expo';

        const transcript =
            await axios
                .request( {
                    url,
                    method: 'POST',
                    data: {
                        source: 'LP',
                        audio: recordString,
                        lang: transcribeLang,
                    },
                } )
                .then( ( res ) => {
                    //console.log(res)
                    //console.log( 'transcript :', res.data.transcript === '' );
                    //setTranscriptArrayYou( [ ...transcriptArrayYouRef.current, res.data.transcript ] )
                    const transcribedTime = new Date();
                    console.log( 'transcribed from', speaker, ( ( transcribedTime.getTime() - startTimeRef.current ) / 1000 ), 'seconds after starting ', res.data.transcript );
                    return ( res.data.transcript )
                } )
                .catch( ( err ) => {
                    const errorTime = new Date();
                    const errorStatus = {
                        errorMessage: err,
                        errorAt: speaker,
                        errorTimeFromStartTime: ( ( errorTime.getTime() - startTimeRef.current ) / 1000 ),
                    }
                    setTranscribeErrorArray( [ ...transcribeErrorArrrayRef.current, errorStatus ] );
                    console.log( errorStatus );
                    return ( 'TRANSCRIPTION ERROR' );
                } );
        setTranscriptArrayYou( [ ...transcriptArrayYouRef.current, transcript ] )

        /////////////////////// Transferring the transcript and the audio to LINE via AWS S3
        axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/LineBotTranscript',
                method: 'POST',
                data: {
                    appID: appIDRef.current, //tentative
                    source: 'LP',
                    lineIdToken: lineIdTokenRef.current,
                    recordingID: recordingIDRef.current,
                    audioString: recordString,
                    transcript: transcript,
                    audioInterval: intervalSeconds * 1000,
                },
            } )
            .then( ( res ) => { console.log( 'transcript to LINE bot success...', res ) } )
            .catch( ( err ) => { console.log( 'transcript to LINE bot error...', err ) } )
    }


    //////// After transcribing... vocab analysis
    const conversationAnalysis = async ( transcript, recordLengthSeconds ) => {

        if( transcript === null ) return

        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/LineBotReportAnalysis',
                method: 'POST',
                data: {
                    lineIdToken: lineIdTokenRef.current,
                    recordingID: recordingIDRef.current,
                    lengthMinute: ( recordLengthSeconds / 60 ).toFixed( 1 ),
                    transcript: transcript,
                    errors: transcribeErrorArrray,
                },
            } )
            .then( ( res ) => { console.log( 'conversation analysis success...', res ) } )
            .catch( ( err ) => { console.log( 'conversation analysis error...', err ) } )

        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/LineBotReportGraphs',
                method: 'POST',
                data: {
                    lineIdToken: lineIdTokenRef.current,
                    recordingID: recordingIDRef.current,
                },
            } )
            .then( ( res ) => { console.log( 'reporting graphs success...', res ) } )
            .catch( ( err ) => { console.log( 'reporting graphs error...', err ) } )

        setIsAnalysis( false );
        console.log( 'analysis finished...' );
    }



    /////////////// send the full audio file to AWS... not successful if the audio is too long, tentatively withdrawn
    const sendAWS = ( blob ) => {

        const reader = new FileReader();
        reader.readAsDataURL( blob );
        reader.onloadend = function () {
            console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const audioString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent audio to AWS as string of', audioString.slice( -100 ) )

            const url = 'https://langapp.netlify.app/.netlify/functions/aws-s3';

            axios
                .request( {
                    url,
                    method: 'POST',
                    data: {
                        lineIdToken: lineIdTokenRef.current,
                        recordingID: recordingID,
                        audio: audioString,
                    },
                } )
                .then( ( res ) => {
                    console.log( 'AWS by netlify functions success', res );
                } )
                .catch( ( err ) => {
                    console.log( 'AWS by netlify functions error', err );
                } );
        }
    }


    /////////////// UI //////////////////////
    return (

        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '90%' } }
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

            <h3>実際の英会話をこちらで録音し、記録・分析をしてみましょう！</h3>
            {
                !lineLoginStatus
                    ? <div>
                        <p>下記よりLINEログインを行ってください。</p>
                        <a href={ lineLoginUrl } id="lineLogin" style={ { marginBottom: '30px' } }>
                            <img src={ lineButtonBase }//"../../images/btn_login_base.png"
                                style={ { width: '180px', marginBottom: '30px' } }
                                class="btn btn-block btn-social button"
                            />
                        </a>
                    </div>
                    : <p>LINEログイン完了です！録音を開始してください。</p>
            }
            {/* <Button
                style={ { margin: '20px' } }
                //variant="contained"
                //color="primary"
                cta={ isRecording ? '録音中...(クリックで終了)' : '会話の録音を開始' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button> */}
            {
                !isRecording
                    ? <div>
                        <a><MicNoneTwoToneIcon style={ { fontSize: 100 } } onClick={ () => { startRecording() } }></MicNoneTwoToneIcon></a>
                        <p>会話の録音を開始</p>
                    </div>
                    : <div>
                        <a><StopTwoToneIcon style={ { fontSize: 100 } } onClick={ () => { stopRecording() } }></StopTwoToneIcon></a>
                        <p>録音中...(クリックで終了)</p>
                    </div>
            }
            <p>{ transcriptArrayYou.length >= 1 }</p>
            {( transcriptArrayYou.length >= 1 ) && ( !isRecording ) &&
                <p>{ isAnalysis ? '分析中...少々お待ちください。' : '分析完了！LINE botをご確認ください。' }</p>
            }

        </div>
    );
}

export default AudioRecorder;
