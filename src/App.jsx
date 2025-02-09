import { useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import "./index.css";

const API_KEY = "AIzaSyD-TyxeUph5lJp4YgdGrS7cWiFBvTG97Z0"; // Replace this with your valid API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function getGeminiResponse(prompt) {
    if (!API_KEY) {
        console.error("❌ Gemini API key is missing!");
        return "API key is missing. Please check your environment variables.";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }] // ✅ Correct format for Gemini API
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("❌ API Error:", errorData);
            return `Error: ${errorData.error?.message || response.statusText}`;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    } catch (error) {
        console.error("❌ Network or Server Error:", error);
        return "Network error. Please try again later.";
    }
}

// Corrected function
const generateResponse = async (history, setChatHistory) => {
    setChatHistory((prev) => [...prev, { role: "bot", text: "Thinking..." }]);

    const prompt = history.map((item) => item.text).join("\n");

    try {
        const apiResponseText = await getGeminiResponse(prompt);

        setChatHistory((prev) => [
            ...prev.slice(0, -1),
            { role: "bot", text: apiResponseText },
        ]);
    } catch (error) {
        console.error("API Call Error:", error);
        setChatHistory((prev) => [
            ...prev.slice(0, -1),
            { role: "bot", text: "Sorry, I'm having trouble responding. Please try again later." },
        ]);
    }
};

const App = () => {
    const [chatHistory, setChatHistory] = useState([
        { role: "bot", text: "Hi there! How can I help you today?" }
    ]);

    return (
        <div className="chat-container">
            <div className="chatbot-popup">
                <div className="chat-header">
                    <div className="header-info">
                        <ChatbotIcon />
                        <h2 className="logo-text">Chat Assistant</h2>
                    </div>
                    <button className="close-btn">&times;</button>
                </div>

                <div className="chat-body">
                    {chatHistory.map((chat, index) => (
                        <ChatMessage key={index} chat={chat} />
                    ))}
                </div>

                <div className="chat-footer">
                    <ChatForm 
                        chatHistory={chatHistory} 
                        setChatHistory={setChatHistory} 
                        generateResponse={(history) => generateResponse(history, setChatHistory)} 
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
