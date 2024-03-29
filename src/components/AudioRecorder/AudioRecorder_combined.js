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
    const [ blobAppendedMic, setBlobAppendedMic ] = useState( null );
    const [ blobRecordedScreen, setBlobRecordedScreen ] = useState( null );
    const [ blobAppendedScreen, setBlobAppendedScreen ] = useState( null );
    const [ blobRecordedCombined, setBlobRecordedCombined ] = useState( null );
    const [ blobAppendedCombined, setBlobAppendedCombined ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( null );

    const [ recordString, setRecordString ] = useState( null );
    const [ transcriptChunk, setTranscriptChunk ] = useState( null );
    const [ transcriptChunkYou, setTranscriptChunkYou ] = useState( null );
    const [ transcriptChunkPartner, setTranscriptChunkPartner ] = useState( null );
    const [ transcriptAppended, setTranscriptAppended ] = useState( null );
    const [ transcriptAppendedYou, setTranscriptAppendedYou ] = useState( null );
    const [ transcriptAppendedPartner, setTranscriptAppendedPartner ] = useState( null );
    const [ transcript, setTranscript ] = useState( '' );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );


    const initialiseMediaStreams = () => {
        navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            console.log( 'mic stream', stream );
            setStreamMic( stream )
            constructMediaRecorderMic( stream )
        } ).catch( error => {
            console.log( error );
        } )

        navigator.mediaDevices.getDisplayMedia( {
            audio: true,
            video: true
        } ).then( stream => {
            console.log( 'screen stream', stream );
            setStreamScreen( stream )
        } ).catch( error => {
            console.log( error );
        } )
    }

    useEffect( () => {
        initialiseMediaStreams();
    }, [] )


    //////////////// Construct a media recorder for mic
    const constructMediaRecorderMic = ( streamMic ) => {
        const blobChunkArray = []

        const recorder = new MediaRecorder( streamMic, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 41 * 1000
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                //console.log( 'got a chunk from mic', e.data )
                blobChunkArray.push( e.data );
            }
        } );
        recorder.addEventListener( 'stop', () => {
            //console.log( 'blob chunk array from mic', blobChunkArray )
            const blob = new Blob( blobChunkArray, { 'type': 'audio/wav; codecs=opus' } );
            setBlobRecordedMic( blob )
        } );
        setMediaRecorderMic( recorder );
        // console.log( 'recorder mic constructed', recorder );
    }


    ///////////////// Construct a media recorder for screen
    useEffect( () => {
        if( !streamScreen ) return
        const blobChunkArray = []

        const recorder = new MediaRecorder( streamScreen, {
            mimeType: 'video/webm;codecs=vp8',
            audioBitsPerSecond: 41 * 1000
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                //console.log( 'got a chunk from screen', e.data )
                //setBlobRecordedScreen( e.data )
                const blob = new Blob( [ e.data ], { 'type': 'audio/webm;codecs=opus' } );
                //setBlobRecordedScreen( blob )
                //console.log( blob )
                //blobChunkArray.push( e.data );

                // tentatively play the chunk audio
                // const myURL = window.URL || window.webkitURL;
                // const blobURL = myURL.createObjectURL( blob );
                // console.log( blobURL )
                // const tmp = new Audio( blobURL );
                // console.log( tmp )
                // tmp.play()

            }
        } );
        recorder.addEventListener( 'stop', () => {
            //console.log( 'blob chunk array from screen', blobChunkArray )
            //const blob = new Blob( blobChunkArray, { 'type': 'audio/wav; codecs=opus' } );
            //setBlobAppendedScreen( blob )
        } );
        setMediaRecorderScreen( recorder );
        // console.log( 'recorder screen constructed', recorder );

    }, [ streamScreen ] )


    ///////////////// Construct a media recorder combined ///////////////////////
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

    }, [ streamMic, streamScreen ] )

    useEffect( () => {
        if( !streamCombined ) return
        const recorderCombined = new MediaRecorder( streamCombined, { mimeType: 'video/webm; codecs=vp9' } )
        // console.log( recorderCombined );

        const blobChunkArray = []

        recorderCombined.addEventListener( 'dataavailable', ( e ) => {
            if( e.data && e.data.size > 0 ) {
                //console.log( 'got a chunk from both', e.data )
                //setBlobRecordedCombined( e.data )
                blobChunkArray.push( e.data );
            }
        } );

        recorderCombined.addEventListener( 'stop', () => {
            // console.log( 'blob chunk array from both', blobChunkArray )
            const blob = new Blob( blobChunkArray, { 'type': 'audio/wav; codecs=opus' } );
            setBlobAppendedCombined( blob )
        } );

        setMediaRecorderCombined( recorderCombined );
        // console.log( 'recorder combined constructed', recorderCombined );

    }, [ streamCombined ] )


    /////////////// Audio recorder operation ////////////////
    const startMediaRecorder = () => {
        setBlobRecordedMic( null )
        setBlobRecordedScreen( null )
        setTranscriptAppendedYou( null )
        setTranscriptAppendedPartner( null )

        setIsRecording( true );
        const startTime = new Date();
        setStartTime( startTime.getTime() );
        //setTranscriptAppended( null );
        setDownloadUrl( null )

        mediaRecorderMic.start( 5000 )
        mediaRecorderScreen.start( 5000 )
        mediaRecorderCombined.start()

        // console.log( 'recoding started' );
    }

    const stopMediaRecorder = () => {
        setIsRecording( false );
        const endTime = new Date();
        setEndTime( endTime.getTime() );

        mediaRecorderMic.stop()
        mediaRecorderScreen.stop()
        mediaRecorderCombined.stop()
        // console.log( 'recoding ended' );
    }

    const playMediaRecorderCombined = () => {
        if( !blobAppendedCombined ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        const tmp = new Audio( blobURL );
        tmp.play()
    }

    useEffect( () => {
        if( !blobAppendedCombined ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        setDownloadUrl( blobURL );
    }, [ blobAppendedCombined ] )




    ///////////////// Functions to convert and send blobs to transcribe //////////////////
    const blobToBase64Mic = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecordedMic );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            //const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            //console.log( 'sent mic audio: ' + recordString.slice( -100 ) )
            //sendGoogle( recordString, { destination: 'you' } )
        }
    }

    const blobToBase64Screen = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecordedScreen );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            //const recordString = reader.result.toString().replace( 'data:video/webm;codecs=vp8,opus;base64,', '' );
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            //console.log( 'sent screen audio: ' + recordString.slice( -100 ) )
            //sendGoogle( recordString, { destination: 'partner' } )
        }
    }

    // not in use
    const blobToBase64Combined = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecordedCombined );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent combined audio: ' + recordString.slice( -100 ) )
            setRecordString( recordString )
        }
    }

    ///// Activate the cunstions
    useEffect( () => {
        //console.log( 'mic blob updated', blobRecordedMic );
        ( blobRecordedMic !== null ) && blobToBase64Mic();
    }, [ blobRecordedMic ] )

    useEffect( () => {
        //console.log( 'screen blob updated', blobRecordedScreen );
        ( blobRecordedScreen !== null ) && blobToBase64Screen();
    }, [ blobRecordedScreen ] )

    // not in use
    useEffect( () => {
        //console.log( 'screen blob updated', blobRecordedCombined );
        //( blobRecordedCombined !== null ) && blobToBase64Combined();
    }, [ blobRecordedCombined ] )

    // not in use
    useEffect( () => {
        //console.log( 'audio string updated' );
        //( recordString !== null ) && sendGoogle();
    }, [ recordString ] )




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
                ( destination.destination === 'you' ) ? setTranscriptChunkYou( res.data.transcript ) : setTranscriptChunkPartner( res.data.transcript );
            } )
            .catch( ( err ) => {
                console.log( 'transcribe err :', err );
            } );
    }

    const appendTranscriptYou = () => {
        const transcriptUpdated = [ transcriptAppendedYou, transcriptChunkYou ]
        //console.log( transcriptUpdated )
        setTranscriptAppendedYou( transcriptUpdated.join( ' ' ) );
    }

    const appendTranscriptPartner = () => {
        const transcriptUpdated = [ transcriptAppendedPartner, transcriptChunkPartner ]
        //console.log( transcriptUpdated )
        setTranscriptAppendedPartner( transcriptUpdated.join( ' ' ) );
    }

    useEffect( () => {
        ( transcriptChunkYou !== null ) && appendTranscriptYou();
    }, [ transcriptChunkYou ] )

    useEffect( () => {
        ( transcriptChunkPartner !== null ) && appendTranscriptPartner();
    }, [ transcriptChunkPartner ] )

    // not in use
    useEffect( () => {
        //console.log( 'transcript chunk updated' );
        //( transcriptChunk !== null ) && appendTranscript();
    }, [ transcriptChunk ] )


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
            <Button
                //style={{marginTop: '10px'}}
                //variant="contained"
                //color="primary"
                cta={ isRecording ? 'End' : 'Start!' } // from the template
                onClick={ () => { isRecording ? stopMediaRecorder() : startMediaRecorder() } }
            >
            </Button>

            { ( !isRecording && blobAppendedCombined !== null ) &&
                <button style={ { margin: '20px' } } onClick={ playMediaRecorderCombined }> PLAY </button>
            }
            <a href={ downloadUrl } download id="download">{ ( downloadUrl !== null ) ? 'Download' : '' }</a>

            <div style={ { display: 'flex', flexDirection: 'row' } }>
                <Card style={ { width: '60vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>相手</Typography>
                        <Typography>{ transcriptAppendedPartner }</Typography>
                    </CardContent>
                </Card>
                <Card style={ { width: '60vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>あなた</Typography>
                        <Typography>{ transcriptAppendedYou }</Typography>
                    </CardContent>
                </Card>
            </div>

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
