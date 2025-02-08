import { useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import "./index.css";

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    { role: "bot", text: "Hi there! How can I help you today?" }
  ]);

  const generateResponse = async (history) => {
    // Show "Thinking..." first
    setChatHistory((prev) => [...prev, { role: "bot", text: "Thinking..." }]);

    const prompt = history.map((item) => item.text).join("\n");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);

      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const data = await response.json();
      const apiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";

      // Replace "Thinking..." with actual response
      setChatHistory((prev) => [
        ...prev.slice(0, -1), // Remove last message (Thinking...)
        { role: "bot", text: apiResponseText },
      ]);
    } catch (error) {
      console.error("API Call Error:", error);

      // Replace "Thinking..." with an error message
      setChatHistory((prev) => [
        ...prev.slice(0, -1), 
        { role: "bot", text: "Sorry, I'm having trouble responding. Please try again later." },
      ]);
    }
  };

  return (
    <div className="container">
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-rounded">keyboard_arrow_down</button>
        </div>

        <div className="chat-body">
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateResponse={generateResponse} />
        </div>
      </div>
    </div>
  );
};

export default App;
