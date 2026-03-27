import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../utils/config";

interface GroupChatProps {
  groupId: string;
}

interface Message {
  _id: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export default function GroupChat({ groupId }: GroupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getToken = () => {
    const guestToken = localStorage.getItem(`guestToken_${groupId}`);
    if (guestToken) return guestToken;
    return localStorage.getItem("token") || "";
  };

  const getSenderName = () => {
    const guestName = localStorage.getItem(`guestName_${groupId}`);
    if (guestName) return guestName;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      return `${u.firstName} ${u.lastName}`.trim();
    }
    return "Unknown";
  };

  const fetchMessages = async () => {
    if (!groupId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/chat`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "x-guest-token": getToken()
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
          "x-guest-token": getToken()
        },
        body: JSON.stringify({
          senderName: getSenderName(),
          text: newMessage
        })
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "500px", background: "white", borderRadius: "12px", border: "1px solid var(--color-gray-200)", overflow: "hidden" }}>
      <div style={{ padding: "16px", background: "var(--color-primary)", color: "white", fontWeight: 600 }}>
        Group Chat
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", background: "var(--color-gray-50)" }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--color-gray-500)", marginTop: "20px" }}>No messages yet. Start the conversation!</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderName === getSenderName();
            return (
              <div key={msg._id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-gray-500)", marginBottom: "4px", textAlign: isMe ? "right" : "left" }}>
                  {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ 
                  background: isMe ? "var(--color-primary)" : "white", 
                  color: isMe ? "white" : "var(--color-gray-900)", 
                  padding: "10px 14px", 
                  borderRadius: "16px", 
                  borderTopRightRadius: isMe ? "4px" : "16px",
                  borderTopLeftRadius: !isMe ? "4px" : "16px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  border: isMe ? "none" : "1px solid var(--color-gray-200)"
                }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px", padding: "16px", background: "white", borderTop: "1px solid var(--color-gray-200)" }}>
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "12px 16px", borderRadius: "24px", border: "1px solid var(--color-gray-300)", background: "var(--color-gray-50)" }}
        />
        <button type="submit" style={{ background: "var(--color-primary)", color: "white", border: "none", borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
