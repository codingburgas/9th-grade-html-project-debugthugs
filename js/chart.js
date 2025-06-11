let incidentChart;

function updateChart() {
  const ctx = document.getElementById("incidentChart").getContext("2d");

  // Load reports from localStorage
  const reports = JSON.parse(localStorage.getItem("fireReports") || "[]");

  // Bucket reports by hour
  const countsByHour = {};

  reports.forEach(report => {
    const date = new Date(report.timestamp);

    // Format: '11.06.2025 23:00'
    const hourKey = date.toLocaleString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: undefined
    }).replace(/:\d{2}$/, ":00"); // Round to the hour

    if (!countsByHour[hourKey]) {
      countsByHour[hourKey] = { fire: 0, crash: 0 };
    }

    if (report.type === "Пожар") {
      countsByHour[hourKey].fire += 1;
    } else if (report.type === "Катастрофа") {
      countsByHour[hourKey].crash += 1;
    }
  });

  const sortedHours = Object.keys(countsByHour).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const fireData = sortedHours.map(hour => countsByHour[hour].fire);
  const crashData = sortedHours.map(hour => countsByHour[hour].crash);

  if (incidentChart) {
    // Update existing chart
    incidentChart.data.labels = sortedHours;
    incidentChart.data.datasets[0].data = fireData;
    incidentChart.data.datasets[1].data = crashData;
    incidentChart.update();
  } else {
    // Create new chart
    incidentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedHours,
        datasets: [
          {
            label: 'Пожари',
            data: fireData,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'Катастрофи',
            data: crashData,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Произшествия на час'
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Час' },
            ticks: {
              autoSkip: true,
              maxRotation: 90,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Брой' },
            precision: 0
          }
        }
      }
    });
  }
}

// Auto-run on page load
document.addEventListener("DOMContentLoaded", updateChart);
