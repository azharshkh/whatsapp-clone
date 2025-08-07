import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

function ChatList({ session }) {
  const [chats, setChats] = useState([]);
  const [profiles, setProfiles] = useState({});
  const navigate = useNavigate();
  const myId = session.user.id;

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    // Step 1: Fetch chats where current user is either user_a or user_b
    const { data: chatData, error } = await supabase
      .from("chats")
      .select("*")
      .or(`user_a.eq.${myId},user_b.eq.${myId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error.message);
      return;
    }

    setChats(chatData);

    // Step 2: Extract unique user IDs (other participants)
    const userIds = Array.from(
      new Set(
        chatData.map((chat) =>
          chat.user_a === myId ? chat.user_b : chat.user_a
        )
      )
    );

    if (userIds.length === 0) return;

    // Step 3: Fetch user profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profileError) {
      console.error("Error fetching profiles:", profileError.message);
      return;
    }

    // Step 4: Map userId → profile
    const profileMap = {};
    profileData?.forEach((p) => {
      profileMap[p.id] = p;
    });

    setProfiles(profileMap);
  };

  const openChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Chats</h2>

      {chats.length === 0 && <p>No chats yet.</p>}

      <ul style={styles.list}>
        {chats.map((chat) => {
          const otherId = chat.user_a === myId ? chat.user_b : chat.user_a;
          const profile = profiles[otherId];

          return (
            <li
              key={chat.id}
              onClick={() => openChat(chat.id)}
              style={styles.chatItem}
            >
              <img
                src={profile?.avatar_url || "https://placehold.co/40"}
                alt="avatar"
                style={styles.avatar}
              />
              <span>{profile?.username || "Unknown User"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "1rem",
    fontFamily: "sans-serif",
    border: "1px solid #ccc",
    borderRadius: "10px",
    background: "#f9f9f9",
  },
  title: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderBottom: "1px solid #ddd",
    cursor: "pointer",
    borderRadius: "5px",
    transition: "background 0.2s",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
};

export default ChatList;
