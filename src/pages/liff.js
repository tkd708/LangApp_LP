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

    const [ lineLoginStatus, setLineLoginStatus ] = useState( false );
    const [ lineProfile, setLineProfile ] = useState( false );
    const [ lineAccessToken, setLineAccessToken ] = useState( '' );
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

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );

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

    const liffFechID = async () => {
        !( liff.isLoggedIn() ) && liff.login( {} ) // ログインしていなければ最初にログインする

        if( liff.isLoggedIn() ) {
            const idToken = await liff.getIDToken();
            const accessToken = await liff.getAccessToken();
            ( idToken ) && console.log( 'Success in fetching ID token' );
            setLineIdToken( idToken )
            setLineAccessToken( accessToken )
            setLineLoginStatus( true )

            var qs = require( 'qs' );
            const userLineProfile = await axios
                .request( {
                    url: 'https://api.line.me/v2/profile',
                    method: 'GET',
                    header: qs.stringify( {
                        Authorization: 'Bearer' + { accessToken },
                    } ),
                } )
                .then( res => {
                    console.log( 'Trying to get LINE user profile using access token...' + res.data )
                    return ( res.data )
                } )
                .catch( err => {
                    console.log( 'login line profile verify...', err )
                    return ( err )
                } );
            setLineProfile( userLineProfile )

        }
    }





    //////////////// Construct a media recorder for mic to be repeated for transcription
    const constructRecorder = async () => {
        //alert( MediaRecorder.isTypeSupported( 'audio/mp4' ) )

        const stream = await navigator.mediaDevices.getUserMedia( { audio: true, video: false } );
        //console.log( stream );
        //alert( 'media stream id: ' + stream.id );
        //alert( 'media stream active: ' + stream.active );

        const recorder = new MediaRecorder( stream, {
            mimeType: 'audio/mp4',
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
                const base64Audio = await blobToBase64( e.data );
                //console.log( 'converted audio to be sent...', base64Audio.slice( 0, 100 ) )
                sendGoogle( base64Audio )
            }
        } );
        recorder.addEventListener( 'stop', () => {
            //alert( "stop recording" );
        } );

        //alert( recorder.mimeType )
        //alert( MediaRecorder.isTypeSupported( recorder.mimeType ) )
        //alert( MediaRecorder.isTypeSupported( 'audio/mp4' ) )
        setRecorder( recorder )
    }

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
        console.log( 'recoding ended, it took', ( endTime.getTime() - startTime ) / 1000, 'seconds' );
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
    const blobToBase64 = ( blob ) => {
        return new Promise( ( resolve, reject ) => {
            const newBlob = new Blob( [ blob ], { type: blob.type } )
            const reader = new FileReader();
            reader.readAsDataURL( newBlob );

            reader.onload = res => {
                console.log( 'audio string head: ' + res.target.result.toString().slice( 0, 100 ) );
                const recordString = reader.result.toString().replace( 'data:audio/mp4;base64,', '' );
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
                    source: 'LIFF',
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
                    source: 'LIFF',
                    lineIdToken: lineIdTokenRef.current,
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

            <p style={ { color: 'black' } }>{ 'Line login ?' + lineLoginStatus }</p>
            <p style={ { color: 'black' } }>{ lineAccessToken }</p>
            <p style={ { color: 'black' } }>{ lineIdToken }</p>
            <p style={ { color: 'black' } }>{ lineProfile }</p>

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
