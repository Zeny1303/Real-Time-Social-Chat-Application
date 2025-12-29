import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AuthGuard from "../services/AuthGuard";

function Chat() {
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const accessToken = userData.access;
  const userEmail = userData.email;

  /* Fetch accepted connections */
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/accept-interest/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(res => setConnections(res.data))
      .catch(err => console.error(err));
  }, [accessToken]);

  /* Open WebSocket when user selected */
  useEffect(() => {
    if (!selectedUser) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/chat/?token=${accessToken}&recipient=${selectedUser.id}`
    );

    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      setMessages(prev => [...prev, data]);
    };

    setSocket(ws);
    return () => ws.close();
  }, [selectedUser, accessToken]);

  /* Auto scroll */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.send(
      JSON.stringify({
        message,
        receiver: selectedUser.id,
        sender: accessToken,
      })
    );

    setMessage("");
  };

  return (
    <div className="h-screen bg-[#0b1220] text-white flex">

      {/* LEFT SIDEBAR */}
      <aside className="w-80 border-r border-white/10 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        {connections.map(item => {
          const isSender = item.sender.email === userEmail;
          const user = isSender ? item.receiver : item.sender;

          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedUser(user);
                setMessages([]);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <img
                src="https://bootdey.com/img/Content/avatar/avatar1.png"
                className="w-10 h-10 rounded-full"
                alt="avatar"
              />
              <div className="text-left">
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </button>
          );
        })}
      </aside>

      {/* CHAT PANEL */}
      <main className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="border-b border-white/10 p-4">
          {selectedUser ? (
            <h3 className="font-semibold">{selectedUser.username}</h3>
          ) : (
            <p className="text-gray-400">Select a conversation</p>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isMe = msg.sender === accessToken;

            return (
              <div
                key={idx}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs ${
                    isMe
                      ? "bg-indigo-600"
                      : "bg-white/10"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {selectedUser && (
          <div className="border-t border-white/10 p-4 flex gap-3">
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-white/10 rounded-lg px-4 py-2 outline-none"
              placeholder="Message..."
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AuthGuard(Chat);
