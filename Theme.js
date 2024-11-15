const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

const savedTheme = localStorage.getItem("theme") || "light-mode";
if (savedTheme === "dark-mode") {
  body.classList.add("dark-mode");
  themeToggle.checked = true;
}

if(themeToggle){
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark-mode");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light-mode");
    }
  });
}
