import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';

import { v4 as uuidv4 } from 'uuid';

//import liff from '@line/liff';
const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.



const LiffQuestion = () => {

    const [ lineIdToken, setLineIdToken ] = useState( '' );
    const [ question, setQuestion ] = useState( '' );

    // LIFF processes
    useEffect( () => {
        ( typeof window !== `undefined` ) && liff.init( { liffId: process.env.GATSBY_LINE_LIFFID_question } )
            .then( () => {
                console.log( 'Success in LIFF initialisation' );
                liffFechID();
            } )
            .catch( err => window.alert( 'Error in LIFF initialisation: ' + err ) )
    }, [] )

    const redirectUrl = 'https://langapp.netlify.app/liff-question';
    const liffFechID = async () => {
        !( liff.isLoggedIn() ) && liff.login( { redirectUri: redirectUrl } ) // ログインしていなければ最初にログインする

        if( liff.isLoggedIn() ) {
            const idToken = await liff.getIDToken();
            setLineIdToken( idToken )
        }
    }


    const sendQuestion = async () => {
        const taskId = uuidv4();
        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/lambda-liff-question',
                method: 'POST',
                data: {
                    lineIdToken: lineIdToken,
                    question: question,
                    taskId: taskId,
                },
            } )
            .then( ( res ) => { console.log( 'LIFF send question success...', res ) } )
            .catch( ( err ) => { console.log( 'LIFF send question error...', err ) } )

        setQuestion()
    }

    /////////////// UI //////////////////////
    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '90%' } }
        >
            <div
                style={ { display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', maxWidth: '90%' } }
            >
                <TextField
                    required
                    id="filled-required"
                    label="英語で言いたいこと" // to be replaced with LangApp ID
                    variant="filled"
                    value={ question }
                    onChange={ ( e ) => { setQuestion( e.target.value ); } }
                    inputProps={ {
                        style: { backgroundColor: 'white', marginBottom: '20px' },
                    } }
                />
                <button style={ { fontSize: 20 } } onClick={ () => { sendQuestion(); } }>追加</button>
            </div >
        </div >

    );
}

export default LiffQuestion;
