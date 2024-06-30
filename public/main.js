// Initialize socket.io client
var socket = io();

var usernameForm = document.getElementById('username-form');
var usernameInput = document.getElementById('username');
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');
var exitButton = document.getElementById('exit');
var clearButton = document.getElementById('clear');

var username;

// Function to format the current time
function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

// Handle username form submission
usernameForm.addEventListener('submit', function(e) {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (username) {
    usernameForm.style.display = 'none';
    messages.style.display = 'block';
    form.style.display = 'flex';
    exitButton.style.display = 'inline';
    clearButton.style.display = 'inline';
    socket.emit('join', username);
  }
});

// Handle form submission
form.addEventListener('submit', function(e) {
  e.preventDefault();  // Prevent form from submitting the traditional way
  if (input.value) {
    var currentTime = formatTime(new Date());
    // Emit 'chat message' event to the server with the message and current time
    socket.emit('chat message', { text: input.value, time: currentTime, user: username });
    // Clear the input field
    input.value = '';
  }
});

// Listen for 'chat message' events from the server
socket.on('chat message', function(msg) {
  // Create a new list item for the message
  var item = document.createElement('li');
  item.innerHTML = `<strong>${msg.user}:</strong>&nbsp;<span class="message-text">${msg.text}</span><span class="message-time">${msg.time}</span>`;
  // Append the message to the messages list
  messages.appendChild(item);
  // Scroll to the bottom of the chat
  messages.scrollTop = messages.scrollHeight;
});

// Handle exit button click
exitButton.addEventListener('click', function() {
  usernameForm.style.display = 'flex';
  messages.style.display = 'none';
  form.style.display = 'none';
  exitButton.style.display = 'none';
  clearButton.style.display = 'none';
  socket.emit('leave', username);
  usernameInput.value = '';
  username = null;
  messages.innerHTML = '';
});

// Handle clear button click
clearButton.addEventListener('click', function() {
  messages.innerHTML = '';
});

// Listen for 'user joined' and 'user left' events from the server 
socket.on('user joined', function(user) {
  console.log(`User joined event received for ${user}`);
  var item = document.createElement('li');
  item.textContent = `${user} joined the chat`;
  item.style.fontStyle = 'italic';
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('user left', function(user) {
  console.log(`User left event received for ${user}`);
  var item = document.createElement('li');
  item.textContent = `${user} left the chat`;
  item.style.fontStyle = 'italic';
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
