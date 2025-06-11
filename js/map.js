let map, marker, selectedCoords = null;
let currentStation = null;

function getDistance(lat1, lon1, lat2, lon2) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestStation(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  for (const station of fireStations) {
    const [sLat, sLng] = station.coords;
    const dist = getDistance(lat, lng, sLat, sLng);
    if (dist < minDist) {
      minDist = dist;
      nearest = station;
    }
  }
  return nearest;
}

function updateAssignedTeam(lat, lng) {
  currentStation = findNearestStation(lat, lng);
  const info = document.getElementById('assigned-team');

  if (currentStation) {
    const availableTeam = getAvailableTeam(currentStation);
    if (availableTeam) {
      info.textContent = `Назначен екип: ${availableTeam} (${currentStation.name})`;
      info.dataset.team = availableTeam;
    } else {
      info.textContent = `Всички екипи в ${currentStation.name} са заети (изчакайте)`;
      info.dataset.team = '';
    }
  } else {
    info.textContent = 'Няма наличен екип';
    info.dataset.team = '';
  }
}

function isTeamAvailable(station, team) {
  const lastAssigned = station.availability[team];
  if (!lastAssigned) return true;
  const now = Date.now();
  return now - lastAssigned >= 60 * 60 * 1000; // 1 hour
}

function loadAvailabilityFromStorage() {
  const saved = JSON.parse(localStorage.getItem("teamAvailability") || "{}");
  for (const station of fireStations) {
    station.availability = saved[station.name] || {};
  }
}

function saveAvailabilityToStorage() {
  const data = {};
  for (const station of fireStations) {
    data[station.name] = station.availability;
  }
  localStorage.setItem("teamAvailability", JSON.stringify(data));
}

function getAvailableTeam(station) {
  for (const team of station.teams) {
    if (isTeamAvailable(station, team)) return team;
  }
  return null;
}

function loadAndRenderReports() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  let reports = JSON.parse(localStorage.getItem('fireReports') || '[]');
  let teamAvailability = JSON.parse(localStorage.getItem('teamAvailability') || '{}');

  reports = reports.map(report => {
    const reportTime = new Date(report.timestamp).getTime();
    const isExpired = now - reportTime > oneHour;

    if (isExpired && report.active) {
      report.active = false;

      // Free team if assigned
      if (report.team && teamAvailability[report.team]) {
        delete teamAvailability[report.team];
      }
    }

    // Only render active markers
    if (report.active) {
      L.marker([report.lat, report.lng])
        .addTo(map)
        .bindPopup(`${report.type}<br>${report.team}<br>${new Date(report.timestamp).toLocaleString()}`);
    }

    return report;
  });

  localStorage.setItem('fireReports', JSON.stringify(reports));
  localStorage.setItem('teamAvailability', JSON.stringify(teamAvailability));
}


function initReportMap() {
  loadAvailabilityFromStorage();

  map = L.map('mapid').setView([42.5, 27.47], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  map.on('click', function (e) {
    selectedCoords = e.latlng;
    if (!marker) {
      marker = L.marker(e.latlng).addTo(map);
    } else {
      marker.setLatLng(e.latlng);
    }
    updateAssignedTeam(e.latlng.lat, e.latlng.lng);
  });

  loadAndRenderReports();
}

// Search by address
document.getElementById('addressSearch').addEventListener('keydown', async function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = this.value;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data && data[0]) {
      const { lat, lon } = data[0];
      selectedCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
      map.setView(selectedCoords, 14);
      if (!marker) {
        marker = L.marker(selectedCoords).addTo(map);
      } else {
        marker.setLatLng(selectedCoords);
      }
      updateAssignedTeam(selectedCoords.lat, selectedCoords.lng);
    }
  }
});

// Submit report
document.getElementById('submit-report').addEventListener('click', function () {
  const type = document.getElementById('incident-type').value;
  const assignedTeam = document.getElementById('assigned-team').dataset.team;

  if (!selectedCoords || !type || !assignedTeam || !currentStation) {
    alert('Невалиден доклад: място, тип или свободен екип липсва.');
    return;
  }

  const now = Date.now();
  currentStation.availability[assignedTeam] = now;
  saveAvailabilityToStorage();

  const report = {
    lat: selectedCoords.lat,
    lng: selectedCoords.lng,
    type,
    team: assignedTeam,
    timestamp: new Date().toISOString(),
    active: true
  };

  const reports = JSON.parse(localStorage.getItem('fireReports') || '[]');
  reports.push(report);
  localStorage.setItem('fireReports', JSON.stringify(reports));

  alert(`Докладът е записан. Изпраща се ${report.team} от ${report.station}.`);

  L.marker([report.lat, report.lng])
    .addTo(map)
    .bindPopup(`${report.type}<br>${report.team}<br>${new Date(report.timestamp).toLocaleString()}`);

  updateChart();
});
