import React, { useState, useCallback } from 'react';
import Lobby from './Lobby';
import Room from './Room';
import axios from 'axios';

const VideoChat = () => {
  const [username, setUsername] = useState('');
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState(null);

  const handleUsernameChange = useCallback(event => {
    setUsername(event.target.value);
  }, []);

  const handleRoomNameChange = useCallback(event => {
    setRoomName(event.target.value);
  }, []);

  const handleSubmit_lambda = useCallback(
    async event => {
      event.preventDefault();
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
        },
    [roomName, username]
  );

  const handleLogout = useCallback(event => {
    setToken(null);
  }, []);

  let render;
  if (token) {
    render = (
      <Room roomName={roomName} token={token} handleLogout={handleLogout} />
    );
  } else {
    render = (
      <Lobby
        username={username}
        roomName={roomName}
        handleUsernameChange={handleUsernameChange}
        handleRoomNameChange={handleRoomNameChange}
        handleSubmit={handleSubmit_lambda}
      />
    );
  }
  return render;
};

export default VideoChat;
