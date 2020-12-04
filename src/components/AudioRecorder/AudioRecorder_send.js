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
//const { ReactMic } = ''

import TranscribeLangs from './transcribeLangs.json';

import Contact from "../Contact/contact"


const AudioRecorder = () => {
    const [ isRecording, setIsRecording ] = useState( false );
    const [ blobRecorded, setBlobRecorded ] = useState( null );
    const [ recordString, setRecordString ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( '' );

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
        setBlobRecorded( recordedBlob );
        console.log( 'recordedBlob is: ', recordedBlob );
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
            setRecordString( recordString )
        }
        console.log( recordString )
    }



    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }
        >
            <div style={ { display: 'none' } }>
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
                style={ { marginTop: '10px' } }
                //variant="contained"
                //color="primary"
                cta={ isRecording ? 'End' : 'Start!' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>

            <Button
                style={ { marginTop: '10px' } }
                cta={ 'Play!' } // from the template
                onClick={ () => { playRecording() } }
            >
            </Button>

            <Button
                style={ { marginTop: '10px' } }
                cta={ 'Convert recording' } // from the template
                onClick={ () => { blobToBase64() } }
            >
            </Button>

            <Contact
                id="contact"
                audio={ recordString }
            />
        </div>

    );
}

export default AudioRecorder;
