import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    const [ mediaRecorderScreen, setMediaRecorderScreen ] = useState( null ); //
    const [ mediaRecorderCombined, setMediaRecorderCombined ] = useState( null ); //

    const [ isRecording, setIsRecording ] = useState( false );
    const [ startTime, setStartTime ] = useState( '' ); // milliseconds
    const [ endTime, setEndTime ] = useState( '' ); // milliseconds


    const [ blobRecordedMic, setBlobRecordedMic ] = useState( null );
    const [ blobAppendedMic, setBlobAppendedMic ] = useState( '' );
    const [ downloadUrl, setDownloadUrl ] = useState( null );

    const [ blobRecordedScreen, setBlobRecordedScreen ] = useState( null );
    const [ blobAppendedScreen, setBlobAppendedScreen ] = useState( '' );

    const [ blobRecordedCombined, setBlobRecordedCombined ] = useState( null );
    const [ blobAppendedCombined, setBlobAppendedCombined ] = useState( '' );

    const [ recordString, setRecordString ] = useState( null );
    const [ transcriptChunk, setTranscriptChunk ] = useState( null );
    const [ transcriptAppended, setTranscriptAppended ] = useState( null );
    const [ transcript, setTranscript ] = useState( '' );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );


    const initialiseMediaRecorderMic = () => {
        navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            console.log( stream );
            setStreamMic( stream )
            const blobChunkArray = []

            const recorder = new MediaRecorder( stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 16 * 1000
            } );
            recorder.addEventListener( 'dataavailable', ( e ) => {
                if( e.data.size > 0 ) {
                    console.log( 'got a chunk from mic', e.data )
                    setBlobRecordedMic( e.data )
                    blobChunkArray.push( e.data );
                }
            } );
            recorder.addEventListener( 'stop', () => {
                console.log( 'blob chunk array from mic', blobChunkArray )
                const blob = new Blob( blobChunkArray, { 'type': 'audio/wav; codecs=opus' } );
                setBlobAppendedMic( blob )
            } );

            setMediaRecorderMic( recorder );
        } ).catch( error => {
            console.log( error );
        } );
    }

    const initialiseMediaRecorderScreen = () => {
        navigator.mediaDevices.getDisplayMedia( {
            audio: true,
            video: true
        } ).then( stream => {
            console.log( stream );
            setStreamScreen( stream )
            const blobChunkArray = []

            const recorder = new MediaRecorder( stream, {
                mimeType: 'video/webm;codecs=vp8',
                audioBitsPerSecond: 16 * 1000
            } );
            recorder.addEventListener( 'dataavailable', ( e ) => {
                if( e.data.size > 0 ) {
                    console.log( 'got a chunk from screen', e.data )
                    setBlobRecordedScreen( e.data )
                    blobChunkArray.push( e.data );
                }
            } );
            recorder.addEventListener( 'stop', () => {
                console.log( 'blob chunk array from screen', blobChunkArray )
                const blob = new Blob( blobChunkArray, { 'type': 'audio/wav; codecs=opus' } );
                setBlobAppendedScreen( blob )
            } );

            setMediaRecorderScreen( recorder );
        } ).catch( error => {
            console.log( error );
        } );
    }


    ///////////////// Media recorder combined ///////////////////////
    const initialiseMediaRecorderCombined = () => {
        console.log( 'mic stream', streamMic.getTracks() );
        console.log( 'screen stream', streamScreen.getTracks()[ 0 ] );

        //https://www.m3tech.blog/entry/record-screen-capture-and-voice
        //const streamCombined = new MediaStream( [ ...streamMic.getTracks(), ...streamScreen.getTracks() ] )
        //const streamCombined = new MediaStream( [ streamMic.getTracks()[ 0 ], streamScreen.getTracks()[ 0 ] ] )

        // https://developer.mozilla.org/ja/docs/Web/API/MediaStream/addTrack
        //const streamCombined = streamMic.addTrack( streamScreen.getTracks()[ 0 ] ) 

        //https://stackoverflow.com/questions/46074239/record-multi-audio-tracks-available-in-a-stream-with-mediarecorder
        //https://paul.kinlan.me/screen-recorderrecording-microphone-and-the-desktop-audio-at-the-same-time/
        //https://paul.kinlan.me/screen-recorderrecording-microphone-and-the-desktop-audio-at-the-same-time/
        const audioContext = new AudioContext();
        const source1 = audioContext.createMediaStreamSource( streamMic );
        const source2 = audioContext.createMediaStreamSource( streamScreen );
        const destination = audioContext.createMediaStreamDestination();
        //connect sources to destination... you can add gain nodes if you want 
        source1.connect( destination );
        source2.connect( destination );

        console.log( 'combined stream', destination.stream );
        setStreamCombined( destination.stream )
    }

    useEffect( () => {
        if( !streamCombined ) return
        const recorderCombined = new MediaRecorder( streamCombined, { mimeType: 'video/webm; codecs=vp9' } )
        console.log( recorderCombined );

        const blobChunkArray = []

        recorderCombined.addEventListener( 'dataavailable', ( e ) => {
            if( e.data && e.data.size > 0 ) {
                // do something
                console.log( 'got a chunk from both', e.data )
                setBlobRecordedCombined( e.data )
                blobChunkArray.push( e.data );
            }
        } );

        recorderCombined.addEventListener( 'stop', () => {
            console.log( 'blob chunk array from both', blobChunkArray )
            const blob = new Blob( blobChunkArray, { 'type': 'audio/wav; codecs=opus' } );
            setBlobAppendedCombined( blob )
        } );

        setMediaRecorderCombined( recorderCombined );
    }, [ streamCombined ] )

    const startMediaRecorderCombined = () => {
        mediaRecorderCombined.start( 10000 )
        console.log( 'recoding started for both streams' );
    }

    const stopMediaRecorderCombined = () => {
        mediaRecorderCombined.stop()
        console.log( 'recoding stopped for both streams' );
    }




    const startMediaRecorder = () => {
        setBlobRecordedMic( null )
        setBlobRecordedScreen( null )
        initialiseMediaRecorderMic();
        initialiseMediaRecorderScreen();

        setIsRecording( true );
        const startTime = new Date();
        setStartTime( startTime.getTime() );
        setTranscriptAppended( null );
        setDownloadUrl( null )

        mediaRecorderMic.start( 10000 )
        mediaRecorderScreen.start( 15000 )
        console.log( 'recoding started' );
    }

    const stopMediaRecorder = () => {
        setIsRecording( false );
        const endTime = new Date();
        setEndTime( endTime.getTime() );

        mediaRecorderMic.stop()
        mediaRecorderScreen.stop()
        console.log( 'recoding ended' );
    }

    const playMediaRecorder = () => {
        if( !blobAppendedMic ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobAppendedMic );
        const tmp = new Audio( blobURL );
        tmp.play()
    }

    const playMediaRecorderScreen = () => {
        if( !blobAppendedScreen ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobAppendedScreen );
        const tmp = new Audio( blobURL );
        tmp.play()
    }

    const playMediaRecorderCombined = () => {
        if( !blobAppendedCombined ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        const tmp = new Audio( blobURL );
        tmp.play()
    }


    useEffect( () => {
        if( !blobAppendedMic ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobAppendedMic );
        setDownloadUrl( blobURL );
    }, [ blobAppendedMic ] )




    ////// Functions to convert and send blobs to transcribe
    const blobToBase64 = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecordedMic );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent mic audio: ' + recordString.slice( -100 ) )
            setRecordString( recordString )
        }
    }

    const blobToBase64Screen = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecordedScreen );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const recordString = reader.result.toString().replace( 'data:video/webm;codecs=vp8,opus;base64,', '' );
            console.log( 'sent screen audio: ' + recordString.slice( -100 ) )
            setRecordString( recordString )
        }
    }

    const blobToBase64Combined = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecordedCombined );
        reader.onloadend = function () {
            console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent screen audio: ' + recordString.slice( -100 ) )
            setRecordString( recordString )
        }
    }

    const sendGoogle = () => {
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
                setTranscriptChunk( res.data.transcript );
            } )
            .catch( ( err ) => {
                console.log( 'transcribe err :', err );
            } );
    }

    const appendTranscript = () => {
        const transcriptUpdated = [ transcriptAppended, transcriptChunk ]
        console.log( transcriptUpdated )
        setTranscriptAppended( transcriptUpdated.join( ' ' ) );
    }


    //////// Activate the cunstions
    useEffect( () => {
        initialiseMediaRecorderMic();
        initialiseMediaRecorderScreen();
    }, [] )

    useEffect( () => {
        console.log( 'mic blob updated', blobRecordedMic );
        ( blobRecordedMic !== null ) && blobToBase64();
    }, [ blobRecordedMic ] )

    useEffect( () => {
        console.log( 'screen blob updated', blobRecordedScreen );
        ( blobRecordedScreen !== null ) && blobToBase64Screen();
    }, [ blobRecordedScreen ] )

    useEffect( () => {
        console.log( 'screen blob updated', blobRecordedCombined );
        ( blobRecordedCombined !== null ) && blobToBase64Combined();
    }, [ blobRecordedCombined ] )


    useEffect( () => {
        console.log( 'audio string updated' );
        ( recordString !== null ) && sendGoogle();
    }, [ recordString ] )

    useEffect( () => {
        console.log( 'transcript chunk updated' );
        ( transcriptChunk !== null ) && appendTranscript();
    }, [ transcriptChunk ] )

    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript
        ( !isRecording && transcriptAppended !== null ) && setTranscript( transcriptAppended );
        //console.log('last chunk of transcript appended');
    }, [ transcriptAppended ] )



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
            <button onClick={ initialiseMediaRecorderCombined }>initialise media recorder combine</button>
            <button onClick={ startMediaRecorderCombined }>start media recorder combine</button>
            <button onClick={ stopMediaRecorderCombined }>stop media recorder combine</button>
            <button onClick={ playMediaRecorderCombined }>play media recorder combine</button>

            <button onClick={ startMediaRecorder }>start media recorder</button>
            <button onClick={ stopMediaRecorder }>stop media recorder</button>
            <button onClick={ playMediaRecorder }>play media recorder</button>
            <button onClick={ playMediaRecorderScreen }>play media recorder screen</button>

            <a href={ downloadUrl } download id="download">{ ( downloadUrl !== null ) ? 'Download' : '' }</a>

            <Card style={ { width: '60vw', margin: '20px' } } >
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>会話内容の書き起こし</Typography>
                    <Typography>{ transcriptAppended }</Typography>
                </CardContent>
            </Card>

            { ( transcript !== null ) &&
                <Card style={ { width: '100%', marginTop: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>今回の会話の分析結果はこちら！</Typography>
                        {/*<Typography>{ 'Transcript: ' + transcript }</Typography> 
                        <Typography>{ `今回の会話での単語数: ${ vocab1 }` }</Typography> */ }
                        <Typography>{ `今回の会話での流暢さ(word per minute): ${ vocab2 } ` }</Typography>
                        <Typography>{ `使用した単語数: ${ vocab3 } ` }</Typography>
                    </CardContent>
                </Card>
            }

        </div>

    );
}

export default AudioRecorder;
