
import { useEffect, useRef, useState } from "react";
import { Client, type IMessage } from "@stomp/stompjs";
import "./Chat.css";

type ChatMessage = {
    sender: string;
    receiver: string;
    content: string;
    timestamp?: string;
};

export default function Chat() {
    const [sender, setSender] = useState("");
    const [receiver, setReceiver] = useState("");
    const [content, setContent] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connected, setConnected] = useState(false);

    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        const client = new Client({
            brokerURL: "ws://localhost:8080/ws",
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);

                client.subscribe("/topic/messages", (message: IMessage) => {
                    const received: ChatMessage = JSON.parse(message.body);
                    setMessages((previous) => [...previous, received]);
                });
            },
            onDisconnect: () => setConnected(false),
            onWebSocketClose: () => setConnected(false),
            onWebSocketError: () => setConnected(false),
        });

        clientRef.current = client;
        client.activate();

        return () => {
            clientRef.current = null;
            void client.deactivate();
        };
    }, []);

    function sendMessage() {
        const client = clientRef.current;

        if (!client?.connected || !sender.trim() ||
            !receiver.trim() || !content.trim()) {
            return;
        }

        const message: ChatMessage = {
            sender: sender.trim(),
            receiver: receiver.trim(),
            content: content.trim(),
        };

        client.publish({
            destination: "/app/chat",
            body: JSON.stringify(message),
        });

        setContent("");
    }

    return (
        <section className="chat-panel">
            <div className="chat-heading">
                <div>
                    <h2>SkillCircle Chat</h2>
                    <p>Connect and share knowledge</p>
                </div>
                <span className={connected ? "chat-status online" : "chat-status"}>
          {connected ? "Connected" : "Connecting..."}
        </span>
            </div>

            <div className="chat-identity">
                <input
                    placeholder="Your name"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    aria-label="Your name"
                />
                <input
                    placeholder="Receiver name"
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    aria-label="Receiver name"
                />
            </div>

            <div className="chat-messages" aria-live="polite">
                {messages.length === 0 ? (
                    <p className="chat-empty">No messages yet. Start a conversation!</p>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={`${message.timestamp ?? "message"}-${index}`}
                            className={
                                message.sender === sender.trim()
                                    ? "chat-bubble own-message"
                                    : "chat-bubble"
                            }
                        >
                            <strong>{message.sender}</strong>
                            <p>{message.content}</p>
                            {message.timestamp && (
                                <small>
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </small>
                            )}
                        </div>
                    ))
                )}
            </div>

            <form
                className="chat-compose"
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
            >
                <input
                    placeholder="Type your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    aria-label="Message"
                />
                <button type="submit" disabled={!connected || !content.trim()}>
                    Send
                </button>
            </form>
        </section>
    );
}
