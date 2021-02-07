import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styled from "styled-components"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
//import Button from '@material-ui/core/Button';

import Carousel from 'react-elastic-carousel'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';



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


    const getTaskList = async () => {

        const tasks = await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/lambda-liff-getTasks',
                method: 'POST',
                data: {
                    lineIdToken: lineIdToken,
                },
            } )
            .then( ( res ) => {
                console.log( 'LIFF fetch tasks success...', res )
                return ( res.data.tasks )
            } )
            .catch( ( err ) => {
                console.log( 'LIFF fetch tasks error...', err )
                return ( [] )
            } )

        console.log( 'fetched tasks...', tasks );

        tasks.sort( function ( a, b ) {
            return a.date < b.date ? -1 : 1;
        } );
        const tasksFiltered = tasks.filter( x => x.answerComplete != 'Y' );

        setTaskList( tasksFiltered )

    }

    const addAnswer = async ( taskId, answer ) => {
        console.log( taskId );
        console.log( answer );

        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/lambda-liff-answer',
                method: 'POST',
                data: {
                    taskId: taskId,
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
            <Carousel itemsToShow={ 1 }>

                { taskList.map( ( x ) => {
                    return (
                        <Card className='card' style={ {} }>
                            <CardContent>
                                <Typography color="textSecondary" component="p">{ `${ x.date }` }</Typography>
                                <Typography component="h3">{ `${ x.question }` }</Typography>
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
                                <button style={ { fontSize: 20 } } onClick={ () => { addAnswer( x.taskId, answer ); } }>追加</button>
                            </CardContent>
                        </Card> )
                } ) }
            </Carousel>
        </div >

    );
}

export default LiffAnswer;
