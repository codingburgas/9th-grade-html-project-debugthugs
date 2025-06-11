function switchTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", theme);
}

document.addEventListener("DOMContentLoaded", () => {
  initReportMap();

  const form = document.getElementById("incident-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("report-type").value;
    const team = document.getElementById("team-select").value;
    const coords = selectedCoords;
    const timestamp = new Date().toISOString();

    if (!type || !team || !coords) {
      alert("Моля, попълнете всички полета.");
      return;
    }

    const report = {
      type,
      team,
      lat: coords.lat,
      lng: coords.lng,
      timestamp,
    };

    // Save report
    const reports = JSON.parse(localStorage.getItem("fireReports") || "[]");
    reports.push(report);
    localStorage.setItem("fireReports", JSON.stringify(reports));

    // Set team as busy for 1 hour
    const oneHourLater = new Date().getTime() + 60 * 60 * 1000;
    teamAssignments[team] = oneHourLater;

    // Add to map
    L.marker([report.lat, report.lng])
      .addTo(map)
      .bindPopup(`${report.type}<br>${report.team}<br>${new Date(report.timestamp).toLocaleString()}`);

    alert("Докладът е записан. Екипът е изпратен!");
    form.reset();
    updateAssignedTeam(selectedCoords.lat, selectedCoords.lng);
  });
});
