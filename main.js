import { io } from 'socket.io-client';
import './style.css';

// Connect to backend server
const socket = io('http://localhost:5000'); // Make sure backend is running on port 5000
const roomId = 'global';

document.querySelector('#app').innerHTML = `
  <div class="chat-container">
    <h2>📢 Paperly Chat Room</h2>
    <div class="messages" style="height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"></div>
    <input id="messageInput" placeholder="Type a message..." style="width: 70%;" />
    <button id="sendBtn">Send</button>
  </div>
`;

// Join the chat room when connected
socket.on('connect', () => {
  console.log('✅ Connected to server');
  socket.emit('joinRoom', roomId);
});

// Log disconnect
socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

// Show incoming messages
socket.on('chatMessage', (data) => {
  const messagesDiv = document.querySelector('.messages');

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');

  const sender = data.sender === socket.id ? 'You' : 'User';
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${data.message}`;

  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Send message logic
const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');

sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chatMessage', {
      roomId,
      message,
      sender: socket.id
    });
    messageInput.value = '';
  }
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});
