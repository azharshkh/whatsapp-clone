import { useState } from "react";
import { supabase } from "../supabase/client";

function ImageUpload({ sender }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${sender}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("chat-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from("messages").insert({
      image_url: imageUrl,
      sender: sender,
    });

    if (insertError) {
      alert("Failed to save message.");
    }

    setFile(null);
    setUploading(false);
  };

  return (
    <div style={{ marginTop: "10px" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? "Uploading..." : "Send Image"}
      </button>
    </div>
  );
}

export default ImageUpload;
