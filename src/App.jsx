import { useEffect, useState } from "react";
import { supabase } from "./supabase/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import ChatList from "./components/ChatList";
import SetupPage from "./pages/SetupPage";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error.message);
        setLoading(false);
        return;
      }

      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession) {
        await checkOrCreateProfile(
          currentSession.user.id,
          currentSession.user.email
        );
      } else {
        setLoading(false);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          checkOrCreateProfile(session.user.id, session.user.email);
        } else {
          setHasProfile(null);
          navigate("/");
        }
      }
    );

    init();

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const checkOrCreateProfile = async (userId, email) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (!profile) {
        const randomUsername =
          email.split("@")[0] + Math.floor(Math.random() * 1000);
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: userId,
            username: randomUsername,
            avatar_url: "",
          },
        ]);

        if (insertError) {
          console.error("Profile creation error:", insertError.message);
        }

        setHasProfile(false);
        navigate("/setup");
      } else if (!profile.username || !profile.avatar_url) {
        setHasProfile(false);
        navigate("/setup");
      } else {
        setHasProfile(true);
      }
    } catch (err) {
      console.error("Error checking profile:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setHasProfile(null);
    navigate("/");
  };

  if (loading) return <p>Loading...</p>;
  if (!session) return <Login />;

  return (
    <>
      <header style={styles.header}>
        <span>
          Logged in as: <strong>{session.user.email}</strong>
        </span>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            hasProfile === false ? (
              <Navigate to="/setup" />
            ) : (
              <ChatList session={session} />
            )
          }
        />
        <Route
          path="/setup"
          element={
            hasProfile === true ? (
              <Navigate to="/" />
            ) : (
              <SetupPage user={session.user} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
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

export default AppWrapper;
