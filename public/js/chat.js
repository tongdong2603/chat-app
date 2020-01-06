const socket = io();
const messageFom = document.querySelector("#message-form");
const sendLocation = document.querySelector("#send-location");
const input = document.querySelector("input");
const messageButton = document.querySelector("#send-message");
const messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template");

socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
});

messageFom.addEventListener("submit", e => {
  e.preventDefault();
  messageButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, error => {
    messageButton.removeAttribute("disabled");
    input.value = "";
    input.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

sendLocation.addEventListener("click", e => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not support by your browser");
  }
  sendLocation.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition(position => {
    const latitude = position.coords.latitude;
    const longtitude = position.coords.longitude;
    socket.emit(
      "sendLocation",
      {
        latitude,
        longtitude
      },
      () => {
        sendLocation.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});
