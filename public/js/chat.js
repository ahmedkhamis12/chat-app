const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;

//Options
const {username, room} =Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: message.createdAt
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //disable the send button
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {

    //enable the send button
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = ''
    $messageFormInput.focus();

    if (error) {
      console.log(error);
    }
    console.log("The message was delivered!");
  });
});

socket.emit('join',{username, room},(error)=>{
  if (error) {
    alert(error);
    location.href ='/'
  }
})
