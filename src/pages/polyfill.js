import React, { useState, useEffect, useRef } from 'react';

import ReactRecord from 'react-record';

export class Example extends React.Component {
    constructor ( props ) {
        super( props );
        this.state = {
            blobURL: null,
            isRecording: false
        }
    }

    startRecording = () => {
        this.setState( {
            isRecording: true
        } );
    }

    stopRecording = () => {
        this.setState( {
            isRecording: false
        } );
    }

    onData = recordedBlob => {
        console.log( 'chunk of data is: ', recordedBlob );
    }

    onSave = blobObject => {
        console.log( "You can tap into the onSave callback", blobObject );
    };

    onStop = blobObject => {
        console.log( 'blobObject is: ', blobObject );
        this.setState( {
            blobURL: blobObject.blobURL
        } );
    }

    onStart = () => {
        console.log( 'You can tap into the onStart callback' );
    };

    render() {
        const { isRecording } = this.state;
        return (
            <div className="record-mic">
                <ReactRecord
                    record={ isRecording }
                    onStop={ this.onStop }
                    onStart={ this.onStart }
                    onSave={ this.onSave }
                    onData={ this.onData }
                >
                    <div>
                        <audio
                            ref={ c => {
                                this.audioSource = c;
                            } }
                            controls="controls"
                            src={ this.state.blobURL }
                        >
                            <track kind="captions" />
                        </audio>
                    </div>
                    <button onClick={ this.startRecording } type="button">
                        Start
          </button>
                    <button onClick={ this.stopRecording } type="button">
                        Stop
          </button>
                </ReactRecord>
            </div>
        );
    }
}