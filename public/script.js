const socket = io();
const joinButton = document.getElementById('joinButton');
const createButton = document.getElementById('createButton');
const codeInput = document.getElementById('codeInput');
const usernameInput = document.getElementById('usernameInput');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userCount = document.getElementById('userCount');

let currentRoom = null;
let username = null;

createButton.addEventListener('click', function() {
  username = usernameInput.value;
  if (username) {
    socket.emit('createRoom', username);
  } else {
    alert('Please enter a username');
  }
});

joinButton.addEventListener('click', function() {
  const roomCode = codeInput.value;
  username = usernameInput.value;
  if (roomCode && username) {
    socket.emit('joinRoom', { roomCode, username });
  } else {
    alert('Please enter both room code and username');
  }
});

socket.on('roomCreated', (roomCode) => {
  alert(`Room created! Your room code is ${roomCode}`);
});

socket.on('joinSuccess', ({ roomCode, username }) => {
  currentRoom = roomCode;
  document.getElementById('joinContainer').style.display = 'none';
  document.getElementById('chatContainer').style.display = 'block';
});

socket.on('joinFailure', () => {
  alert('Failed to join: invalid code or room is full.');
});

form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', { roomCode: currentRoom, msg: input.value, username });
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on('userCount', function(count) {
  userCount.textContent = `Users in chat: ${count}`;
});
