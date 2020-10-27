import React, { useState, useCallback } from 'react';
//import Lobby from './Lobby';
import Room from './Room';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const VideoChat = () => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('test_room');
  const [token, setToken] = useState(null);

  const getToken = () => {
      const url = 'https://langapp.netlify.app/.netlify/functions/twilio';
      axios
            .request({
                url,
                method: 'POST',
                headers: {"Access-Control-Allow-Origin": "*"},
                data:  {
                    identity: username,
                    room: roomName
                },
            })
            .then((res) => {
                console.log(res.data.token)
                setToken(res.data.token);
            })
            .catch((err) => {
                console.log('token err :', err);
            });
    }

  const handleLogout = useCallback(event => {
    setToken(null);
  }, []);


  return(
      (token)
      ? <Room roomName={roomName} token={token} handleLogout={handleLogout} />
      : <div
        style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
        >
            <TextField
            required
            id="filled-secondary"
            //label="Enter your name"
            placeholder="Enter your name"
            style={{
                //backgroundColor: "white"
                marginBottom: "10px"
            }}
            InputProps={{
                style: {
                    color: "white"                }
            }}
                onChange={(e) => { setUsername(e.target.value) }}
            >
            </TextField>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {getToken()}}
              >
              Enter video chat toom
            </Button>
        </div>
  )
        
};

export default VideoChat;
