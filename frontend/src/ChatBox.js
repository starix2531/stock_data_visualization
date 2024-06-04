import React, { useState } from 'react';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(true);

  const handleInputChange = (event) => {
    setInputMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    const newMessage = { sender: 'User', text: inputMessage };
    const updatedMessages = [...messages, newMessage];
    
    // Update the state with the new user message
    setMessages(updatedMessages);
    setInputMessage('');

    try {
      // Fetch the access token from the API deployed on Cloud Run
      const tokenResponse = await fetch(' YOU TOKEN API  ');
      const tokenData = await tokenResponse.json();
      const token = tokenData.token;

      const response = await fetch('YOUR GPT API', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt: inputMessage }],
          parameters: { temperature: 0.7, max_length: 256 }
        }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data);

      // Extract the content after "Output:"
      const output = data.predictions[0];
      const outputText = output.split("Output:")[1].trim();

      const botMessage = { sender: 'Llama3', text: outputText };
      // Update the state with the bot's message
      setMessages([...updatedMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleChatBox = () => {
    setIsChatBoxOpen(!isChatBoxOpen);
  };

  return (
    <div className={`fixed bottom-4 right-4 bg-white shadow-md rounded-lg ${isChatBoxOpen ? 'w-96 h-128' : 'w-12 h-12'}`}>
      {isChatBoxOpen ? (
        <>
          <div className="flex justify-between items-center bg-blue-300 rounded-t-lg p-2">
            <span className="font-bold">Llama3 Chat</span>
            <button
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleChatBox}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
          <div className="h-96 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={index} className="mb-2">
                <span className="font-bold">{message.sender}: </span>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
          <div className="p-4">
            <div className="flex">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 mr-2"
                placeholder="Message Llama3"
                value={inputMessage}
                onChange={handleInputChange}
              />
              <button
                className="bg-blue-500 text-white rounded-lg px-6 py-2"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </>
      ) : (
        <button
          className="w-full h-full flex justify-center items-center text-blue-500 hover:text-blue-700 focus:outline-none"
          onClick={toggleChatBox}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatBox;
