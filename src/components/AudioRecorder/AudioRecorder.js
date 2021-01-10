import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';
import Button from "../Button/button"

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import StopIcon from '@material-ui/icons/Stop';
import GetAppIcon from '@material-ui/icons/GetApp';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import TranscribeLangs from './transcribeLangs.json';

import { v4 as uuidv4 } from 'uuid';

const AudioRecorder = () => {
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

    const [ mediaRecorderMic, setMediaRecorderMic ] = useState( null ); //
    const [ blobArrayMic, setBlobArrayMic ] = useState( [] );
    const blobArrayMicRef = useRef( blobArrayMic )
    useEffect( () => {
        blobArrayMicRef.current = blobArrayMic
    }, [ blobArrayMic ] )

    const [ mediaRecorderMicLong, setMediaRecorderMicLong ] = useState( null ); //
    const [ blobArrayMicLong, setBlobArrayMicLong ] = useState( [] );
    const blobArrayMicLongRef = useRef( blobArrayMicLong )
    useEffect( () => {
        blobArrayMicLongRef.current = blobArrayMicLong
    }, [ blobArrayMicLong ] )


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

    //console.log( uuid );
    const myURL = typeof window !== `undefined` ? window.URL || window.webkitURL : ''
    const intervalSeconds = 60; // interval of the repeating audio recording

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
                setBlobArrayMic( [ ...blobArrayMicRef.current, e.data ] )
            }
        } );
        recorder.addEventListener( 'stop', () => {
            const blob = new Blob( blobArrayMicRef.current, { 'type': 'audio/webm;codecs=opus' } );
            const speaker = 'you'
            blobToBase64( blob, speaker );
            console.log( 'blob length was...', blobArrayMicRef.current.length );
            setBlobArrayMic( [] );
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
        recorderLong.addEventListener( 'start', () => {
            setBlobArrayMicLong( [] );
        } );
        recorderLong.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                setBlobArrayMicLong( [ ...blobArrayMicLongRef.current, e.data ] )
            }
        } );
        recorderLong.addEventListener( 'stop', () => {
            const blob = new Blob( blobArrayMicLongRef.current, { 'type': 'audio/webm;codecs=opus' } );
            setBlobAppendedLong( blob )
        } );
        setMediaRecorderMicLong( recorderLong );
        //console.log( 'mic recorder long set...', recorderLong );
    }


    // initialise recorders
    useEffect( () => {
        constructMediaRecorderMic()
        constructMediaRecorderMicLong();
    }, [] )


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
        mediaRecorderMicLong.start( 1000 )

        const startTime = new Date();
        setStartTime( startTime.getTime() );
        // console.log( 'recoding started' );
    }

    const startMediaRecorders = () => {
        console.log( 'recorders on' )
        mediaRecorderMic.start( 1000 );
        setTimeout( () => { repeatMediaRecorders(); }, intervalSeconds * 1000 - 100 );
    }


    const repeatMediaRecorders = () => {
        if( !isRecordingRef.current ) return
        console.log( 'recorders off' )
        mediaRecorderMic.stop();
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        mediaRecorderMic.stop()
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
        sendAWS( blobAppendedLong );

        const tmp = new Audio( blobURL );
        setAudioPlayer( tmp );
        console.log( 'audioPlayer...', tmp )
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
        const reader = new FileReader();
        reader.readAsDataURL( blob );
        reader.onloadend = function () {
            //console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
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
        const vocabCountArray = [];
        transcriptWordArray.forEach( ( e ) => {
            const x = e.toLowerCase();
            if( x === 'yes' || x === 'no' || x === 'yeah' || x === 'ok' || x === 'okay' ||
                x === '' || x === 'a' || x === 'the' ||
                x === 'i' || x === 'my' || x === 'me' || x === 'mine' || x === 'you' || x === 'your' || x === 'yours' ||
                x === 'he' || x === 'him' || x === 'his' || x === 'she' || x === 'her' || x === 'hers' ||
                x === 'we' || x === 'us' || x === 'our' || x === 'ours' || x === 'they' || x === 'them' || x === 'thier' || x === 'thiers' ||
                x === 'it' || x === 'this' || x === 'that' || x === 'there' ||
                x === 'and' || x === 'but' ||
                x === 'at' || x === 'in' || x === 'on' || x === 'of' || x === 'from' || x === 'for' || x === 'to' ||
                x === 'am' || x === 'are' || x === 'is' || x === 'be'
            ) return
            vocabCounts[ x ] = ( vocabCounts[ x ] || 0 ) + 1;
        } );
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
            .then( ( res ) => { console.log( 'report to LINE bot success...', res ) } )
            .catch( ( err ) => { console.log( 'report to LINE bot error...', err ) } )

    }, [ transcript ] )


    /////////////// send the full audio file to AWS
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
                        appID: appID,
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
            <p>*音声ファイルの送信に不具合が生じているため、一時的にtake708gym[at]gmail.comまでメール添付でのご送付をお願いしております。ご不便をおかけして大変申し訳ございません。一刻も早い復旧に向けて作業を進めております。</p>
            <p>実際にオンライン英会話を録音してみましょう！(マイク付きイヤホン推奨)</p>
            <TextField
                required
                id="filled-required"
                label="お名前" // to be replaced with LangApp ID
                variant="filled"
                value={ appID }
                onChange={ ( e ) => { ( !isRecording ) && setAppID( e.target.value ); } }
                inputProps={ {
                    style: { backgroundColor: 'white' },
                } }
            />
            <Button
                //style={{marginTop: '10px'}}
                //variant="contained"
                //color="primary"
                cta={ isRecording ? '録音を終了' : '会話の録音を開始' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>
            { ( !isRecording && blobAppendedLong !== null ) &&
                // ( transcript !== null ) &&
                <div>
                    {/*<p>いかがでしたでしょうか？5分間の会話の書き起こしだけでも、多くの気づきや学びがあるのではないでしょうか。録音された会話全体の書き起こしや、さらなる詳細な分析結果を確認してみませんか？</p>*/ }
                    <PlayArrowIcon style={ { fontSize: 40 } } onClick={ () => { audioRecordPlay(); } }></PlayArrowIcon>
                    <PauseIcon style={ { fontSize: 40 } } onClick={ () => { audioRecordPause(); } }></PauseIcon>
                    <StopIcon style={ { fontSize: 40 } } onClick={ () => { audioRecordStop(); } }></StopIcon>
                    <a href={ downloadUrl } download="recording" id="download"> <GetAppIcon style={ { fontSize: 40, color: "white" } } /></a>
                </div> }


            <Card style={ { width: '70vw', margin: '20px' } } >
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>書き起こし</Typography>
                </CardContent>
                { transcriptArrayMinYou.slice( 0, 5 ).map( ( object, i ) => {
                    return (
                        <CardContent>
                            <Typography color="textSecondary">{ "--- Time 00:0" + i + ":00 ---" }</Typography>
                            <Typography key={ i }>{ object }</Typography>
                            {( i === 4 ) && <Typography>{ '5分以上の書き起こしは下記登録フォームから録音された会話をご送付ください！' }</Typography> }
                        </CardContent>
                    )
                } ) }
            </Card>

            { ( transcript === null ) &&
                <p>会話の録音を終了し、分析が完了すると結果が以下に表示されます。</p> }

            { ( transcript !== null ) &&
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

            { ( !isRecording && blobAppendedLong !== null && isRecording ) && // the last condition must be removed to show the netlify form
                // ( transcript !== null ) &&
                <div>
                    {/*<p>いかがでしたでしょうか？5分間の会話の書き起こしだけでも、多くの気づきや学びがあるのではないでしょうか。録音された会話全体の書き起こしや、さらなる詳細な分析結果を確認してみませんか？</p>*/ }
                    <ContactWrapper id="contact">
                        <div className="content-container"
                            style={ { width: '80vw' } }>

                            <form
                                name="contact"
                                method="POST"
                                data-netlify="true"
                                data-netlify-honeypot="bot-field"
                            >
                                <input type="hidden" name="form-name" value="contact" />

                                <div className="input-area">
                                    <input type="text" name="name" aria-label="Name" required autoComplete="off" />
                                    <label className="label-name" for="name">
                                        <span className="content-name">名前</span>
                                    </label>
                                </div>

                                <div className="input-area">
                                    <input type="text" name="email" aria-label="Email" required autoComplete="off" />
                                    <label className="label-name" for="email">
                                        <span className="content-name">メールアドレス(あるいはご希望の連絡手段)</span>
                                    </label>
                                </div>

                                <div className="input-area">
                                    <input type="file" name="audio" aria-label="audio" required />
                                    <label className="label-name" for="audio">
                                        <span className="content-name">音声ファイル</span>
                                    </label>
                                </div>

                                {/*<div className="input-area">
                                    <textarea type="text" rows="5" name="opinion" aria-label="opinion" required autoComplete="off" />
                                    <label className="label-name" for="opinion">
                                        <span className="content-name" style={ { color: '#fff' } }>ご意見・ご要望など</span>
                                    </label>
                                </div> */}

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="Transcript_you" aria-label="Transcript_you" value={ transcriptArrayMinYou } />
                                    <label className="label-name" for="Transcript_you">
                                        <span className="content-name">Transcript_you</span>
                                    </label>
                                </div>

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="words_per_minute" aria-label="words_per_minute" value={ vocab2 } />
                                    <label className="label-name" for="words_per_minute">
                                        <span className="content-name">words_per_minute</span>
                                    </label>
                                </div>

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="vocab_size" aria-label="vocab_size" value={ vocab3 } />
                                    <label className="label-name" for="vocab_size">
                                        <span className="content-name">vocab_size</span>
                                    </label>
                                </div>

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="vocab_counts" aria-label="vocab_counts"
                                        value={ vocab4.map( ( x ) => `${ x.word }: ${ x.count } 回` ) } />
                                    <label className="label-name" for="vocab_counts">
                                        <span className="content-name">vocab_counts</span>
                                    </label>
                                </div>

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="error_reports" aria-label="error_reports"
                                        value={ transcribeErrorArrray.map( ( x ) => `Error: ${ x.errorMessage } received from ${ x.errorAt } at ${ x.errorTimeFromStartTime } seconds after starting` ) } />
                                    <label className="label-name" for="error_reports">
                                        <span className="content-name">error_reports</span>
                                    </label>
                                </div>

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="uuid" aria-label="uuid"
                                        value={ JSON.stringify( recordingID ) } />
                                    <label className="label-name" for="uuid">
                                        <span className="content-name">uuid</span>
                                    </label>
                                </div>

                                <div className="input-area button-area" style={ { marginBottom: '30px' } }   >
                                    <Button
                                        label="Send Contact Form"
                                        cta={ "送信" }
                                        //onClick={ sendAWS }
                                        type="submit"
                                    />
                                </div>
                            </form>
                        </div>
                    </ContactWrapper>

                </div>
            }




        </div >

    );
}

const ContactWrapper = styled.section`
  padding: 50px 30px;
  background-color: #fff;

  .content-container {
    width: 100%;
    margin: 0 auto;

    h2 {
      text-align: left;
      background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      @media (min-width: 768px) {
        text-align: center;
      }

          font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.0rem;
        }

        @media (min-width: 1200px) {
          font-size: 3.5rem;
        }

    }
    p {
      margin-bottom: 10px;
      color: black;

      @media (min-width: 768px) {
        text-align: center;
      }

         font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }
 
    }

    form {
      position: relative;
      overflow: hidden;

      .input-area {
        margin-bottom: 40px;
        position: relative;

        &.button-area {
          text-align: center;
          margin-bottom: 0;
        }
      }

      input,
      textarea {
        height: 100%;
        font-size: 1rem;
        letter-spacing: 0.25rem;
        padding: 20px;
        display: block;
        width: 100% !important;
        border: none;
        background-color: #0b132e;
        color: #fff;
        //text-transform: uppercase;
        position: relative;
        box-sizing: border-box;
        outline: none;

        &:focus,
        &:valid {
          + .label-name {
            .content-name {
              transform: translateY(-25%);
              font-size: 0.7rem;
              opacity: 0.2;
            }
            &::after {
              transform: translateX(0%);
            }
          }
        }
      }

      label {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        pointer-events: none;

        &::after {
          content: "";
          position: absolute;
          left: 0px;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, #f441a5, #03a9f4);
          width: 100%;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
      }

      .content-name {
        position: absolute;
        top: 10px;
        left: 20px;
        transition: all 0.3s ease;
        //text-transform: uppercase;
        letter-spacing: 0.25rem;
        font-size: 0.8rem;
      }
    }
  }
`

export default AudioRecorder;
