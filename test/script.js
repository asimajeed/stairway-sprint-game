function setCookie(name, data, secsToLive) {
  expiry = new Date(Date.now() + secsToLive * 1000);
  document.cookie = `${name}=${data}; expires=${expiry.toUTCString()}`;
}

function getCookie(name) {
  let cookies = decodeURIComponent(document.cookie).split('; ')
  let cookie = cookies.find((str) => str.startsWith(name));
  if (cookie != undefined)
    return cookie.substring(cookie.indexOf('=') + 1);
}

function clearCookies() {
  if (document.cookie != "") {
    const cookies = decodeURIComponent(document.cookie).split('; ');
    for (let cookie of cookies) {
      console.log(cookie.slice(0, cookie.indexOf('=')));
      setCookie(cookie.slice(0, cookie.indexOf('=')), null, null);
    }
    console.log(document.cookie);
  }
}

document.addEventListener("DOMContentLoaded", function () {

  document.getElementById("bulb-button-0").addEventListener("click", toggleBulb);
  document.getElementById("bulb-button-1").addEventListener("click", toggleBulb);
  document.getElementById("clear-cookies-button").addEventListener("click", clearCookies);

  checkListUpdate: {
    todoItems = ["HTML", "CSS", "JS", "Small Project", "TypeScript", "Git | Github", "FIGMA", "PHOTOSHOP", "WORDPRESS", "Webflow", "REACT", "Node.js", "Android App Development", "FLUTTER", "AFTER EFFECTS"]
    let listCheckedArray = []
    function saveListToCookies() {
      let num = Number(this.id.split('-')[2]);
      listCheckedArray[num] = this.checked;
      setCookie("listArray", JSON.stringify(listCheckedArray), 7 * 24 * 60 * 60);
    }
    let i = 0, text = "";
    for (const item of todoItems) {
      text += `<input type="checkbox" class="todo-check" id="todo-check-${i}">`
      text += `<li class="todo-item">${item}</li>`
      i++;
    }
    document.getElementById("todo-ol").innerHTML = text;
    // Get checkList from cookies
    if (getCookie("listArray") != undefined)
      listCheckedArray = JSON.parse(getCookie("listArray"));

    i = 0;
    for (const item of todoItems) {
      const checkBox = document.getElementById(`todo-check-${i}`);
      if (listCheckedArray[i] != null) {
        checkBox.checked = listCheckedArray[i];
      }
      checkBox.addEventListener("click", saveListToCookies);
      i++;
    }
  }

  let bulbArray = [];
  if (getCookie("bulbArray")) {
    bulbArray = JSON.parse(getCookie("bulbArray"));
    document.getElementById("bulb0").style.backgroundColor = bulbArray[0].state ? 'yellow' : '#8080808a';
    if (bulbArray[1].state)
      document.getElementById("bulb1").style.backgroundColor = bulbArray[1].state ? 'yellow' : '#8080808a';
  }

  function toggleBulb() {
    const num = Number(this.id.slice(-1));
    if (!bulbArray[num]) {
      bulbArray[num] = { state: false };
    }
    bulbArray[num].state = !bulbArray[num].state;
    document.getElementById(`bulb${num}`).style.backgroundColor = bulbArray[num].state ? 'yellow' : '#8080808a';
    document.querySelector("p").innerText = JSON.stringify(bulbArray);
    setCookie("bulbArray", JSON.stringify(bulbArray), 24 * 60 * 60);
  }
  let themeFlag = (getCookie('theme') ? JSON.parse(getCookie('theme')) : false)
  {
    if (themeFlag == true) {
      document.querySelector("body").style.backgroundColor = "black";
      for (const element of document.querySelectorAll("*")) {
        if (element.tagName.toLowerCase() != "button")
          element.style.color = "white";
      }
    }
    else {
      document.querySelector("body").style.backgroundColor = "white";
      for (const element of document.querySelectorAll("*")) {
        if (element.tagName.toLowerCase() != "button")
          element.style.color = "black";
      }
    }
  }
  document.getElementById("theme-button").addEventListener("click", () => {
    themeFlag = !themeFlag;
    setCookie('theme', JSON.stringify(themeFlag), 24 * 3600);
    if (themeFlag == true) {
      document.querySelector("body").style.backgroundColor = "black";
      for (const element of document.querySelectorAll("*")) {
        if (element.tagName.toLowerCase() != "button")
          element.style.color = "white";
      }
    }
    else {
      document.querySelector("body").style.backgroundColor = "white";
      for (const element of document.querySelectorAll("*")) {
        if (element.tagName.toLowerCase() != "button")
          element.style.color = "black";
      }
    }
  })
});