import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthGuard from "../services/AuthGuard";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const accessToken = user.access;
  const userEmail = user.email;

  const [allUsers, setAllUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/users/", { headers })
      .then(res => setAllUsers(res.data));

    axios.get("http://127.0.0.1:8000/api/recieved-interest/", { headers })
      .then(res => setRequests(res.data));
  }, []);

  const sendRequest = (id) =>
    axios.post("http://127.0.0.1:8000/api/send-interest/", { receiver: id }, { headers });

  const accept = (id) =>
    axios.post("http://127.0.0.1:8000/api/accept-interest/", { user_id: id }, { headers });

  const reject = (id) =>
    axios.post("http://127.0.0.1:8000/api/reject-interest/", { user_id: id }, { headers });

  const pending = requests.filter(r => r.status === "pending");
  const accepted = requests.filter(r => r.status === "accepted");

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Social Chat</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Pending Requests */}
        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="font-semibold mb-4">Connection Requests</h2>

          {pending.map(req => {
            const isSender = req.sender.email === userEmail;
            const u = isSender ? req.receiver : req.sender;

            return (
              <div key={req.id} className="flex justify-between items-center mb-3">
                <div>
                  <p>{u.username}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>

                {!isSender && (
                  <div className="flex gap-2">
                    <button onClick={() => accept(u.id)} className="bg-green-600 px-3 py-1 rounded">
                      Accept
                    </button>
                    <button onClick={() => reject(u.id)} className="bg-red-600 px-3 py-1 rounded">
                      Reject
                    </button>
                  </div>
                )}

                {isSender && <span className="text-xs text-gray-400">Pending</span>}
              </div>
            );
          })}
        </div>

        {/* Connected Users */}
        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="font-semibold mb-4">Messages</h2>

          {accepted.map(req => {
            const u = req.sender.email === userEmail ? req.receiver : req.sender;
            return (
              <div
                key={req.id}
                className="cursor-pointer p-2 hover:bg-zinc-800 rounded"
                onClick={() => navigate(`/chat?user=${u.id}`)}
              >
                <p>{u.username}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            );
          })}
        </div>

        {/* Discover */}
        <div className="bg-zinc-900 p-4 rounded-xl">
          <h2 className="font-semibold mb-4">Discover People</h2>

          {allUsers
            .filter(u => u.email !== userEmail)
            .map(u => (
              <div key={u.id} className="flex justify-between items-center mb-3">
                <div>
                  <p>{u.username}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <button
                  onClick={() => sendRequest(u.id)}
                  className="bg-indigo-600 px-3 py-1 rounded"
                >
                  Connect
                </button>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}

export default AuthGuard(Dashboard);
