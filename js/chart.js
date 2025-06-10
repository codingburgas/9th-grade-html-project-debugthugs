const ctx = document.getElementById('incidentChart').getContext('2d');
const incidentChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Пожари', 'Катастрофи', 'Друго'],
    datasets: [{
      label: 'Произшествия',
      data: [12, 5, 3],
      backgroundColor: ['red', 'orange', 'gray']
    }]
  }
});
