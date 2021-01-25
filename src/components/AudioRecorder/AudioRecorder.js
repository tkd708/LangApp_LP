import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';
import Button from "../Button/button";

import instructionImg from "../../images/line-bot-qr.png";
import lineButtonBase from "../../images/btn_login_base.png";
import lineButtonHover from "../../images/btn_login_hover.png";
import lineButtonPress from "../../images/btn_login_press.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLine } from '@fortawesome/free-brands-svg-icons'

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import GetAppIcon from '@material-ui/icons/GetApp';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import TranscribeLangs from './transcribeLangs.json';

import { v4 as uuidv4 } from 'uuid';

const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.

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


const AudioRecorder = () => {

    const [ lineLoginStatus, setLineLoginStatus ] = useState( false );
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

    const [ mediaRecorderMic, setMediaRecorderMic ] = useState( null ); //
    const [ mediaRecorderMicLong, setMediaRecorderMicLong ] = useState( null ); //
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

    const [ blobAppendedLong, setBlobAppendedLong ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( null );
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
    const [ transcriptArrayMinYou, setTranscriptArrayMinYou ] = useState( [] );

    const [ transcript, setTranscript ] = useState( null );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );

    const myURL = typeof window !== `undefined` ? window.URL || window.webkitURL : ''
    const intervalSeconds = 30; // interval of the repeating audio recording


    //////////////// Construct a media recorder for mic to be repeated for transcription
    const constructMediaRecorderMic = async () => {
        const streamMic = await navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            //console.log( 'mic stream', stream );
            return ( stream )
        } ).catch( error => {
            console.log( error );
        } )

        const recorder = new MediaRecorder( streamMic, {
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
        setMediaRecorderMic( recorder );
        //console.log( 'mic recorder set...', recorder );
    }

    //////////////// Construct a media recorder for mic long
    const constructMediaRecorderMicLong = async () => {
        const streamMic = await navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            //console.log( 'mic stream', stream );
            return ( stream )
        } ).catch( error => {
            console.log( error );
        } )

        const recorderLong = new MediaRecorder( streamMic, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 16 * 1000
        } );
        recorderLong.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                setBlobAppendedLong( e.data )
            }
        } );
        setMediaRecorderMicLong( recorderLong );
        //console.log( 'mic recorder long set...', recorderLong );
    }


    // initialise recorders
    useEffect( () => {
        constructMediaRecorderMic()
        constructMediaRecorderMicLong();

        ( typeof window !== `undefined` ) && liff.init( { liffId: process.env.GATSBY_LINE_LIFFID } )
            .then( () => {
                console.log( 'Success in LIFF initialisation' );
                liffFechID();
            } )
            .catch( err => window.alert( 'Error in LIFF initialisation: ' + err ) )
    }, [] )

    const liffFechID = async () => {
        if( liff.isLoggedIn() ) {
            const idToken = await liff.getIDToken();
            ( idToken ) && console.log( 'Success in fetching ID token' );
            setLineIdToken( idToken )
            setLineLoginStatus( true )
        }
    }

    const lineLogin = () => {
        !( liff.isLoggedIn() ) && liff.login( {} ) // ログインしていなければ最初にログインする
    }


    /////////////// Audio recorder operation ////////////////
    const startRecording = () => {
        const uuid = uuidv4();
        setRecordingID( uuid )

        // delete previous records if exist
        setTranscriptArrayYou( [] )
        setTranscriptArrayMinYou( [] )
        setTranscript( null )

        // stop and remove audio player
        audioRecordStop()
        setAudioPlayer( null )
        setDownloadUrl( null )

        setIsRecording( true );
        startMediaRecorders();
        mediaRecorderMicLong.start()

        const startTime = new Date();
        setStartTime( startTime.getTime() );
        // console.log( 'recoding started' );
    }

    const startMediaRecorders = () => {
        console.log( 'recorders on' )
        mediaRecorderMic.start();
        setTimeout( () => { repeatMediaRecorders(); }, intervalSeconds * 1000 );
    }


    const repeatMediaRecorders = () => {
        mediaRecorderMic.stop();
        console.log( 'recorders off' )
        if( !isRecordingRef.current ) return
        //mediaRecorderMic.stop();
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        //mediaRecorderMic.stop()
        mediaRecorderMicLong.stop()

        const endTime = new Date();
        setEndTime( endTime.getTime() );
        console.log( 'recoding ended, it took', ( endTime.getTime() - startTime ) / 1000, 'seconds' );
    }


    ///////////////// Recording is done >> generate download link and audio player as well as send the full audio to AWS S3
    useEffect( () => {
        if( !blobAppendedLong ) return
        const blobURL = myURL.createObjectURL( blobAppendedLong );
        setDownloadUrl( blobURL );
        //sendAWS( blobAppendedLong );

        const tmp = new Audio( blobURL );
        setAudioPlayer( tmp );
        //console.log( 'audioPlayer...', tmp )
    }, [ blobAppendedLong ] )

    /////// Operate audio palyer
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
    const blobToBase64 = ( blob, speaker ) => {
        const newBlob = new Blob( [ blob ], { type: blob.type } )
        const reader = new FileReader();
        reader.readAsDataURL( newBlob );
        reader.onloadend = function () {
            console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const recordString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
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
                        source: 'LP',
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
                    source: 'LP',
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



    ///////////// Make transcript array into another array per minute
    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript... n = 60 / interval seconds
        if( transcriptArrayYou.length === 0 ) return
        const transcriptArrayMinAppended = [];
        const n = 60 / intervalSeconds; // how many transcript chunks in the array per minute
        for( let i = 0; i < transcriptArrayYou.length / n; i++ ) {
            const transcriptArrayMin = transcriptArrayYou.slice( 0 + i * n, n + i * n ).join( ' ' )
            transcriptArrayMinAppended.push( transcriptArrayMin )
        }
        setTranscriptArrayMinYou( transcriptArrayMinAppended );
    }, [ transcriptArrayYou ] )



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


    /////////////// send the full audio file to AWS... not successful if the audio is too long, tentatively withdrawn
    const sendAWS = ( blob ) => {

        const reader = new FileReader();
        reader.readAsDataURL( blob );
        reader.onloadend = function () {
            console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const audioString = reader.result.toString().replace( 'data:audio/webm;codecs=opus;base64,', '' );
            console.log( 'sent audio to AWS as string of', audioString.slice( -100 ) )

            const url = 'https://langapp.netlify.app/.netlify/functions/aws-s3';

            axios
                .request( {
                    url,
                    method: 'POST',
                    data: {
                        lineIdToken: lineIdTokenRef.current,
                        recordingID: recordingID,
                        audio: audioString,
                    },
                } )
                .then( ( res ) => {
                    console.log( 'AWS by netlify functions success', res );
                } )
                .catch( ( err ) => {
                    console.log( 'AWS by netlify functions error', err );
                } );
        }
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

            <h2>英会話分析デモ</h2>
            <p>実際にオンライン英会話を録音してみましょう！</p>
            <p>LINE Bot「LangApp」(QRコード下記)と連動して記録・分析をお届けします！</p>
            <img src={ instructionImg } style={ { width: '300px', margin: '20px' } } />
            <p>{ lineLoginStatus ? 'LINEログイン完了です！録音を開始してください' : 'LINEにログインしてから録音を開始してください。' }</p>
            {
                !lineLoginStatus &&
                <img src={ lineButtonBase }//"../../images/btn_login_base.png"
                    style={ { width: '180px', marginBottom: '30px' } }
                    class="btn btn-block btn-social button"
                    onClick={ () => { lineLogin(); } } />
            }
            {/*<LineButtonWrapper>
                 <FontAwesomeIcon icon={ faLine } size="3x" class="icon" />
                <a id="line-button" class="btn btn-block btn-social button">
                    LINEでログイン
                </a>
            </LineButtonWrapper>*/}
            <Button
                style={ { margin: '20px' } }
                //variant="contained"
                //color="primary"
                cta={ isRecording ? '録音中...(クリックで終了)' : '会話の録音を開始' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>
            {
                ( !isRecording && blobAppendedLong !== null ) &&
                // ( transcript !== null ) &&
                <div>
                    {/*<p>いかがでしたでしょうか？5分間の会話の書き起こしだけでも、多くの気づきや学びがあるのではないでしょうか。録音された会話全体の書き起こしや、さらなる詳細な分析結果を確認してみませんか？</p>*/ }
                    <PlayArrowIcon style={ { fontSize: 40 } } onClick={ () => { audioRecordPlay(); } }></PlayArrowIcon>
                    <PauseIcon style={ { fontSize: 40 } } onClick={ () => { audioRecordPause(); } }></PauseIcon>
                    <StopIcon style={ { fontSize: 40 } } onClick={ () => { audioRecordStop(); } }></StopIcon>
                    <a href={ downloadUrl } download="recording" id="download"> <GetAppIcon style={ { fontSize: 40, color: "white" } } /></a>
                </div>
            }
            <Card style={ { width: '70vw', margin: '20px' } } >
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>書き起こし</Typography>
                </CardContent>
                { transcriptArrayMinYou.map( ( object, i ) => {
                    return (
                        <CardContent>
                            <Typography color="textSecondary">{ "--- Time 00:0" + i + ":00 ---" }</Typography>
                            <Typography key={ i }>{ object }</Typography>
                        </CardContent>
                    )
                } ) }
            </Card>
            {
                ( transcript === null ) &&
                <p>会話の録音を終了し、分析が完了すると結果が以下に表示されます。</p>
            }

            {
                ( transcript !== null ) &&
                <Card style={ { width: '80vw', marginTop: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>今回の"あなた"の会話の分析結果はこちら！</Typography>
                        <Typography>{ `流暢さ(word per minute): ${ vocab2 } ` }</Typography>
                        <Typography>{ `使用した単語数: ${ vocab3 } ` }</Typography>
                        <Typography>{ `使用頻度の高い単語 TOP5` }</Typography>
                        { vocab4.slice( 0, 5 ).map( ( x ) => {
                            return ( <Typography>{ `${ x.word }: ${ x.count } 回` }</Typography> )
                        } ) }
                    </CardContent>
                </Card>
            }

        </div >

    );
}

const LineButtonWrapper = styled.section`
.button { 
  color: #EEEEE;
  font-size: 15px;
  background-color: #00C300;  
}

.button:hover {
  color: #EEEEE;
  background-color: #00E000
}

.button:active {
  background-color: #00B300
}

.icon { 
  background-color: #EEEEE;
  color: #00C300;  
}

.icon:hover {
  background-color: #EEEEE;
  color: #00E000
}

.icon:active {
  color: #00B300
}
`

export default AudioRecorder;
