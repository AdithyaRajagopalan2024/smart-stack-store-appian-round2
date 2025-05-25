import React, { useState, useRef } from "react";
import Header from "./Header";

const SERVER_URL = "http://localhost:3001";

const ChatGemini: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("Assistance is on the way!");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageBase64(result.split(",")[1]);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageBase64(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim() && !imageBase64) {
      setError("Please enter a text prompt or upload an image.");
      return;
    }

    setLoading(true);
    setResponse("No response yet.");

    try {
      const res = await fetch(`${SERVER_URL}/api/gemini-rag-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageBase64 }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setError(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError("We are having trouble accessing our catalog. Please wait a moment and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{
      textAlign: 'center', backgroundColor: 'rgb(119 137 244)',
      borderRadius: '10px',
      height: '8rem',
      marginBottom: '20px'}}>
    <Header/>

      </div>
    <div style={{
      fontFamily: "'Roboto', sans-serif",
      margin: 0,
      padding: 20,
      backgroundColor: "#f4f7f6",
      color: "#333",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      minHeight: "100vh"
    }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        padding: 30,
        maxWidth: 700,
        width: "100%",
        boxSizing: "border-box"
      }}>
        <h1 style={{
          color: "#2c3e50",
          textAlign: "center",
          marginBottom: 25,
          fontWeight: 700
        }}>SmartSaathi</h1>
        <h5 style={{
          color: "#2c3e50",
          textAlign: "center",
          marginBottom: 25,
          fontWeight: 700
        }}>Powered by Vertex AI</h5>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="prompt" style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 500,
              color: "#555"
            }}>What are you looking for today?</label>
            <textarea
            required
              id="prompt"
              placeholder="Some noise cancelling headphones, a new laptop, or maybe a smartphone?"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{
                width: "calc(100% - 20px)",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
                boxSizing: "border-box",
                resize: "vertical",
                minHeight: 80,
                transition: "border-color 0.3s ease"
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label htmlFor="imageUpload" style={{
              display: "flex",
              marginBottom: 8,
              fontWeight: 500,
              color: "#555"
            }}>Want to find something specific from an image?</label>
            <input
              type="file"
              id="imageUpload"
              accept="image/jpeg, image/png, image/webp"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{
                width: "30rem",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 8,
                fontSize: 16,
                backgroundColor: "#ecf0f1",
                cursor: "pointer"
              }}
            />
            {imagePreview && (
              <div style={{
                marginTop: 15,
                textAlign: "center",
                border: "1px dashed #ccc",
                padding: 15,
                borderRadius: 8,
                backgroundColor: "#f9f9f9"
              }}>
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    display: "block",
                    margin: "0 auto",
                    objectFit: "contain"
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              width: "60%",
              padding: "14px 20px",
              marginLeft: "8.5rem",
              justifyContent: "space-evenly",
              backgroundColor: loading ? "#a0a0a0" : "#2e2e2e",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease, transform 0.2s ease"
            }}
          >
            Find my perfect product
          </button>
        </form>


        {loading && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
            fontStyle: "italic",
            color: "#777"
          }}>
            <img src="/images/loading.gif" alt="Loading..." style={{ width: 50, height: 50 }} />
            <span style={{ marginLeft: 10 }}>Searching for your perfect product...</span>
          </div>
        )}

        {error && (
          <div style={{
            color: "#e74c3c",
            backgroundColor: "#fdeded",
            border: "1px solid #fbc4c4",
            padding: 10,
            borderRadius: 8,
            marginTop: 15,
            textAlign: "center",
            fontWeight: 500
          }}>
            Error: {error}
          </div>
        )}

        <div style={{
          marginTop: 30,
          borderTop: "1px solid #eee",
          paddingTop: 25
        }}>
          <h2 style={{
            color: "#2c3e50",
            marginBottom: 15,
            fontWeight: 600,
            textAlign: "center"
          }}>Here's our suggestion:</h2>
          <pre style={{
            backgroundColor: "#ecf0f1",
            border: "1px solid #cfd9df",
            borderRadius: 8,
            padding: 20,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            minHeight: 100,
            overflowY: "auto",
            fontSize: 15,
            lineHeight: 1.6,
            color: "#444"
          }}>
            {response}
          </pre>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ChatGemini;