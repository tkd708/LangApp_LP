import React, { useState, useEffect, useRef } from 'react';
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

import TranscribeLangs from './transcribeLangs.json';

import { v4 as uuidv4 } from 'uuid';

const AudioRecorder = () => {
    const [ streamMic, setStreamMic ] = useState( null ); //
    const [ streamScreen, setStreamScreen ] = useState( null ); //
    const [ streamCombined, setStreamCombined ] = useState( null ); //

    const [ mediaRecorderMic, setMediaRecorderMic ] = useState( null ); //
    const [ blobArrayMic, setBlobArrayMic ] = useState( [] );
    const blobArrayMicRef = useRef( blobArrayMic )
    useEffect( () => {
        blobArrayMicRef.current = blobArrayMic
    }, [ blobArrayMic ] )

    const [ mediaRecorderScreen, setMediaRecorderScreen ] = useState( null ); //
    const [ blobArrayScreen, setBlobArrayScreen ] = useState( [] );
    const blobArrayScreenRef = useRef( blobArrayScreen )
    useEffect( () => {
        blobArrayScreenRef.current = blobArrayScreen
    }, [ blobArrayScreen ] )

    const [ mediaRecorderCombined, setMediaRecorderCombined ] = useState( null ); //
    const [ blobArrayCombined, setBlobArrayCombined ] = useState( [] );
    const blobArrayCombinedRef = useRef( blobArrayCombined )
    useEffect( () => {
        blobArrayCombinedRef.current = blobArrayCombined
    }, [ blobArrayCombined ] )

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

    const [ blobAppendedCombined, setBlobAppendedCombined ] = useState( null );
    const [ downloadUrl, setDownloadUrl ] = useState( null );

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

    const [ transcriptArrayPartner, setTranscriptArrayPartner ] = useState( [] );
    const transcriptArrayPartnerRef = useRef( transcriptArrayPartner )
    useEffect( () => {
        transcriptArrayPartnerRef.current = transcriptArrayPartner
    }, [ transcriptArrayPartner ] )
    const [ transcriptArrayMinPartner, setTranscriptArrayMinPartner ] = useState( [] );

    const [ transcript, setTranscript ] = useState( null );

    const [ transcribeLang, setTranscribeLang ] = useState( 'en-US' );

    const [ vocab1, setVocab1 ] = useState( '' );
    const [ vocab2, setVocab2 ] = useState( '' );
    const [ vocab3, setVocab3 ] = useState( '' );
    const [ vocab4, setVocab4 ] = useState( [ "especially", "durable", "collaborate" ] );
    const [ vocab5, setVocab5 ] = useState( [ "affordable", "exclusively", "estimate", "retrieve", "variation" ] );

    const uuid = uuidv4();
    //console.log( uuid );
    const myURL = typeof window !== `undefined` ? window.URL || window.webkitURL : ''

    const initialiseMediaStreams = () => {
        navigator.mediaDevices.getUserMedia( {
            audio: true,
            video: false
        } ).then( stream => {
            //console.log( 'mic stream', stream );
            setStreamMic( stream )
            constructMediaRecorderMic( stream )
        } ).catch( error => {
            console.log( error );
        } )

        navigator.mediaDevices.getDisplayMedia( {
            audio: true,
            video: true
        } ).then( stream => {
            //console.log( 'screen stream', stream );
            setStreamScreen( stream )
            constructMediaRecorderScreen( stream )
        } ).catch( error => {
            console.log( error );
        } )
    }

    ///// Make a combined stream //////
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
        constructMediaRecorderCombined( destination.stream )

    }, [ streamMic, streamScreen ] )

    //////////////// Construct a media recorder for mic
    const constructMediaRecorderMic = ( streamMic ) => {

        const recorder = new MediaRecorder( streamMic, {
            mimeType: 'audio/webm;codecs=opus',
            audioBitsPerSecond: 16 * 1000
        } );
        recorder.addEventListener( 'start', () => {
            setBlobArrayMic( [] );
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                setBlobArrayMic( [ ...blobArrayMicRef.current, e.data ] )

            }
        } );
        recorder.addEventListener( 'stop', () => {
            const blob = new Blob( blobArrayMicRef.current, { 'type': 'audio/webm;codecs=opus' } );
            const speaker = 'you'
            blobToBase64( blob, speaker )
        } );
        setMediaRecorderMic( recorder );
    }

    ///////////////// Construct a media recorder for screen
    const constructMediaRecorderScreen = ( streamScreen ) => {

        const recorder = new MediaRecorder( streamScreen, {
            mimeType: 'video/webm;codecs=vp8',
            audioBitsPerSecond: 16 * 1000
        } );
        recorder.addEventListener( 'start', () => {
            setBlobArrayScreen( [] )
        } );
        recorder.addEventListener( 'dataavailable', ( e ) => {
            if( e.data.size > 0 ) {
                setBlobArrayScreen( [ ...blobArrayScreenRef.current, e.data ] )
            }
        } );
        recorder.addEventListener( 'stop', () => {
            const blob = new Blob( blobArrayScreenRef.current, { 'type': 'audio/webm;codecs=opus' } );
            const speaker = 'partner'
            blobToBase64( blob, speaker )

        } );
        setMediaRecorderScreen( recorder );
    }

    ///////////////// Construct a media recorder combined ///////////////////////
    const constructMediaRecorderCombined = ( streamCombined ) => {

        const recorderCombined = new MediaRecorder( streamCombined, { mimeType: 'video/webm; codecs=vp9' } )

        recorderCombined.addEventListener( 'start', () => {
            setBlobArrayCombined( [] )
        } );

        recorderCombined.addEventListener( 'dataavailable', ( e ) => {
            if( e.data && e.data.size > 0 ) {
                setBlobArrayCombined( [ ...blobArrayCombinedRef.current, e.data ] )
            }
        } );

        recorderCombined.addEventListener( 'stop', () => {
            // console.log( 'blob chunk array from both', blobChunkArray )
            const blob = new Blob( blobArrayCombinedRef.current, { 'type': 'audio/wav;codecs=opus' } );
            setBlobAppendedCombined( blob )
        } );

        setMediaRecorderCombined( recorderCombined );
        // console.log( 'recorder combined constructed', recorderCombined );
    }


    /////////////// Audio recorder operation ////////////////
    const startRecording = () => {
        if( !mediaRecorderCombined ) {
            alert( "スピーカー音声を録音するため、画面と音声の共有を許可してください。" );
            return;
        }
        /// delete previous records if exist
        setTranscriptArrayYou( [] )
        setTranscriptArrayMinYou( [] )
        setTranscriptArrayPartner( [] )
        setTranscriptArrayMinPartner( [] )
        setTranscript( null )
        setDownloadUrl( null )

        setIsRecording( true );
        startMediaRecorders();
        mediaRecorderCombined.start( 1000 )

        const startTime = new Date();
        setStartTime( startTime.getTime() );
        // console.log( 'recoding started' );
    }

    const startMediaRecorders = () => {
        console.log( 'recorders on' )
        mediaRecorderMic.start( 1000 );
        mediaRecorderScreen.start( 1000 );
        setTimeout( () => { repeatMediaRecorders(); }, 10000 );
    }

    const repeatMediaRecorders = () => {
        if( !isRecordingRef.current ) return
        console.log( 'recorders off' )
        mediaRecorderMic.stop();
        mediaRecorderScreen.stop();
        startMediaRecorders()
    }

    const stopRecording = () => {
        setIsRecording( false );
        mediaRecorderCombined.stop()
        mediaRecorderMic.stop()
        mediaRecorderScreen.stop()

        const endTime = new Date();
        setEndTime( endTime.getTime() );
        // console.log( 'recoding ended' );
    }

    const playMediaRecorderCombined = () => {
        if( !blobAppendedCombined ) return
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        const tmp = new Audio( blobURL );
        tmp.play()
    }

    const stopMediaRecorderCombined = () => {
    }

    useEffect( () => {
        if( !blobAppendedCombined ) return
        const blobURL = myURL.createObjectURL( blobAppendedCombined );
        setDownloadUrl( blobURL );
    }, [ blobAppendedCombined ] )



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
    const sendGoogle = ( recordString, speaker ) => {
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
                //console.log( 'transcript :', res.data.transcript === '' );
                ( speaker === 'you' ) ?
                    setTranscriptArrayYou( [ ...transcriptArrayYouRef.current, res.data.transcript ] ) :
                    setTranscriptArrayPartner( [ ...transcriptArrayPartnerRef.current, res.data.transcript ] );
                //( speaker === 'you' ) ?
                //    console.log( 'script array you: ', transcriptArrayYouRef.current ) :
                //    console.log( "script array partner", transcriptArrayPartnerRef.current );

                const transcribedTime = new Date();
                console.log( 'transcribed from', speaker, ( ( transcribedTime.getTime() - startTimeRef.current ) / 1000 ), 'seconds after starting ', res.data.transcript );
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
            } );
    }


    //////////////////////// Make transcript array into another array per minute
    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript
        if( transcriptArrayYou.length === 0 ) return
        const transcriptArrayMinAppended = []
        for( let i = 0; i < transcriptArrayYou.length / 6; i++ ) {
            const transcriptArrayMin = transcriptArrayYou.slice( 0 + i * 6, 6 + i * 6 ).join( ' ' )
            transcriptArrayMinAppended.push( transcriptArrayMin )
        }
        setTranscriptArrayMinYou( transcriptArrayMinAppended );
    }, [ transcriptArrayYou ] )

    useEffect( () => {
        // Active only for the last chunk of transcription and then finalise the transcript
        if( transcriptArrayPartner.length === 0 ) return
        const transcriptArrayMinAppended = []
        for( let i = 0; i < transcriptArrayPartner.length / 6; i++ ) {
            const transcriptArrayMin = transcriptArrayPartner.slice( 0 + i * 6, 6 + i * 6 ).join( ' ' )
            transcriptArrayMinAppended.push( transcriptArrayMin )
        }
        setTranscriptArrayMinPartner( transcriptArrayMinAppended );
    }, [ transcriptArrayPartner ] )


    ///////////////// The whole transcript of YOU after finishing the recording
    useEffect( () => {　// Active only for the last chunk of transcription and then finalise the transcript
        ( !isRecording && transcriptArrayYou.length !== 0 ) && setTranscript( transcriptArrayYou.join( ' ' ) );
        //console.log('last chunk of transcript appended');
    }, [ transcriptArrayYou ] )

    useEffect( () => {
        //( !isRecording && transcriptArrayPartner.length !== 0 ) && setTranscript( transcriptArrayPartner.join( ' ' ) );
    }, [ transcriptArrayPartner ] )

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
            if( x === '' || x === 'a' || x === 'the' ||
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

    }, [ transcript ] )


    /////////////// Form Send ////////////////
    const sendNetlifyForm = () => {
        const url = 'https://langapp.netlify.app/';

        const headers = {
            'authority': 'langapp.netlify.app',
            'cache-control': 'max-age=0',
            'upgrade-insecure-requests': '1',
            'origin': 'https://langapp.netlify.app',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'referer': 'https://langapp.netlify.app/',
            'accept-language': 'ja,en-GB;q=0.9,en;q=0.8,en-US;q=0.7,es;q=0.6',
            'cookie': '_ga=GA1.3.1556620205.1604828616; _gid=GA1.3.1616654157.1606885023'
        };

        const dataString = 'form-name=contact' + '^&name=testhttprequest' + '&email=test%40mail';

        axios
            .request( {
                url,
                method: 'POST',
                headers: headers,
                body: dataString
            } )
            .then( ( res ) => {
                //console.log(res)
            } )
            .catch( ( err ) => {
                console.log( err );
            } );
    }

    const sendAWS = () => {
        const reader = new FileReader();
        reader.readAsDataURL( blobAppendedCombined );
        reader.onloadend = function () {
            console.log( 'audio string head: ' + reader.result.toString().slice( 0, 100 ) )
            const audioString = reader.result.toString().replace( 'data:audio/wav;codecs=opus;base64,', '' );
            console.log( 'sent audio to AWS as string of', audioString.slice( -100 ) )

            const url = 'https://langapp.netlify.app/.netlify/functions/aws-s3';

            const recordingName = 'recording.wav'

            axios
                .request( {
                    url,
                    method: 'POST',
                    data: {
                        uuid: uuid,
                        audio: audioString,
                        recordingName: recordingName
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
            <p>実際にオンライン英会話を録音してみましょう！(マイク付きイヤフォン推奨)</p>
            <p>STEP 1: スピーカーからの音声記録のために下記ボタンから画面と音声の共有を許可してください。</p>

            <button style={ { margin: '10px' } } onClick={ () => initialiseMediaStreams() }> 画面と音声の共有を許可 </button>

            <p>STEP 2: 下記ボタンから録音を開始しして、普段通りのオンライン英会話にお戻りください。</p>

            <Button
                //style={{marginTop: '10px'}}
                //variant="contained"
                //color="primary"
                cta={ isRecording ? '録音を終了' : '会話の録音を開始' } // from the template
                onClick={ () => { isRecording ? stopRecording() : startRecording() } }
            >
            </Button>

            <p>マイクからの音声は「あなた」に、スピーカーからの音声は「相手」に記録されます！</p>

            <div style={ { display: 'flex', flexDirection: 'row' } }>
                <Card style={ { width: '40vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>相手</Typography>
                    </CardContent>
                    { transcriptArrayMinPartner.slice( 0, 5 ).map( ( object, i ) => {
                        return (
                            <CardContent>
                                <Typography color="textSecondary">{ "--- Time 00:0" + i + ":00 ---" }</Typography>
                                <Typography key={ i }>{ object }</Typography>
                                {( i === 4 ) && <Typography>{ '5分以上の書き起こしは下記登録フォームから録音された会話をご送付ください！' }</Typography> }
                            </CardContent>
                        )
                    } ) }
                </Card>
                <Card style={ { width: '40vw', margin: '20px' } } >
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>あなた</Typography>
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
            </div>

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
            { ( !isRecording && blobAppendedCombined !== null ) &&
                // ( transcript !== null ) &&
                <div>
                    {/*<p>いかがでしたでしょうか？5分間の会話の書き起こしだけでも、多くの気づきや学びがあるのではないでしょうか。録音された会話全体の書き起こしや、さらなる詳細な分析結果を確認してみませんか？</p>*/ }
                    <button style={ { margin: '20px' } } onClick={ playMediaRecorderCombined }> 録音した会話を再生 </button>
                    {/*<button style={ { margin: '20px' } } onClick={ stopMediaRecorderCombined }> 再生停止 </button>*/ }

                    <p>STEP 3: 下記フォームより会話の音声を送付していただければ、詳細な分析レポートを指定の連絡先にお届けいたします！</p>

                    {/*<a href={ downloadUrl } download="recording" id="download">
                        { ( downloadUrl !== null ) ? ( <button style={ { marginBottom: '50px' } }>会話の音声ファイルをダウンロード</button> ) : '' }
                    </a>*/}

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

                                <div className="input-area" style={ { display: 'none' } }>
                                    <input type="text" name="uuid" aria-label="uuid" value={ uuid } />
                                    <label className="label-name" for="uuid">
                                        <span className="content-name">uuid</span>
                                    </label>
                                </div>

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

                                {/*<div className="input-area">
                                    <input type="file" name="audio" aria-label="audio" required />
                                    <label className="label-name" for="audio">
                                        <span className="content-name">音声ファイル</span>
                                    </label>
                                </div>

                                <div className="input-area">
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
                                    <input type="text" name="Transcript_partner" aria-label="Transcript_partner" value={ transcriptArrayMinPartner } />
                                    <label className="label-name" for="Transcript_partner">
                                        <span className="content-name">Transcript_partner</span>
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

                                <div className="input-area button-area" style={ { marginBottom: '30px' } }   >
                                    <Button
                                        label="Send Contact Form"
                                        cta={ "送信" }
                                        onClick={ sendAWS }
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
