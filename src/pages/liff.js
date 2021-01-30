import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';

import Button from "../components/Button/button";

import TranscribeLangs from '../constants/transcribeLangs.json';

import { v4 as uuidv4 } from 'uuid';

//import liff from '@line/liff';
const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.

if( typeof window !== `undefined` ) {
    const ua = window.navigator.userAgent.toLowerCase();
    if( ua.indexOf( "iphone" ) !== -1 || ua.indexOf( "ipad" ) !== -1 ) {

    }
}


const AudioRecorderLIFF = () => {

    //const [ mimeType, setMimeType ] = useState( 'audio/webm' );
    //const [ isIOS, setIsIOS ] = useState( false );
    //useEffect( () => {
    //    if( typeof window !== `undefined` ) {
    //        const ua = window.navigator.userAgent.toLowerCase();
    //        if( ua.indexOf( "iphone" ) !== -1 || ua.indexOf( "ipad" ) !== -1 ) {
    //            setIsIOS( true );
    //            setMimeType( 'audio/mp4' );
    //        }
    //    }
    //}, [] )
    //const [ lineLoginStatus, setLineLoginStatus ] = useState( false );
    //const [ lineProfile, setLineProfile ] = useState( false );
    //const [ lineAccessToken, setLineAccessToken ] = useState( '' );

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


    const [ recorder, setRecorder ] = useState( false );

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

    const [ blobRecorded, setBlobRecorded ] = useState( null );
    const blobRecordedRef = useRef( blobRecorded )
    useEffect( () => {
        blobRecordedRef.current = blobRecorded
    }, [ blobRecorded ] )
    const [ audioPlayer, setAudioPlayer ] = useState( null );


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

    const [ transcript, setTranscript ] = useState( null );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ intervalSeconds, setIntervalSeconds ] = useState( 15 );

    // LIFF processes
    useEffect( () => {
        constructRecorder();

        ( typeof window !== `undefined` ) && liff.init( { liffId: process.env.GATSBY_LINE_LIFFID } )
            .then( () => {
                console.log( 'Success in LIFF initialisation' );
                liffFechID();
            } )
            .catch( err => window.alert( 'Error in LIFF initialisation: ' + err ) )
    }, [] )

    const redirectUrl = 'https://langapp.netlify.app/liff';
    const liffFechID = async () => {
        //!( liff.isLoggedIn() ) && liff.login( { redirectUri: redirectUrl } ) // ログインしていなければ最初にログインする

        if( liff.isLoggedIn() ) {
            const idToken = await liff.getIDToken();
            //const accessToken = await liff.getAccessToken();
            //( idToken ) && console.log( 'Success in fetching ID token' );
            setLineIdToken( idToken )
            //setLineAccessToken( accessToken )
            //setLineLoginStatus( true )
        }
    }




    //////////////// Construct a media recorder for mic to be repeated for transcription
    const constructRecorder = async () => {
        //alert( MediaRecorder.isTypeSupported( 'audio/mp4' ) )

        const stream = await navigator.mediaDevices.getUserMedia( { audio: true, video: false } );
        //console.log( stream );
        //alert( 'media stream id: ' + stream.id );
        //alert( 'media stream active: ' + stream.active );

        const os = liff.getOS();

        const recorder = new MediaRecorder( stream, {
            mimeType: ( os === 'ios' ) ? 'audio/mp4' : 'audio/webm', // 'audio/mp4',
            audioBitsPerSecond: 16 * 1000
        } );

        recorder.addEventListener( 'start', () => {
            //alert( "start recording" );
        } );
        recorder.addEventListener( 'dataavailable', async ( e ) => {
            if( e.data.size > 0 ) {
                //console.log( e.data )
                //alert( 'blob size: ', e.data.size )
                //alert( 'blob type: ', e.data.type )
                setBlobRecorded( e.data );
                const base64Audio = await blobToBase64( e.data, os );
                //console.log( 'converted audio to be sent...', base64Audio.slice( 0, 100 ) )
                const audioBuffer = await audioBuffer( e.data );
                sendGoogle( base64Audio, audioBuffer )
            }
        } );
        recorder.addEventListener( 'stop', () => {
            //alert( "stop recording" );
        } );
        //alert( recorder.mimeType )
        //alert( MediaRecorder.isTypeSupported( recorder.mimeType ) )
        //alert( MediaRecorder.isTypeSupported( 'audio/mp4' ) )
        setRecorder( recorder );
    }



    /////////////// Audio recorder operation ////////////////
    const startRecording = async () => {

        const uuid = uuidv4();
        setRecordingID( uuid )

        // delete previous records if exist
        setTranscriptArrayYou( [] )
        setTranscript( null )


        setIsRecording( true );
        startMediaRecorders();

        const startTime = new Date();
        setStartTime( startTime.getTime() );
        // console.log( 'recoding started' );
    }

    const startMediaRecorders = () => {
        console.log( 'recorders on' )
        recorder.start();
        setTimeout( () => { repeatMediaRecorders(); }, intervalSeconds * 1000 );
    }


    const repeatMediaRecorders = () => {
        if( !isRecordingRef.current ) return
        recorder.stop();
        console.log( 'recorders off' )
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        recorder.stop();

        const endTime = new Date();
        setEndTime( endTime.getTime() );
        const recordLengthSeconds = ( endTime.getTime() - startTime ) / 1000;
        console.log( 'recoding ended, it took', recordLengthSeconds, 'seconds' );

        setTimeout( () => { vocabAnalysis( transcriptArrayYouRef.current.join( ' ' ), recordLengthSeconds ); }, 30 * 1000 );
    }

    ///////////////// Recording is done >> generate download link and audio player as well as send the full audio to AWS S3
    const myURL = typeof window !== `undefined` ? window.URL || window.webkitURL : ''

    useEffect( () => {
        if( !blobRecorded ) return
        const blobURL = myURL.createObjectURL( blobRecorded );
        const tmp = new Audio( blobURL );
        setAudioPlayer( tmp );

        //console.log( 'audioPlayer...', tmp )
    }, [ blobRecorded ] )

    const audioRecordPlay = () => {
        if( !audioPlayer ) return
        audioPlayer.play()
    }
    const audioRecordPause = () => {
        if( !audioPlayer ) return
        audioPlayer.pause()
    }
    const audioRecordStop = () => {
        if( !audioPlayer ) return
        audioPlayer.currentTime = 0;
        audioPlayer.pause()
    }



    ///////////////// Functions to convert and send blobs to transcribe //////////////////
    const blobToBase64 = ( blob, os ) => {
        return new Promise( ( resolve, reject ) => {
            console.log( blob )
            const newBlob = new Blob( [ blob ], { type: blob.type } )
            const reader = new FileReader();
            reader.readAsDataURL( newBlob );
            reader.onload = res => {
                console.log( 'audio string head: ' + res.target.result.toString().slice( 0, 100 ) );
                const recordString = ( os === 'ios' )
                    ? reader.result.toString().replace( 'data:audio/mp4;base64,', '' )
                    : reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
                console.log( 'sent audio as string of', recordString.slice( -100 ) )
                resolve( recordString );
            };
            reader.onerror = err => reject( err );
        } );
    }


    //////////////////////////////////////////////////////////////////// tentative functions
    function arrayBufferToBase64( buffer ) {
        var binary = '';
        var bytes = new Uint8Array( buffer );
        var len = bytes.byteLength;
        for( var i = 0; i < len; i++ ) {
            binary += String.fromCharCode( bytes[ i ] );
        }
        var base64 = typeof window !== `undefined` ? window.btoa( binary ) : ''
        return base64;
    }

    const audioBuffer = ( blob ) => {
        const audioContext = typeof window !== `undefined` ? new ( window.AudioContext || window.webkitAudioContext )() : ''
        return new Promise( ( resolve, reject ) => {
            const newBlob = new Blob( [ blob ], { type: blob.type } )
            const reader = new FileReader();
            reader.readAsArrayBuffer( newBlob );
            reader.onload = res => {
                // Asynchronously decode audio file data contained in an ArrayBuffer.
                audioContext.decodeAudioData( res.target.result, function ( buffer ) {
                    // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
                    var duration = buffer.duration;
                    console.log( "The duration of the audio is of: " + duration + " seconds" );
                    var base64String = arrayBufferToBase64( buffer ); //btoa( String.fromCharCode.apply( null, new Uint8Array( buffer ) ) ); //btoa( String.fromCharCode( ...new Uint8Array( buffer ) ) );
                    console.log( "The audio base64 via audio context is: " + base64String.slice( 0, 100 ) );
                    resolve( buffer )
                } );
            };
            reader.onerror = err => reject( err );
        } );
    }
    ///////////////////////////////////////////////////////////////////////////////////////



    ////////////////////////// Send audio strings to Google for transcription //////////////////////
    const sendGoogle = async ( recordString, audioBuffer ) => {
        const url = 'https://langapp.netlify.app/.netlify/functions/speech-to-text-expo';

        const transcript =
            await axios
                .request( {
                    url,
                    method: 'POST',
                    data: {
                        source: 'LIFF',
                        audio: recordString,
                        lang: transcribeLang,
                    },
                } )
                .then( ( res ) => {
                    const transcribedTime = new Date();
                    console.log( 'transcribed at', ( ( transcribedTime.getTime() - startTimeRef.current ) / 1000 ), 'seconds after starting ', res.data.transcript );
                    return ( res.data.transcript )
                } )
                .catch( ( err ) => {
                    const errorTime = new Date();
                    const errorStatus = {
                        errorMessage: err,
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
                    source: 'LIFF',
                    lineIdToken: lineIdTokenRef.current,
                    recordingID: recordingIDRef.current,
                    audioString: recordString,
                    audioBuffer: audioBuffer,
                    transcript: transcript,
                    audioInterval: intervalSeconds * 1000,
                },
            } )
            .then( ( res ) => { console.log( 'transcript to LINE bot success...', res ) } )
            .catch( ( err ) => { console.log( 'transcript to LINE bot error...', err ) } )
    }


    ///////////////// The whole transcript of YOU after finishing the recording... after the length of the transcript chunk array reaches that derived from the length and interval
    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript
        if( isRecording ) return
        const conversationLength = ( endTime - startTime ) / 1000;
        const finalArrayLength = conversationLength / intervalSeconds;
        //console.log( 'conversation length is', conversationLength, 'seconds and the transcript array length is', transcriptArrayYou.length );
        ( transcriptArrayYou.length !== 0 && transcriptArrayYou.length >= finalArrayLength ) && setTranscript( transcriptArrayYou.join( ' ' ) );
        //console.log('last chunk of transcript appended');
    }, [ transcriptArrayYou ] )



    //////// After transcribing... vocab analysis
    const vocabAnalysis = async ( transcript, recordLengthSeconds ) => {
        if( transcript === null ) return

        const conversationLength = recordLengthSeconds / 60;

        //////////////// send analysis report to LINE and to dynamoDB
        axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/LineBotReport',
                method: 'POST',
                data: {
                    source: 'LIFF',
                    lineIdToken: lineIdTokenRef.current,
                    recordingID: recordingIDRef.current,
                    lengthMinute: conversationLength.toFixed( 1 ),
                    transcript: transcript,
                    errors: transcribeErrorArrray,
                },
            } )
            .then( ( res ) => { console.log( 'report to LINE bot and dynamoDB success...', res ) } )
            .catch( ( err ) => { console.log( 'report to LINE bot and dynamoDB error...', err ) } )

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

            {/* 
            <h1 style={ { color: 'red' } }>{ "Is this from iOS? ..." + isIOS }</h1>
            {( typeof window !== `undefined` ) && <p style={ { color: 'red' } }>{ window.navigator.userAgent.toLowerCase() }</p> }
            
            <p style={ { color: 'black' } }>{ 'Line login ?' + lineLoginStatus }</p>
            <p style={ { color: 'black' } }>{ lineAccessToken }</p>
            <p style={ { color: 'black' } }>{ lineIdToken }</p>
            <p style={ { color: 'black' } }>{ lineProfile }</p>
            */}
            <TextField
                required
                id="filled-required"
                label="書き起こし間隔（秒）" // to be replaced with LangApp ID
                variant="filled"
                value={ intervalSeconds }
                onChange={ ( e ) => { ( !isRecording ) && setIntervalSeconds( e.target.value ); } }
                inputProps={ {
                    style: { backgroundColor: 'white', marginBottom: '20px' },
                } }
            />

            <button style={ { fontSize: 40 } } onClick={ () => { isRecording ? stopRecording() : startRecording() } }>{ isRecording ? '録音中...(クリックで終了)' : '会話の録音を開始' }</button>
            <button style={ { fontSize: 40 } } onClick={ () => { audioRecordPlay(); } }>Play</button>
            <button style={ { fontSize: 40 } } onClick={ () => { audioRecordPause(); } }>Pause</button>
            <button style={ { fontSize: 40 } } onClick={ () => { audioRecordStop(); } }>Stop</button>


            < p style={ { color: 'black' } }>Ongoing transcript below</p>
            <p style={ { color: 'black' } }>{ transcriptArrayYou }</p>
            <p style={ { color: 'black' } }>Final transcript below</p>
            <p style={ { color: 'black' } }>{ transcript }</p>
        </div >

    );
}

export default AudioRecorderLIFF;
