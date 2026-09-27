import "./styles/App.css";
import { Routes, Route, Navigate } from "react-router";
import { useInstanceStore } from "../entities/instance/model/useInstanceStore.js";
import { lazy } from "react";

const AuthPage = lazy(() => import("../pages/auth-page/ui/AuthPage"));
const ChatPage = lazy(() => import("../pages/chat-page/ui/ChatPage"));

function App() {
  const idInstance = useInstanceStore((state) => state.idInstance);

  return (
    <Routes>
      <Route
        path="/"
        element={
          idInstance ? (
            <Navigate to="/chat" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/chat"
        element={idInstance ? <ChatPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
