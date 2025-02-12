// app/page.tsx
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  // Local state for the input field, chat messages, and conversation ID
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([
    { id: 1, role: "assistant", content: "Hello! How can I assist you today?" },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Function to handle sending the prompt
  const handleSend = async () => {
    if (!input.trim()) return;

    // If it's the first message, generate a conversation ID
    let convId = conversationId;
    if (!convId) {
      convId = uuidv4();
      setConversationId(convId);
    }

    // Add the user's message to the chat immediately
    const userMessage = { id: Date.now(), role: "user", content: input };
    setChat((prev) => [...prev, userMessage]);

    // Capture the current input before clearing it
    const currentInput = input;
    setInput("");

    try {
      // Send the prompt and conversation ID to the API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput, conversation_id: convId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Add the assistant's response to the chat
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
      };
      setChat((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      // Display the error message in the chat
      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: `Error: ${error.message}`,
        },
      ]);
    }
  };

  // Send on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Next.js Bot</h1>
        <div id="chat-container" className="space-y-4 mb-4">
          {chat.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto text-blue-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              <p>{message.content}</p>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}