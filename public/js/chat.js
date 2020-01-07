const socket = io();
const messageFom = document.querySelector("#message-form");
const sendLocation = document.querySelector("#send-location");
const input = document.querySelector("input");
const messageButton = document.querySelector("#send-message");
const messages = document.querySelector("#messages");
const chatSidebar = document.querySelector(".chat__sidebar");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoScroll = () => {
  const newMessage = messages.lastElementChild;
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const containerHeight = messages.scrollHeight;

  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", options => {
  const { username, text, createdAt } = options;
  if (!text) {
    return;
  }
  const html = Mustache.render(messageTemplate, {
    username: username,
    message: text,
    createdAt: moment(createdAt).format("h:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMes", options => {
  console.log(options);
  const { username, url, createdAt } = options;
  const html = Mustache.render(locationTemplate, {
    username: username,
    url: url,
    createdAt: moment(createdAt).format("h:mm a")
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  chatSidebar.innerHTML = html;
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
socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
