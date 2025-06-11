let totalReports = 0;
let fireReports = 0;
let accidentReports = 0;

let incidentChart;

function switchTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", theme);
}

function initChart() {
  const ctx = document.getElementById('incidentChart').getContext('2d');
  incidentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Общо', 'Пожари', 'Катастрофи'],
      datasets: [{
        label: 'Брой сигнали',
        data: [totalReports, fireReports, accidentReports],
        backgroundColor: ['blue', 'red', 'orange']
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#fff'
          }
        }
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initChart();

  const form = document.getElementById("incident-form");

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();

      const incidentType = form.querySelector('[name="incidentType"]').value;

      totalReports++;
      if (incidentType === 'Пожар') {
        fireReports++;
      } else if (incidentType === 'Катастрофа') {
        accidentReports++;
      }

      incidentChart.data.datasets[0].data = [
        totalReports,
        fireReports,
        accidentReports
      ];
      incidentChart.update();

      alert("Произшествието е докладвано успешно!");
      form.reset();
    });
  } else {
    console.error("Формуляр с id 'incident-form' не е намерен.");
  }
});