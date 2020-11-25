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

//import { ReactMic } from 'react-mic'; // only local
const { ReactMic } = typeof window !== `undefined` ? require( "react-mic" ) : '' //"window" is not available during server side rendering.

import TranscribeLangs from './transcribeLangs.json';

const AudioRecorder = () => {
    const [ isRecording, setIsRecording ] = useState( false );
    const [ isLongRecording, setIsLongRecording ] = useState( false );
    const [ blobRecorded, setBlobRecorded ] = useState( null );
    const [ recordString, setRecordString ] = useState( null );

    const [ transcriptChunk, setTranscriptChunk ] = useState( null );
    const [ transcriptAppended1, setTranscriptAppended1 ] = useState( null );
    const [ transcriptAppended2, setTranscriptAppended2 ] = useState( null );
    const [ transcript, setTranscript ] = useState( '' );
    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );
    const [ startTime, setStartTime ] = useState( '' ); // milliseconds
    const [ endTime, setEndTime ] = useState( '' ); // milliseconds

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );


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
        console.log( 'recordedBlob is: ', recordedBlob );
        setBlobRecorded( recordedBlob );
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
            console.log( 'sent audio: ' + recordString.slice( -100 ) )
            setRecordString( recordString )
        }
    }

    const sendGoogle = () => {
        const url = 'https://langapp.netlify.app/.netlify/functions/speech-to-text-dialisation';

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
        const transcript1 = [];
        const transcript2 = [];

        transcriptChunk.forEach( ( a ) =>
            console.log( a ),
            console.log( ` word: ${ a.word }, speakerTag: ${ a.speakerTag }, start: ${ a.startTime.seconds }.${ a.startTime.nanos }, end: ${ a.endTime.seconds }.${ a.endTime.nanos }` ),
            ( a.speakerTag == 1 )
                ? transcript1.push( a.word )
                : transcript2.push( a.word )
        );
        console.log( 'Speaker 1: ' + transcript1.join( ' ' ) )
        console.log( 'Speaker 2: ' + transcript2.join( ' ' ) )

        const appendedTranscript1 = [ transcriptAppended1, transcript1 ]
        const appendedTranscript2 = [ transcriptAppended2, transcript2 ]
        console.log( appendedTranscript1 )
        console.log( appendedTranscript2 )
        setTranscriptAppended1( appendedTranscript1.join( ' ' ) );
        setTranscriptAppended2( appendedTranscript2.join( ' ' ) );
    }

    useEffect( () => {
        console.log( 'blob updated' );
        ( blobRecorded !== null ) && blobToBase64();

        // Repeat recording during the long recording
        ( isLongRecording ) && repeatRecoridng();

        // Last chunk
        ( !isLongRecording ) && ( console.log( 'last chunk of blob' ) )
    }, [ blobRecorded ] )

    useEffect( () => {
        console.log( 'audio string updated' );
        ( recordString !== null ) && sendGoogle();

        // Last chunk
        ( !isLongRecording ) && ( console.log( 'last chunk of audio string' ) )
    }, [ recordString ] )

    useEffect( () => {
        console.log( 'transcript chunk updated' );
        ( transcriptChunk !== null ) && appendTranscript();
    }, [ transcriptChunk ] )


    // tentatively focusing on Speaker1
    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript
        ( !isLongRecording ) && setTranscript( transcriptAppended1 );

        //console.log('last chunk of transcript appended');
    }, [ transcriptAppended1 ] )

    const repeatRecoridng = () => {
        startRecording();
        console.log( 'repeated recording resumed' )
        setTimeout( () => { stopRecording() }, 30000 );
        console.log( 'repeated recording cut' )
    }
    const startLongRecording = () => {
        const start = new Date();
        setStartTime( start.getTime() );

        setIsLongRecording( true );
        setTranscriptAppended1( '' )
        setTranscriptAppended2( '' )
        repeatRecoridng();
        console.log( 'long recoding started' );
    }


    const stopLongRecording = () => {
        const end = new Date();
        setEndTime( end.getTime() );

        setIsLongRecording( false );
        stopRecording();
        console.log( 'long recoding ended' )
    }

    const vocabAnalysis = () => {
        const transcriptArray = transcript.split( " " );
        setVocab1( transcriptArray.length );
        const conversationLength = ( endTime - startTime ) / 1000 / 60;
        setVocab2( ( transcriptArray.length / conversationLength ).toFixed( 1 ) );
        const uniq = [ ...new Set( transcriptArray ) ];
        setVocab3( uniq.length * 100 );
    }

    useEffect( () => {
        ( transcript !== null ) && vocabAnalysis();
    }, [ transcript ] )


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
                //style={{marginTop: '10px'}}
                //variant="contained"
                //color="primary"
                cta={ isLongRecording ? 'End' : 'Start!' } // from the template
                onClick={ () => { isLongRecording ? stopLongRecording() : startLongRecording() } }
            >
            </Button>

            <div
                style={ { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' } }
            >
                <Card style={ { width: '40vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Speaker1</Typography>
                        <Typography>{ transcriptAppended1 }</Typography>
                    </CardContent>
                </Card>
                <Card style={ { width: '40vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>Speaker2</Typography>
                        <Typography>{ transcriptAppended2 }</Typography>
                    </CardContent>
                </Card>
            </div>

            { ( transcript !== null ) &&
                <Card style={ { width: '100%', marginTop: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>今回の会話の分析結果はこちら！</Typography>
                        <Typography>{ 'Transcript: ' + transcript }</Typography>
                        <Typography>{ `今回の会話での単語数: ${ vocab1 } ...前回から +10!` }</Typography>
                        <Typography>{ `今回の会話での流暢さ(word per minute): ${ vocab2 } ...前回から +5!` }</Typography>
                        <Typography>{ `累計の語彙数(仮): ${ vocab3 } ...前回から+3!` }</Typography>
                        <Typography>{ `前回の課題から話せた単語(仮): ${ vocab4.join( ", " ) } ...3/5達成！` }</Typography>
                        <Typography>{ `次回使ってみては？: ${ vocab5.join( ", " ) }` }</Typography>
                    </CardContent>
                </Card>
            }

        </div>

    );
}

export default AudioRecorder;
