
import { createContext, useContext, useRef, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import "./ShowMessage.css";

const MessageContext = createContext(null);

export function ShowMessage({ children }) {
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const timerRef = useRef(null);

    const show = (text, type) => {
        clearTimeout(timerRef.current);

        setMessage(text);
        setMessageType(type);

        timerRef.current = setTimeout(() => {
            setMessage("");
        }, 3000);
    };

    const showSuccess = (text) => show(text, "success");
    const showError = (text) => show(text, "error");

    const closeMessage = () => {
        clearTimeout(timerRef.current);
        setMessage("");
    };

    return (
        <MessageContext.Provider value={{ showSuccess, showError }}>
            {message && (
                <div
                    className={`message ${messageType}`}
                    role={messageType === "error" ? "alert" : "status"}
                >
                    <div className="message-icon">
                        {messageType === "success"
                            ? <CheckCircle size={21} />
                            : <AlertCircle size={21} />
                        }
                    </div>

                    <span className="message-text">
                        {message}
                    </span>

                    <button
                        className="message-close"
                        onClick={closeMessage}
                        aria-label="Close notification"
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {children}
        </MessageContext.Provider>
    );
}

export function useMessage() {
    const context = useContext(MessageContext);

    if (!context) {
        throw new Error(
            "useMessage must be used inside ShowMessage"
        );
    }

    return context;
}
