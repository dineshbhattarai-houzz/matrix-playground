import React, { useContext, useState, useEffect } from 'react';
import './App.css';
import { MatrixContext, useMatrix } from './matrix';


function App() {
  const { matrixClient } = useMatrix();
  if (!matrixClient) {
    return <></>;
  }

  return (
    <MatrixContext.Provider value={matrixClient}>
      <MatrixRoomViewer roomId={matrixClient?.getRooms()[0].roomId} ></MatrixRoomViewer>
    </MatrixContext.Provider>
  );
}
export default App;

type RoomInfo = {
  name: string,
  messages: {
    sender: string,
    message: string,
  }[]
}

const MatrixRoomViewer = ({ roomId }) => {
  const matrixClient = useContext(MatrixContext);

  const room = matrixClient.getRoom(roomId);
  if (!room) {
    return <div>Room not found</div>
  }

  const timeline = room.getLiveTimeline();
  const events = timeline.getEvents();
  console.log(events)
  const messages = events.map((event) => ({
    sender: event.sender?.name ?? "",
    message: event.getContent().body,
  }));
  const sendMessage = () => {
    matrixClient.sendMessage(roomId, {msgtype: 'm.text', body: "hello", "m.mentions": {}})
  }

  return (
    <div>
      <h3>{roomId}</h3>
      {
        messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.message}
          </div>
        ))
      }

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

