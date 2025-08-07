import { useState } from "react";
import { supabase } from "../supabase/client";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data?.user;
    if (!user) {
      setError("Signup failed. No user returned.");
      setLoading(false);
      return;
    }

    // Generate random username (e.g., "azhar128")
    const randomUsername =
      email.split("@")[0] + Math.floor(Math.random() * 1000);

    // Insert user profile into `profiles` table
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: user.id, // Must match auth.user.id
        username: randomUsername,
        avatar_url: "", // Can be updated later
      },
    ]);

    if (profileError) {
      setError("Signup succeeded, but profile creation failed.");
      console.error("Profile creation error:", profileError.message); // Debug log
    }

    setLoading(false);
  };

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
      <h2>Login to WhatsApp Clone</h2>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          style={styles.buttonOutline}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        <button
          type="button"
          style={styles.buttonGoogle}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
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
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.8rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.8rem",
    fontSize: "1rem",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonOutline: {
    padding: "0.8rem",
    fontSize: "1rem",
    backgroundColor: "white",
    color: "green",
    border: "2px solid green",
    borderRadius: "5px",
    cursor: "pointer",
  },
  buttonGoogle: {
    padding: "0.8rem",
    fontSize: "1rem",
    backgroundColor: "#4285F4",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Login;
