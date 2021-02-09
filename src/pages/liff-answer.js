import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';


//import liff from '@line/liff';
const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.



const LiffAnswer = () => {

    const [ lineIdToken, setLineIdToken ] = useState( '' );
    const [ taskList, setTaskList ] = useState( [] );
    const [ answer, setAnswer ] = useState( '' );


    // LIFF processes
    useEffect( () => {
        ( typeof window !== `undefined` ) && liff.init( { liffId: process.env.GATSBY_LINE_LIFFID_answer } )
            .then( () => {
                console.log( 'Success in LIFF initialisation' );
                liffFechID();
            } )
            .catch( err => window.alert( 'Error in LIFF initialisation: ' + err ) )
    }, [] )

    const redirectUrl = 'https://langapp.netlify.app/liff-answer';
    const liffFechID = async () => {
        !( liff.isLoggedIn() ) && liff.login( { redirectUri: redirectUrl } ) // ログインしていなければ最初にログインする

        if( liff.isLoggedIn() ) {
            const idToken = await liff.getIDToken();
            setLineIdToken( idToken )
        }
    }

    useEffect( () => {
        if( lineIdToken === '' ) return
        getTaskList()
    }, [ lineIdToken ] )


    const getParam = ( name, url ) => {
        if( !url ) url = window.location.href;
        name = name.replace( /[\[\]]/g, "\\$&" );
        var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ),
            results = regex.exec( url );
        if( !results ) return null;
        if( !results[ 2 ] ) return '';
        return decodeURIComponent( results[ 2 ].replace( /\+/g, " " ).replace( " ", "" ) );
    }
    const taskId = getParam( 'taskId' );
    const question = getParam( 'question' );
    const date = getParam( 'date' );


    const addAnswer = async ( taskId, date, question, answer ) => {

        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/lambda-liff-answer',
                method: 'POST',
                data: {
                    lineIdToken: lineIdToken,
                    taskId: taskId,
                    date: date,
                    question: question,
                    answer: answer,
                },
            } )
            .then( ( res ) => { console.log( 'LIFF send answer success...', res ) } )
            .catch( ( err ) => { console.log( 'LIFF send answer error...', err ) } )

        setAnswer( '' );
        getTaskList();
    }


    /////////////// UI //////////////////////
    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '90%' } }
        >
            <TextField
                required
                id="filled-required"
                label="In English?" // to be replaced with LangApp ID
                variant="filled"
                value={ answer }
                onChange={ ( e ) => { setAnswer( e.target.value ); } }
                inputProps={ {
                    style: { backgroundColor: 'white', marginBottom: '20px' },
                } }
            />
            <button style={ { fontSize: 20 } } onClick={ () => { addAnswer( x.taskId, x.date, x.question, answer ); } }>追加</button>
        </div >

    );
}

export default LiffAnswer;
