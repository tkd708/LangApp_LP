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

//const AudioRecorder = typeof window !== `undefined` ? require( "audio-recorder-polyfill" ).default : '' //"window" is not available during server side rendering.
//import AudioRecorder from "audio-recorder-polyfill"
if( typeof window !== `undefined` ) {
    const ua = window.navigator.userAgent.toLowerCase();
    if( ua.indexOf( "iphone" ) !== -1 || ua.indexOf( "ipad" ) !== -1 ) {
        const AudioRecorder = require( "audio-recorder-polyfill" ).default;
        window.MediaRecorder = AudioRecorder
    }
}

const COMMON_WORDS = [
    'yes', 'no', 'yeah', 'ok', 'okay',
    '', 'a', 'the',
    'i', 'my', 'me', 'mine', 'you', 'your', 'yours',
    'he', 'him', 'his', 'she', 'her', 'hers',
    'we', 'us', 'our', 'ours', 'they', 'them', 'thier', 'thiers',
    'it', 'this', 'that', 'there',
    'and', 'but',
    'at', 'in', 'on', 'of', 'from', 'for', 'to',
    'am', 'are', 'is', 'be'
]


const AudioRecorderLIFF = () => {

    const [ appID, setAppID ] = useState( '' );
    const appIDRef = useRef( appID )
    useEffect( () => {
        appIDRef.current = appID
    }, [ appID ] )
    const [ recordingID, setRecordingID ] = useState( null );
    const recordingIDRef = useRef( recordingID )
    useEffect( () => {
        recordingIDRef.current = recordingID
    }, [ recordingID ] )

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

    const [ transcript, setTranscript ] = useState( null );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );

    const intervalSeconds = 30; // interval of the repeating audio recording


    //////////////// Construct a media recorder for mic to be repeated for transcription

    let recorder

    navigator.mediaDevices.getUserMedia( {
        audio: true,
        video: false
    } ).then( stream => {
        recorder = new MediaRecorder( stream, {
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
        //console.log( 'mic stream', stream );
        //return ( stream )
    } ).catch( error => console.log( error ) )


    /////////////// Audio recorder operation ////////////////
    const startRecording = () => {
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
        recorder.stop();
        console.log( 'recorders off' )
        if( !isRecordingRef.current ) return
        //mediaRecorderMic.stop();
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        //mediaRecorderMic.stop()

        const endTime = new Date();
        setEndTime( endTime.getTime() );
        console.log( 'recoding ended, it took', ( endTime.getTime() - startTime ) / 1000, 'seconds' );
    }


    ///////////////// Functions to convert and send blobs to transcribe //////////////////
    const blobToBase64 = ( blob, speaker ) => {
        const newBlob = new Blob( [ blob ], { type: blob.type } )
        const reader = new FileReader();
        reader.readAsDataURL( newBlob );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            //const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' ); 
            const recordString = reader.result.toString().replace( 'data:audio/wav;base64,', '' );
            //const recordString = ( ua.indexOf( "iphone" ) !== -1 || ua.indexOf( "ipad" ) !== -1 ) ?
            //    reader.result.toString().replace( 'data:audio/wav;base64,', '' ) : // with polyfill
            //    reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
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
                    appID: appIDRef.current,
                    recordingID: recordingIDRef.current,
                    audioString: recordString,
                    transcript: transcript,
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
    useEffect( () => {
        if( transcript === null ) return

        const transcriptWordArray = transcript.replace( /[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "" ).split( " " );
        setVocab1( transcriptWordArray.length );

        // words per minute
        const conversationLength = ( endTime - startTime ) / 1000 / 60;
        setVocab2( ( transcriptWordArray.length / conversationLength ).toFixed( 1 ) );

        // size of vocab
        const uniq = [ ...new Set( transcriptWordArray ) ];
        setVocab3( uniq.length );
        //console.log( uniq )

        // vocab counts... removing articles, prepositions and pronouns etc.
        const vocabCounts = [];
        transcriptWordArray.forEach( ( word ) => {
            const lowerWord = word.toLowerCase();
            if( COMMON_WORDS.includes( lowerWord ) ) return
            vocabCounts[ lowerWord ] = ( vocabCounts[ lowerWord ] || 0 ) + 1;
        } );
        const vocabCountArray = [];
        Object.entries( vocabCounts ).forEach( ( [ key, value ] ) => {
            const wordCount = { word: key, count: value }
            vocabCountArray.push( wordCount )
        } );
        vocabCountArray.sort( function ( a, b ) {
            return a.count > b.count ? -1 : 1;
        } );
        setVocab4( vocabCountArray );

        //////////////// send analysis report to LINE and to dynamoDB
        axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/LineBotReport',
                method: 'POST',
                data: {
                    appID: appIDRef.current,
                    recordingID: recordingIDRef.current,
                    lengthMinute: conversationLength.toFixed( 1 ),
                    transcript: transcript,
                    wordsTotal: transcriptWordArray.length,
                    wordsPerMinute: ( transcriptWordArray.length / conversationLength ).toFixed( 1 ),
                    vocab: uniq.length,
                    topWord1: vocabCountArray[ 0 ],
                    topWord2: vocabCountArray[ 1 ],
                    topWord3: vocabCountArray[ 2 ],
                },
            } )
            .then( ( res ) => { console.log( 'report to LINE bot and dynamoDB success...', res ) } )
            .catch( ( err ) => { console.log( 'report to LINE bot and dynamoDB error...', err ) } )

    }, [ transcript ] )





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

            <TextField
                required
                id="filled-required"
                label="お名前" // to be replaced with LangApp ID
                variant="filled"
                value={ appID }
                onChange={ ( e ) => { ( !isRecording ) && setAppID( e.target.value ); } }
                inputProps={ {
                    style: { backgroundColor: 'white', marginBottom: '20px' },
                } }
            />
            <Button
                style={ { margin: '20px' } }
                //variant="contained"
                //color="primary"
                cta={ isRecording ? '録音中...(クリックで終了)' : '会話の録音を開始' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>
        </div >

    );
}

export default AudioRecorderLIFF;
