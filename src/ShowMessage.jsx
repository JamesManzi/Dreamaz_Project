// ShowMessage.jsx
import { createContext, useContext, useState } from "react";
import "./ShowMessage.css";

const MessageContext = createContext(null);

export function ShowMessage({ children }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const show = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000); // auto-hide after 3s
  };

  const showSuccess = (text) => show(text, "success");
  const showError = (text) => show(text, "error");

  return (
    <MessageContext.Provider value={{ showSuccess, showError }}>
      {message && <div className={`message ${messageType}`}>{message}</div>}
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(MessageContext);
}