import { useState } from "react";
import { supabase } from "../supabase/client";

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      setError("Google login failed: " + error.message);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>Welcome to WhatsApp Clone</h2>

      <button
        type="button"
        style={styles.buttonGoogle}
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? "Redirecting..." : "Continue with Google"}
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
  buttonGoogle: {
    padding: "0.8rem",
    fontSize: "1rem",
    backgroundColor: "#4285F4",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "100%",
  },
};

export default Login;
