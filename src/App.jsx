import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";
import Login from "./pages/Login";
import ChatList from "./components/ChatList";

function App() {
  const [session, setSession] = useState(null);

  // Fetch session once on load and listen for changes
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
      } catch (err) {
        console.error("Error fetching session:", err.message);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  return session ? (
    <div>
      <header style={styles.header}>
        <span>
          Logged in as: <strong>{session.user.email}</strong>
        </span>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </header>
      <ChatList session={session} />
    </div>
  ) : (
    <Login />
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#f2f2f2",
    borderBottom: "1px solid #ccc",
    fontFamily: "sans-serif",
  },
  logout: {
    backgroundColor: "#d32f2f",
    color: "#fff",
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;
