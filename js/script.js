const btn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
const input = document.getElementById("link-input");
const linkForm = document.getElementById("link-form");
const errMsg = document.getElementById("err-msg");
const formWrapper = document.getElementById('form-wrapper')

btn.addEventListener("click", navToggle);
linkForm.addEventListener("submit", formSubmit);

// Toggle Mobile Menu
function navToggle() {
  btn.classList.toggle("open");
  menu.classList.toggle("flex");
  menu.classList.toggle("hidden");
}

function validURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
      "((\\d{1,3}\\.){3}\\d{1,3}))" +
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
      "(\\?[;&a-z\\d%_.~+=-]*)?" +
      "(\\#[-a-z\\d_]*)?$",
    "i",
  );
  return !!pattern.test(str);
}

function formSubmit(e) {
  e.preventDefault();

  if (input.value.trim() === "") {
    errMsg.innerHTML = "Please enter something";
    input.classList.add("border-red");
  } else if (!validURL(input.value)) {
    errMsg.innerHTML = "Please enter a valid URL";
    input.classList.add("border-red");
  } else {
    errMsg.innerHTML = "";
    input.classList.remove("border-red");
    shortenUrl(input.value.trim());
  }
}

const apiUrl = "https://smolurl.com/api/links";

async function shortenUrl(longUrl) {
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: longUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response Error:", errorText);
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (data.data && data.data.short_url) {
      displayShortenedUrl(longUrl, data.data.short_url);
    } else if (data.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error:", error);
    errMsg.innerHTML = "Failed to shorten the URL. Please try again.";
  }
}

function displayShortenedUrl(originalUrl, shortUrl) {
  const linkContainer = document.createElement("div");
  linkContainer.classList.add(
    "flex",
    "flex-col",
    "items-center",
    "justify-between",
    "w-full",
    "p-6",
    "bg-white",
    "rounded-lg",
    "md:flex-row",
  );

  const originalLink = document.createElement("p");
  originalLink.classList.add(
    "font-bold",
    "text-center",
    "text-veryDarkViolet",
    "md:text-left",
  );
  originalLink.textContent = originalUrl;

  const shortLinkContainer = document.createElement("div");
  shortLinkContainer.classList.add(
    "flex",
    "flex-col",
    "items-center",
    "justify-end",
    "space-x-4",
    "space-y-2",
    "md:flex-row",
    "md:space-y-0",
  );

  const shortLink = document.createElement("div");
  shortLink.classList.add("font-bold", "text-cyan", "short-text");
  shortLink.textContent = shortUrl;

  const copyButton = document.createElement("button");
  copyButton.classList.add(
    "p-2",
    "px-8",
    "text-white",
    "bg-cyan",
    "rounded-lg",
    "hover:opacity-70",
    "focus:outline-none",
  );
  copyButton.textContent = "Copy";
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      copyButton.textContent = "Copied!";
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 2000);
    });
  });

  shortLinkContainer.appendChild(shortLink);
  shortLinkContainer.appendChild(copyButton);
  linkContainer.appendChild(originalLink);
  linkContainer.appendChild(shortLinkContainer);
  formWrapper.appendChild(linkContainer);

  input.value = ""; // Clear the input field after submission
}
