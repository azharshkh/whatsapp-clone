import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

function Profile({ session }) {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = session.user;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error) {
      setProfile(data);
      setUsername(data.username);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    let avatar_url = profile?.avatar_url;

    // Upload avatar if file selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatar_url = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username, avatar_url })
      .eq("id", user.id);

    if (!error) {
      alert("Profile updated!");
      fetchProfile();
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2>Profile Settings</h2>

      {profile && (
        <>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              style={{ width: 100, borderRadius: "50%" }}
            />
          )}

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0])}
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    fontFamily: "sans-serif",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    marginBottom: "10px",
  },
  button: {
    padding: "0.8rem",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};

export default Profile;
