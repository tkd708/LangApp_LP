import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
//import Button from '@material-ui/core/Button';
import Button from "../Button/button"

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

//import { ReactMic } from 'react-mic'; // only local
//const { ReactMic } = typeof window !== `undefined` ? require( "react-mic" ) : '' //"window" is not available during server side rendering.
const { ReactMic } = ''

import TranscribeLangs from './transcribeLangs.json';

const AudioRecorder = () => {
    const [ recorder, setRecorder ] = useState(); // milliseconds

    const [ startTime, setStartTime ] = useState( '' ); // milliseconds
    const [ endTime, setEndTime ] = useState( '' ); // milliseconds
    const [ isRecording, setIsRecording ] = useState( false );

    const [ arrayBufferAppended, setArrayBufferAppended ] = useState( [] );
    const [ count, setCount ] = useState( 0 );
    const countRef = useRef( count )
    useEffect( () => {
        countRef.current = count
    }, [ count ] )

    const [ blobChunkArray, setBlobChunkArray ] = useState( [] );
    const [ blobAppended, setBlobAppended ] = useState( '' );

    const [ blobRecorded, setBlobRecorded ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( null );

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



    const initialiseMediaRecorder = () => {
        navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            console.log( stream );
            const recorder = new MediaRecorder( stream, {
                mimeType: 'video/webm;codecs=vp8',
                audioBitsPerSecond: 16 * 1000
            } );

        } ).catch( error => {
            console.log( error );
        } );
    }


    ///////////////// React mic ////////////////////////////
    const startRecording = () => {
        setIsRecording( true );

        const startTime = new Date();
        setStartTime( startTime.getTime() );

        setTranscriptAppended( '' );
        setDownloadUrl( null )

        console.log( 'recoding started' );
        console.log( 'blob chunk array is...', blobChunkArray );
    }

    const stopRecording = () => {
        setIsRecording( false );

        const endTime = new Date();
        setEndTime( endTime.getTime() );

        console.log( 'recoding ended' );
        //setBlobChunkArray( [] );
    }

    function appendBuffer( buffer1, buffer2 ) {
        var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
        tmp.set( new Uint8Array( buffer1 ), 0 );
        tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
        return tmp.buffer;
    }

    const onData = ( recordedBlob ) => {
        //console.log( 'chunk of real-time data is: ', recordedBlob );
        //console.log( 'arrayBuffer of the blob: ', recordedBlob.arrayBuffer );
        //console.log( 'blob chunk array: ', blobChunkArray );
        setBlobChunkArray( blobChunkArray.push( recordedBlob ) );
        setBlobChunkArray( [ ...blobChunkArray, recordedBlob ] );

        const prevArray = [ ...blobChunkArray ];
        const tempArray = prevArray.push( recordedBlob );
        //console.log( prevArray );
        // setBlobChunkArray( tempArray );
        //console.log( blobChunkArray.length );
        ( blobChunkArray.length === 20 ) && setBlobChunkArray( 'blobChunkArray' );
        ( blobChunkArray.length === 20 ) && setBlobAppended( blobChunkArray );

        console.log( countRef.current );
        setCount( countRef.current + 1 );
        ( countRef.current === 20 ) && setCount( 0 );

    }

    useEffect( () => {
        console.log( '============= blob appended updated =============' );
        console.log( 'appended blob: ', blobAppended );
        //console.log( '============= arrayBuffer appended =============' );
        //console.log( arrayBufferAppended );
        setBlobChunkArray( [] );
        //console.log( 'blob array: ', [ ...blobChunkArray ] );
        //console.log( 'blob array legth: ', blobChunkArray.length );
    }, [ blobAppended ] )


    const onStop = ( recordedBlob ) => {
        setBlobRecorded( recordedBlob );
        setBlobAppended( [ ...blobChunkArray ] )
        setBlobChunkArray( [] );

        const blobTemp = new Blob( [ arrayBufferAppended ], { type: "audio/wav" } );
        const myURL = window.URL || window.webkitURL;
        const audioSrc = myURL.createObjectURL( blobTemp );
        const tmp = new Audio( audioSrc ); //passing your state (hook)
        tmp.play() //simple play of an audio element. 

    }



    ////// Play and download after recording
    const playRecording = () => {
        if( !blobRecorded ) return
        const tmp = new Audio( blobRecorded.blobURL ); //passing your state (hook)
        tmp.play() //simple play of an audio element. 
    }

    useEffect( () => {
        if( !blobRecorded ) return
        const myURL = window.URL || window.webkitURL;
        const blobURL = myURL.createObjectURL( blobRecorded.blob );
        setDownloadUrl( blobURL );
    }, [ blobRecorded ] )



    ////// Functions to convert and send blobs to transcribe
    const blobToArray = () => {
        const reader = new FileReader();
        reader.readAsArrayBuffer( blobRecorded.blob );
        reader.onloadend = function () {
            //console.log( reader.result )
            const buffer8 = new Uint8Array( reader.result );
            //const updatedBufferAppended = appendBuffer( arrayBufferAppended, buffer8 );
            //setArrayBufferAppended( updatedBufferAppended );
        }
    }

    const blobToBase64 = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecorded.blob );
        reader.onloadend = function () {
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent audio: ' + recordString.slice( -100 ) )
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
        const appendedTranscript = [ transcriptAppended, transcriptChunk ]
        console.log( appendedTranscript )
        setTranscriptAppended( appendedTranscript.join( ' ' ) );
    }


    //////// Activate the cunstions
    useEffect( () => {
        //console.log( 'blob updated' );
        ( blobRecorded !== null ) && blobToBase64();
    }, [ blobRecorded ] )

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
        ( !isRecording ) && setTranscript( transcriptAppended );
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

            { typeof window !== `undefined` &&  // need inline if for the same reason as import
                <ReactMic
                    record={ isRecording }
                    className="sound-wave"
                    onStop={ onStop }
                    onData={ onData }
                    strokeColor="white"
                    backgroundColor="black"
                    timeSlice={ 3000 } // maybe not working
                />
            }

            <Button
                //style={{marginTop: '10px'}}
                //variant="contained"
                //color="primary"
                cta={ isRecording ? 'End' : 'Start!' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>
            <button onClick={ initialiseMediaRecorder }>initialise media recorder</button>

            <button onClick={ playRecording }>play recording</button>
            <button onClick={ () => {
                console.log( 'blob chunk array: ', blobChunkArray );
                console.log( blobChunkArray.length );
            } }>check blob chunk array</button>
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
