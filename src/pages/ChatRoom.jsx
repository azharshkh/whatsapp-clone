import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabase/client";
import ImageUpload from "../components/ImageUpload";

function ChatRoom({ session }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef(null);
  const { id: chatId } = useParams(); // 🟢 From /chat/:id route

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (!error) setMessages(data);
  };

  const subscribeToMessages = () => {
    supabase
      .channel(`messages:chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("messages").insert({
      content: newMessage,
      sender: session.user.email,
      chat_id: chatId,
    });

    if (!error) setNewMessage("");
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Private Chat</h2>
        <p style={styles.user}>Logged in as: {session.user.email}</p>
      </header>

      <div style={styles.chatBox}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              ...(msg.sender === session.user.email
                ? styles.myMessage
                : styles.theirMessage),
            }}
          >
            <span style={styles.sender}>{msg.sender}</span>
            {msg.content && <p style={styles.text}>{msg.content}</p>}
            {msg.image_url && (
              <img src={msg.image_url} alt="sent" style={styles.image} />
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Send
        </button>
      </form>

      <ImageUpload sender={session.user.email} chatId={chatId} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1rem",
    boxSizing: "border-box",
    fontFamily: "sans-serif",
  },
  header: {
    padding: "0.5rem 1rem",
    borderBottom: "1px solid #ccc",
    marginBottom: "0.5rem",
  },
  user: {
    fontSize: "0.9rem",
    color: "#555",
  },
  chatBox: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  message: {
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "10px",
    maxWidth: "70%",
    wordBreak: "break-word",
  },
  myMessage: {
    backgroundColor: "#dcf8c6",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  sender: {
    fontWeight: "bold",
    fontSize: "0.85rem",
    color: "#333",
  },
  text: {
    marginTop: "5px",
    fontSize: "1rem",
  },
  image: {
    maxWidth: "100%",
    borderRadius: "8px",
    marginTop: "5px",
  },
  inputArea: {
    display: "flex",
    gap: "10px",
    marginTop: "auto",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ChatRoom;
