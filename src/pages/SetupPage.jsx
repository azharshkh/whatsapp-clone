import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

function SetupPage({ user }) {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🚫 Prevent access if profile is already complete
  useEffect(() => {
    const checkProfile = async () => {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking profile:", error.message);
        return;
      }

      if (profile?.username && profile?.avatar_url) {
        navigate("/");
      }
    };

    checkProfile();
  }, [user.id, navigate]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (error) {
      setError("Failed to update profile: " + error.message);
    } else {
      navigate("/");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>Complete Your Profile</h2>
      <input
        type="text"
        placeholder="Choose a username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      <input
        type="text"
        placeholder="Avatar URL (optional)"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        style={styles.input}
      />
      <button
        onClick={handleSave}
        style={styles.button}
        disabled={loading || !username}
      >
        {loading ? "Saving..." : "Save & Continue"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    textAlign: "center",
    fontFamily: "sans-serif",
    backgroundColor: "#f9f9f9",
  },
  input: {
    padding: "0.8rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100%",
    marginBottom: "1rem",
  },
  button: {
    padding: "0.8rem",
    fontSize: "1rem",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
};

export default SetupPage;
