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

import { v4 as uuidv4 } from 'uuid';

import AWS from 'aws-sdk';
AWS.config = new AWS.Config( {
    accessKeyId: process.env.GATSBY_AWS_accessKey,
    secretAccessKey: process.env.GATSBY_AWS_secretKey,
    region: 'us-east-2',
} );
const docClient = new AWS.DynamoDB.DocumentClient();


//import liff from '@line/liff';
const liff = typeof window !== `undefined` ? require( "@line/liff" ) : '';//"window" is not available during server side rendering.



const LIFF_task = () => {

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
        //!( liff.isLoggedIn() ) && liff.login( { redirectUri: redirectUrl } ) // ログインしていなければ最初にログインする

        if( liff.isLoggedIn() ) {
            const idToken = await liff.getIDToken();
            setLineIdToken( idToken )
        }
    }

    const taskUpload = async () => {
        const date = new Date().toISOString().substr( 0, 19 ).replace( 'T', ' ' ).slice( 0, 10 );
        const taskID = uuidv4();

        const params = {
            TableName: 'LangAppRevision',
            Item: {
                TaskID: taskID,
                UserLineID: 'userLineId',
                UserLineName: "userLineName",
                Date: date,
                Question: question,
                AnswerComplete: 'N',
                PracticeComplete: 'N',
            }
        };
        await docClient.put( params )
            .promise()
            .then( res => console.log( 'Uploading question to dynamoDB was successful...', res ) )
            .catch( err => console.log( 'Uploading question to dynamoDB failed...', err ) );

        setQuestion( '' )
    }

    const sendQuestion = async () => {
        const taskID = uuidv4();
        await axios
            .request( {
                url: 'https://langapp.netlify.app/.netlify/functions/Liff-question',
                method: 'POST',
                data: {
                    lineIdToken: lineIdToken,
                    question: question,
                    taskID: taskID,
                },
            } )
            .then( ( res ) => { console.log( 'LIFF send question success...', res ) } )
            .catch( ( err ) => { console.log( 'LIFF send question error...', err ) } )

        setQuestion()
    }

    const addAnswer = async ( taskID, answer ) => {

        var params = {
            TableName: 'LangAppRevision',
            Key: { TaskId: taskID },
            ExpressionAttributeNames: {
                '#a': 'Answer',
            },
            ExpressionAttributeValues: {
                ':newAnswer': answer,
            },
            UpdateExpression: 'SET #a = :newAnswer'
        };
        docClient.update( params )
            .promise()
            .then( res => console.log( 'adding answer to dynamoDB was successful...', res ) )
            .catch( err => console.log( 'adding answer to dynamoDB failed...', err ) );


        setQuestion()
    }

    const getTasks = async () => {

        const userLineId = 'userLineId';

        const params = {
            TableName: 'LangAppRevision',
            IndexName: 'UserLineID-index',
            KeyConditionExpression: 'UserLineID = :UserLineID ',
            ExpressionAttributeValues: { ':UserLineID': userLineId, } //
        };

        const userTasks = await docClient.query( params )
            .promise()
            .then( data => data.Items )
            .catch( err => console.log( 'Fetch tasks from dynamoDB failed...', err ) );

        userTasks.sort( function ( a, b ) {
            return a.Date < b.Date ? -1 : 1;
        } );

        console.log( userTasks )
    }

    const SimpleSlider = () => {
        return (
            <Carousel itemsToShow={ 1 }>
                <Card className='card'>
                    <CardContent>
                        <Typography color="textSecondary" component="h3">STEP 1</Typography>
                        <Typography component="h3">{ `英会話を録音` }</Typography>
                        <Typography variant="body2" component="p">
                            { `こちらのウェブページでLINEログインをして録音を開始します。そのまま普段通りオンライン英会話を行います。` }
                        </Typography>
                        <TextField
                            required
                            id="filled-required"
                            label="英語" // to be replaced with LangApp ID
                            variant="filled"
                            value={ question }
                            onChange={ ( e ) => { setQuestion( e.target.value ); } }
                            inputProps={ {
                                style: { backgroundColor: 'white', marginBottom: '20px' },
                            } }
                        />
                    </CardContent>
                </Card>
                <Card className='card'>
                    <CardContent>
                        <Typography color="textSecondary" component="h3">STEP 1</Typography>
                        <Typography component="h3">{ `英会話を録音` }</Typography>
                        <Typography variant="body2" component="p">
                            { `こちらのウェブページでLINEログインをして録音を開始します。そのまま普段通りオンライン英会話を行います。` }
                        </Typography>
                    </CardContent>
                </Card>
                <Card className='card'>
                    <CardContent>
                        <Typography color="textSecondary" component="h3">STEP 1</Typography>
                        <Typography component="h3">{ `英会話を録音` }</Typography>
                        <Typography variant="body2" component="p">
                            { `こちらのウェブページでLINEログインをして録音を開始します。そのまま普段通りオンライン英会話を行います。` }
                        </Typography>
                    </CardContent>
                </Card>
                <Card className='card'>
                    <CardContent>
                        <Typography color="textSecondary" component="h3">STEP 1</Typography>
                        <Typography component="h3">{ `英会話を録音` }</Typography>
                        <Typography variant="body2" component="p">
                            { `こちらのウェブページでLINEログインをして録音を開始します。そのまま普段通りオンライン英会話を行います。` }
                        </Typography>
                    </CardContent>
                </Card>

            </Carousel>
        );
    }

    /////////////// UI //////////////////////
    return (
        <div
            style={ { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: '90%' } }
        >
            <button style={ { fontSize: 20 } } onClick={ () => { getTasks(); } }>Tasks</button>

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
                <button style={ { fontSize: 20 } } onClick={ () => { taskUpload(); } }>追加</button>
            </div >

            <SimpleSlider />

        </div >

    );
}

export default LIFF_task;
