import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';
import loadingImg from "../images/loading.gif"


//import liff from '@line/liff';
const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.



const LiffAnswer = () => {

    const [ lineIdToken, setLineIdToken ] = useState( '' );
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


    const getParam = ( name, url ) => {
        //if( typeof window !== `undefined` ) return
        if( !url ) url = window.location.href;
        name = name.replace( /[\[\]]/g, "\\$&" );
        var regex = new RegExp( "[?&]" + name + "(=([^&#]*)|&|#|$)" ),
            results = regex.exec( url );
        if( !results ) return null;
        if( !results[ 2 ] ) return '';
        return decodeURIComponent( results[ 2 ].replace( /\+/g, " " ).replace( " ", "" ) );
    }


    const addAnswer = async () => {
        if( lineIdToken === '' ) return

        const taskId = getParam( 'taskId' );
        const dateAnswered = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );

        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/lambda-liff-answer',
                method: 'POST',
                data: {
                    lineIdToken: lineIdToken,
                    taskId: taskId,
                    dateAnswered: dateAnswered,
                    answer: answer,
                },
            } )
            .then( ( res ) => { console.log( 'LIFF send answer success...', res ) } )
            .catch( ( err ) => { console.log( 'LIFF send answer error...', err ) } )

        setAnswer( '' );
    }


    /////////////// UI //////////////////////
    return (
        ( lineIdToken === '' )
            ? <div style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }>
                <img src={ loadingImg }
                    style={ { width: '180px' } }
                />
            </div>
            : <div
                style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' } }
            >
                <TextField
                    required
                    id="outlined-multiline-static"
                    label="In English?" // to be replaced with LangApp ID
                    multiline
                    rows="4"
                    margin="normal"
                    variant="outlined"
                    value={ answer }
                    onChange={ ( e ) => { setAnswer( e.target.value ); } }
                    inputProps={ {
                        style: { backgroundColor: 'white', width: '80vw' },
                    } }
                />
                <button style={ { fontSize: 20 } } onClick={ () => { addAnswer(); } }>追加</button>
            </div >

    );
}

export default LiffAnswer;
