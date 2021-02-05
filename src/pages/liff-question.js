import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';

import Button from "../components/Button/button";

import TranscribeLangs from '../constants/transcribeLangs.json';

import { v4 as uuidv4 } from 'uuid';

//import liff from '@line/liff';
const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.

const LIFF_task = () => {

    const [ lineIdToken, setLineIdToken ] = useState( '' );
    const [ question, setQuestion ] = useState( '' );

    // LIFF processes
    useEffect( () => {
        ( typeof window !== `undefined` ) && liff.init( { liffId: process.env.GATSBY_LINE_LIFFID } )
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

        axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/Liff-question',
                method: 'POST',
                data: {
                    lineIdToken: lineIdToken,
                    question: question,
                },
            } )
            .then( ( res ) => { console.log( 'LIFF send question success...', res ) } )
            .catch( ( err ) => { console.log( 'LIFF send question error...', err ) } )

    }

    /////////////// UI //////////////////////
    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '90%' } }
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
            <button style={ { fontSize: 40 } } onClick={ () => { sendQuestion(); } }>登録</button>
        </div >

    );
}

export default LIFF_task;
