const map = L.map('mapid').setView([42.6975, 23.3242], 10); // Sofia

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

L.marker([42.6975, 23.3242]).addTo(map)
  .bindPopup('Произшествие 1')
  .openPopup();
