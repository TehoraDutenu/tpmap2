mapboxgl.accessToken = "pk.eyJ1IjoidGVob3JhIiwiYSI6ImNsaW9oemdidTA4eHAzZW8xMHY5YjRrbjMifQ._w_mIUJSzjkcHCBgNSd5qA";

let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [2.45, 42.7333],
  zoom: 9,
});

map.addControl(new mapboxgl.NavigationControl(), "top-left");

// Fonction pour charger les événements à partir du localStorage
function loadEventDataFromLocalStorage() {
  let savedEventData = localStorage.getItem("eventData");
  if (savedEventData) {
    savedEventData = JSON.parse(savedEventData);

    for (let i = 0; i <savedEventData.length; i++) {
      let eventData = savedEventData[i];
      console.log("Adding marker with popup for event:", eventData);
      addMarkerWithPopup(eventData);
    }
  }
}

// Appeler la fonction lors du chargement de la page
window.addEventListener("load", loadEventDataFromLocalStorage);

// Fonction pour ajouter un marqueur avec une popup associée
function addMarkerWithPopup(eventData) {
  let markerDiv = document.createElement("div");
  markerDiv.style.width = "25px";
  markerDiv.style.height = "25px";
  markerDiv.style.backgroundColor = "#ff0000";
  markerDiv.style.borderRadius = "50%";
  markerDiv.style.cursor = "pointer";
  
  let marker = new mapboxgl.Marker().setLngLat([eventData.longitude, eventData.latitude]).addTo(map);

  let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

  let hoverPopupContent = "<h4>" + eventData.title + "</h4>";
  hoverPopupContent += "<p>Date de début : " + new Date(eventData.start).toLocaleString('fr-FR', options) + "</p>";

  let hoverPopup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false}).setHTML(hoverPopupContent).setMaxWidth("400px");

  let clickPopupContent = "<h4>" + eventData.title + "</h4>";
  clickPopupContent += "<p>" + eventData.description + "</p>";
  clickPopupContent += "<p>Date de début : " + new Date(eventData.start).toLocaleString('fr-FR', options) + "</p>";
  clickPopupContent += "<p>Date de fin : " + new Date(eventData.end).toLocaleString('fr-FR', options) + "</p>";

  let clickPopup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false }).setHTML(clickPopupContent).setMaxWidth("400px");

  marker.getElement().addEventListener('mouseenter', function () {
    marker.setPopup(hoverPopup).togglePopup();
  });

  marker.getElement().addEventListener('mouseleave', function () {
    marker.togglePopup();
  });  

  marker.getElement().addEventListener('click', function () {
    marker.setPopup(clickPopup).togglePopup();
  });

  marker.setPopup(clickPopup);
}

// Fonction pour ajouter un nouvel événement
function addEvent(eventData) {
  let eventArray = [];

  let savedEventData = localStorage.getItem("eventData");
  if (savedEventData) {
    eventArray = JSON.parse(savedEventData);
  }

  if (!Array.isArray(eventArray)) {
    eventArray = [];
  }
  
  eventArray.push(eventData);

  localStorage.setItem("eventData", JSON.stringify(eventArray));
}

// Écouter l'événement de soumission du formulaire
document.querySelector(".form-evento").addEventListener("submit", function (locEvent) {
  locEvent.preventDefault(); // Empêcher le rechargement de la page

  let title = document.getElementById("evento-title").value;
  let description = document.getElementById("evento-description").value;
  let latitude = parseFloat(document.getElementById("evento-lat").value);
  let longitude = parseFloat(document.getElementById("evento-lon").value);
  let startDate = document.getElementById("evento-start").value;
  let endDate = document.getElementById("evento-end").value;

  if (isNaN(latitude) || isNaN(longitude)) {
    alert("Veuillez entrer des valeurs valides pour la latitude et la longitude.");
    return;
  }

  let eventData = {
    title: title,
    description: description,
    latitude: latitude,
    longitude: longitude,
    start: startDate,
    end: endDate
  };

  addEvent(eventData);
  addMarkerWithPopup(eventData);

  // Vider le formulaire
  document.getElementById("evento-title").value = "";
  document.getElementById("evento-description").value = "";
  document.getElementById("evento-start").value = "";
  document.getElementById("evento-end").value = "";
  document.getElementById("evento-lat").value = "";
  document.getElementById("evento-lon").value = "";
});