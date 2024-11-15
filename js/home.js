

let HomePagetitle = document.getElementById("HomePagetitle");
HomePagetitle.innerText = "Home"

document.addEventListener("DOMContentLoaded", () => {
    const dropdownButton = document.getElementById("dropdownDefaultButton");
    const dropdownMenu = document.getElementById("dropdown");

    dropdownButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden");
    });
  });