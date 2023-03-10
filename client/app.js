import Swal from "sweetalert2";

import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const chatContainer = document.getElementById("chat_container");
const form = document.querySelector("form");

let loadInterval;

Swal.fire("Catto - Your Coding AI", "Ask Anything You Want", "info");

const loader = (element) => {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
};

const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

const generateUniqueID = () => {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimal = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimal}`;
};

const chatStripe = (isAi, value, uniqueID) => {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? "bot" : "user"}" />
        </div>
        <div class="message" id=${uniqueID}>${value}</div>
      </div>
    </div>
    `;
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // Bot's chatstripe
  const uniqueID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueID);
  loader(messageDiv);

  // Fetch data from server
  const response = await fetch("https://dull-lime-python-sari.cyclic.app/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    messageDiv.innerHTML = "Something went wrong";
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});
