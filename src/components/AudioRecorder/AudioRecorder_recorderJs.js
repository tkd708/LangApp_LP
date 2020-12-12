import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from "styled-components"
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
//const { ReactMic } = ''

import Recorder from 'recorder-js';

const browserLang = 'ja' // tentatively all in Japanese
//(typeof window !== `undefined`)
//? (window.navigator.languages && window.navigator.languages[0]) ||
//         window.navigator.language ||
//         window.navigator.userLanguage ||
//         window.navigator.browserLanguage
// : ''; 


const AudioRecorder = () => {
    const [ isRecording, setIsRecording ] = useState( false );
    const [ recorder, setRecorder ] = useState( null );
    const [ blobRecorded, setBlobRecorded ] = useState( null );
    const [ recordString, setRecordString ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( '' );


    const initialiseRecording = () => {
        const audioContext = new ( window.AudioContext || window.webkitAudioContext )();

        const recorder = new Recorder( audioContext, {
            //onAnalysed: data => console.log(data),
            //numChannels: 2
        } );

        setRecorder( recorder )

        //navigator.mediaDevices.enumerateDevices()
        //    .then( function ( devices ) {
        //        devices.forEach( function ( device ) {
        //            //console.log( device.kind + ": " + device.label + " id = " + device.deviceId );
        //            ( device.kind === 'audiooutput', device.deviceId === 'default' ) &&
        //                navigator.mediaDevices.getUserMedia( { audio: { deviceId: { exact: device.deviceId } } } )
        //                    .then( stream => recorder.init( stream ) )
        //                    .catch( err => console.log( 'Uh oh... unable to get stream...', err ) );
        //        } );
        //    } )
        //    .catch( function ( err ) {
        //        console.log( err.name + ": " + err.message );
        //    } );

        navigator.mediaDevices.getUserMedia( { audio: true } )
            .then( stream => recorder.init( stream ) )
            .catch( err => console.log( 'Uh oh... unable to get stream...', err ) );
    }

    const startRecording = () => {
        recorder.start()
            .then( () => setIsRecording( true ) );
    }

    const stopRecording = () => {
        recorder.stop()
            .then( ( { blob, buffer } ) => {
                setBlobRecorded( blob )
                console.log( blob )
            } )
            .then( () => setIsRecording( false ) );
    }

    const playRecording = () => {
        const myURL = window.URL || window.webkitURL
        const blobURL = myURL.createObjectURL( blobRecorded );
        setDownloadUrl( blobURL )
        const tmp = new Audio( blobURL ); //passing your state (hook)
        tmp.play() //simple play of an audio element. 
    }

    const blobToBase64 = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobRecorded );
        reader.onloadend = function () {
            console.log( reader.result )
            const recordString = reader.result.toString();//.replace( 'data:audio/webm;codecs=opus;base64,', '' );
            setRecordString( recordString )
        }
        console.log( recordString )
    }

    useEffect( () => {
        ( blobRecorded !== null ) && blobToBase64();

    }, [ blobRecorded ] )

    return (
        <div className="App">
            <div className="controls">
                <button onClick={ initialiseRecording }>initialise recording</button>
                <button onClick={ startRecording }>start recording</button>
                <button onClick={ stopRecording }>stop recording</button>
                <button onClick={ playRecording }>play recording</button>
                <a href={ downloadUrl } download id="download">Download</a>
            </div>
        </div>
    );

}


export default AudioRecorder;
