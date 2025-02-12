// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Create the Supabase client using public keys (this is safe if your DB policies allow it)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: number | string;
  role: string;
  content: string;
}

export default function Home() {
  // Local state for chat messages, the input field, the current conversation, and the list of conversations
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<string[]>([]);

  // Fetch the list of conversation IDs from Supabase (grouping distinct conversation_id values)
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("conversation_id");
    if (error) {
      console.error("Error fetching conversations:", error);
      return;
    }
    if (data) {
      // Create a set of unique conversation IDs
      const uniqueConversations = Array.from(new Set(data.map((item: any) => item.conversation_id)));
      setConversations(uniqueConversations);
    }
  };

  // Fetch full chat history for a specific conversation_id from Supabase
  const fetchChatHistory = async (convId: string) => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("conversation_id", convId)
      .order("position_id", { ascending: true });
    if (error) {
      console.error("Error fetching chat history:", error);
      return;
    }
    if (data) {
      const messages = data.map((msg: any) => ({
        id: msg.position_id,
        role: msg.role,
        content: msg.message,
      }));
      setChat(messages);
    }
  };

  // When the component mounts, load the conversation list and the last active conversation (if any)
  useEffect(() => {
    fetchConversations();
    const storedConvId = localStorage.getItem("conversationId");
    if (storedConvId) {
      setConversationId(storedConvId);
      fetchChatHistory(storedConvId);
    }
  }, []);

  // When a user clicks on a conversation in the sidebar, load that conversation
  const handleConversationSelect = (convId: string) => {
    setConversationId(convId);
    localStorage.setItem("conversationId", convId);
    fetchChatHistory(convId);
  };

  // Handle sending a new message
  const handleSend = async () => {
    if (!input.trim()) return;

    let convId = conversationId;
    if (!convId) {
      // If no conversation is active, create a new conversation id
      convId = uuidv4();
      setConversationId(convId);
      localStorage.setItem("conversationId", convId);
      // Refresh conversation list as a new conversation has been started
      fetchConversations();
    }

    // Append the user's message to the chat UI immediately
    const userMessage = { id: Date.now(), role: "user", content: input };
    setChat((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    try {
      // Send the prompt along with the conversation_id to the API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput, conversation_id: convId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      // Append the assistant's response to the chat UI
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message,
      };
      setChat((prev) => [...prev, assistantMessage]);
      // Refresh the conversation list in case a new conversation was created
      fetchConversations();
    } catch (error: any) {
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

  // Handle Enter key for sending messages
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for conversation list */}
      <div className="w-1/4 border-r border-gray-300 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Conversations</h2>
        <ul>
          {conversations.map((conv) => (
            <li key={conv}>
              <button
                onClick={() => handleConversationSelect(conv)}
                className={`w-full text-left p-2 rounded hover:bg-gray-200 ${
                  conv === conversationId ? "bg-gray-300" : ""
                }`}
              >
                {conv}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main chat window */}
      <div className="flex flex-col w-3/4 p-4">
        <div className="flex-grow mb-4 overflow-y-auto" id="chat-container">
          {chat.map((message) => (
            <div
              key={message.id}
              className={`mb-2 p-2 rounded ${
                message.role === "user" ? "text-right bg-blue-100" : "text-left bg-gray-100"
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