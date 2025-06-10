function switchTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", theme);
}

document.getElementById("incident-form").addEventListener("submit", e => {
  e.preventDefault();
  alert("Произшествието е докладвано!");
});
