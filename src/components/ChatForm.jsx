import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    // Add user message to chat history
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);

    // Clear input field
    inputRef.current.value = "";

    // Generate bot response
    generateResponse([...chatHistory, { role: "user", text: userMessage }]);
  };

  return (
    <form className="chat-form" onSubmit={handleFormSubmit}>
      <input ref={inputRef} type="text" placeholder="Message..." className="message-input" required />
      <button type="submit" className="material-symbols-rounded">arrow_upward</button>
    </form>
  );
};

export default ChatForm;
