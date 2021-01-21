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

//const AudioRecorder = typeof window !== `undefined` ? require( "audio-recorder-polyfill" ).default : '' //"window" is not available during server side rendering.
//import AudioRecorder from "audio-recorder-polyfill"
if( typeof window !== `undefined` ) {
    const ua = window.navigator.userAgent.toLowerCase();
    if( ua.indexOf( "iphone" ) !== -1 || ua.indexOf( "ipad" ) !== -1 ) {
        //const AudioRecorder = require( "audio-recorder-polyfill" ).default;
        //window.MediaRecorder = AudioRecorder
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

    const [ isIOS, setIsIOS ] = useState( false );
    useEffect( () => {
        if( typeof window !== `undefined` ) {
            const ua = window.navigator.userAgent.toLowerCase();
            if( ua.indexOf( "iphone" ) !== -1 || ua.indexOf( "ipad" ) !== -1 ) {
                setIsIOS( true );
            }
        }
    }, [] )

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

    const [ intervalSeconds, setIntervalSeconds ] = useState( 15 );

    //    ( typeof window !== `undefined` ) && alart( 'Check OS before useEffect...', liff.getOS() );
    //    ( typeof window !== `undefined` ) && alart( 'Check LIFF before useEffect...', liff.isInClient() );

    // LIFF processes
    useEffect( () => {
        ( typeof window !== `undefined` ) && liff.init( { liffId: process.env.GATSBY_LINE_LIFFID } )
            .then( () => {
                alart( 'Check LIFF...' + ( liff.isInClient() ) );
                alert( 'LIFF initialised' );
                alert( 'LINE login status...' + ( liff.isLoggedIn() ) );
                alart( 'Check OS...' + ( liff.getOS() ) );

                if( liff.isInClient() ) { // LIFFので動いているのであれば
                    liff.sendMessages( [ { // メッセージを送信する
                        'type': 'text',
                        'text': "You've successfully sent a message from LIFF! Hooray!"
                    } ] )
                        .then( () => window.alert( 'Message sent' ) )
                        .catch( error => window.alert( 'Error sending message: ' + error ) );
                }

                !( liff.isLoggedIn() ) && liff.login( {} ) // ログインしていなければ最初にログインする

                alert( 'Try get LINE profile' )
                liff.getProfile()
                    .then( profile => {
                        const userId = profile.userId
                        const displayName = profile.displayName
                        setAppID( profile.displayName )
                        alert( `Name: ${ displayName }, userId: ${ userId }` )
                    } )
                    .catch( err => window.alert( 'Error sending message: ' + err ) );

                liff.sendMessages( [ { // メッセージを送信する
                    'type': 'text',
                    'text': "You've successfully sent a message after manual login!"
                } ] )
                    .then( () => window.alert( 'Message sent' ) )
                    .catch( error => window.alert( 'Error sending message: ' + error ) );

            } )
    }, [] )


    //////////////// Construct a media recorder for mic to be repeated for transcription
    let recorder

    //( typeof window !== `undefined` ) && navigator.mediaDevices.getUserMedia( {
    //    audio: true,
    //    video: false
    //} ).then( stream => {
    //    recorder = new MediaRecorder( stream, {
    //        mimeType: 'audio/webm;codecs=opus',
    //        audioBitsPerSecond: 16 * 1000
    //    } );
    //    recorder.addEventListener( 'dataavailable', async ( e ) => {
    //        if( e.data.size > 0 ) {
    //            const base64Audio = await blobToBase64( e.data );
    //            console.log( 'converted audio to be sent...', base64Audio.slice( 0, 100 ) )
    //            sendGoogle( base64Audio )
    //        }
    //    } );
    //} ).catch( error => console.log( error ) )


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
    const blobToBase64 = ( blob ) => {
        return new Promise( ( resolve, reject ) => {
            const newBlob = new Blob( [ blob ], { type: blob.type } )
            const reader = new FileReader();
            reader.readAsDataURL( newBlob );

            reader.onload = res => {
                console.log( 'audio string head: ' + res.target.result.toString().slice( 0, 100 ) );
                const recordString = isIOS ?
                    reader.result.toString().replace( 'data:audio/wav;base64,', '' ) :
                    reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
                console.log( 'sent audio as string of', recordString.slice( -100 ) )
                resolve( recordString );
            };
            reader.onerror = err => reject( err );
        } );
    }


    ////////////////////////// Send audio strings to Google for transcription //////////////////////
    const sendGoogle = async ( recordString ) => {
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
                    const transcribedTime = new Date();
                    console.log( 'transcribed at', ( ( transcribedTime.getTime() - startTimeRef.current ) / 1000 ), 'seconds after starting ', res.data.transcript );
                    return ( res.data.transcript )
                } )
                .catch( ( err ) => {
                    console.log( err );
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

            <h1 style={ { color: 'red' } }>{ "Is this from iOS? ..." + isIOS }</h1>
            {( typeof window !== `undefined` ) && <p style={ { color: 'red' } }>{ window.navigator.userAgent.toLowerCase() }</p> }

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

            <Button
                style={ { margin: '20px' } }
                //variant="contained"
                //color="primary"
                cta={ isRecording ? '録音中...(クリックで終了)' : '会話の録音を開始' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>

            < p style={ { color: 'black' } }>Ongoing transcript below</p>
            <p style={ { color: 'black' } }>{ transcriptArrayYou }</p>
            <p style={ { color: 'black' } }>Final transcript below</p>
            <p style={ { color: 'black' } }>{ transcript }</p>
        </div >

    );
}

export default AudioRecorderLIFF;