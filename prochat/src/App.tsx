import { useContext, useEffect, useState } from "react";
import "./App.css";
import { HelperClient, MatrixContext, useMatrix } from "./matrix";

function ProjectChat(loginParams: LoginParams) {
  const { matrixClient } = useMatrix(loginParams);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!matrixClient) {
      return;
    }
    async function init() {
      const helper = new HelperClient(loginParams);
      const roomId = await helper.getRoomId(loginParams.projectId);
      setRoomId(roomId);
    }

    init();
  }, [matrixClient]);

  if (!matrixClient) {
    return <></>;
  }

  if (matrixClient.getRooms().length === 0) {
    return <div>User does not have any rooms.</div>;
  }

  if (!roomId) {
    return <div>Can't find project room {roomId}</div>;
  }

  const room = matrixClient.getRooms().filter((r) => r.roomId === roomId)[0];
  if (!room) {
    return <div>User is not in room {room}</div>;
  }

  return (
    <MatrixContext.Provider value={matrixClient}>
      <div>Room Id: {roomId}</div>
      <MatrixRoomViewer roomId={roomId}></MatrixRoomViewer>
    </MatrixContext.Provider>
  );
}

type LoginParams = { userId: string; projectId: number; teamId: number };

function Login({ onLogin }: { onLogin: (login: LoginParams) => void }) {
  const [userId, setUserId] = useState(111);
  const [projectId, setProjectId] = useState(111);
  const [teamId, setTeamId] = useState(111);

  return (
    <form className="login-screen">
      <label>
        <span>User Id:</span>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(Number(e.currentTarget.value))}
        />
      </label>
      <label>
        <span>Team Id:</span>
        <input
          type="text"
          value={teamId}
          onChange={(e) => setTeamId(Number(e.currentTarget.value))}
        />
      </label>
      <label>
        <span>Project Id:</span>
        <input
          type="text"
          value={projectId}
          onChange={(e) => setProjectId(Number(e.currentTarget.value))}
        />
      </label>
      <button
        type="submit"
        onClick={(e) => {
          onLogin({ userId: userId.toFixed(0), teamId, projectId });
          e.preventDefault();
        }}
      >
        Login
      </button>
    </form>
  );
}

function App() {
  const [login, setLogin] = useState<LoginParams | null>(null);

  if (!login) {
    return <Login onLogin={setLogin} />;
  }

  return <ProjectChat {...login} />;
}
export default App;

const MatrixRoomViewer = ({ roomId }: { roomId: string }) => {
  const matrixClient = useContext(MatrixContext);

  const room = matrixClient.getRoom(roomId);
  if (!room) {
    return <div>Room not found</div>;
  }

  const timeline = room.getLiveTimeline();
  const events = timeline.getEvents();
  console.log(events);
  const messages = events.map((event) => ({
    sender: event.sender?.name ?? "",
    message: event.getContent().body,
  }));
  const sendMessage = () => {
    matrixClient.sendMessage(roomId, {
      msgtype: "m.text",
      body: "hello",
      "m.mentions": {},
    });
  };

  return (
    <div>
      <h3>{roomId}</h3>
      {messages.map((msg, index) => (
        <div key={index}>
          <strong>{msg.sender}</strong>: {msg.message}
        </div>
      ))}

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};
