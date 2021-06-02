const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

var userInput = ""

if (messageForm != null) {
	var userInput = prompt("What is your name?")
	appendUser(userInput, "joined")
	socket.emit('new-user', userInput)

	messageForm.addEventListener('submit', e => {
		e.preventDefault()
		const message = messageInput.value
		console.log(message)
		appendMessage(userInput, message)
		socket.emit('send-chat-message', message)
		messageInput.value = ''
	})
}

socket.on('chat-message', data => {
	appendMessage(data.username, data.message)
})

socket.on('user-connected', name => {
	appendUser(name, "joined")
})

socket.on('user-disconnected', name => {
	appendUser(name, "left")
})

function appendMessage(username, message){
	const newData = document.createElement('li')
	var newDataSender = ''
	if(username == userInput){
		newDataSender =  '<p class="sender">' + username + ' (you) </p>'
		newData.className = "you"
	} else newDataSender =  '<p class="sender">' + username + '</p>'
	const newDataMessage = '<p class="message">' + message + '</p>'
	newData.innerHTML = newDataSender + newDataMessage
	messageContainer.append(newData)
}

function appendUser(username, status){
	const newData = document.createElement('li')
	const newDataUser = '<p class="message"><b>' + username + '</b> has ' + status + ' the room</p>'
	newData.className = "join"
	newData.innerHTML = newDataUser;
	messageContainer.append(newData)
}