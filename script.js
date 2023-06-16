document.addEventListener("DOMContentLoaded", function() {

  // initialisation de la map
  mapboxgl.accessToken = "pk.eyJ1IjoidGVob3JhIiwiYSI6ImNsaW9oemdidTA4eHAzZW8xMHY5YjRrbjMifQ._w_mIUJSzjkcHCBgNSd5qA";

  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [2.45, 42.7333],
    zoom: 9,
  });

  // ajout des contrôles de nav
  map.addControl(new mapboxgl.NavigationControl(), "top-left");

  // FONCTION pour charger les événements à partir du localStorage
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

  // Appeler la fonction de restitution du localStorage lors du chargement de la page
  window.addEventListener("load", loadEventDataFromLocalStorage);

  // FONCTION pour ajouter les markers colorés avec popups
  function addMarkerWithPopup(eventData) {
    let markerDiv = document.createElement("div");
    markerDiv.style.width = "25px";
    markerDiv.style.height = "25px";
    markerDiv.style.backgroundColor = "#ff0000";
    markerDiv.style.borderRadius = "50%";
    markerDiv.style.cursor = "pointer";

    // créer et colorer les markers en fonction des coordonnées géo et du delai
    let currentDate = Date.now(); // la date du jour de consultation
    let eventDate = new Date(eventData.start).getTime(); // récupérer la date de l'event
    let timeDiff = eventDate - currentDate; // calculer la différence
    // calculer le nombre de jours entre la date du jour de consultation et la date de l'event
    let daysDiff = Math.floor(timeDiff / (1000 * 3600 *24)); 
    
    // définir la couleur du marker
    let color;
    if(daysDiff > 3) {
      color = 'green'; // pour un event dans plus de trois jours
    } else if (daysDiff <= 3 && daysDiff >= 0) {
      color = 'orange'; // pour un event dans trois jours ou moins
    } else {
      color = 'red'; // event passé
    }
    
    let marker = new mapboxgl.Marker({ color: color }).setLngLat([eventData.longitude, eventData.latitude]).addTo(map);
    
    // améliorer le rendu des dates et horaires
    let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    
    // préparer la popup au passage de souris
    let hoverPopupContent = "<h4>" + eventData.title + "</h4>";
    hoverPopupContent += "<p>Date de début : " + new Date(eventData.start).toLocaleString('fr-FR', options) + "</p>";
    
    let hoverPopup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false}).setHTML(hoverPopupContent).setMaxWidth("400px");
    
    // préparer la popup au click
    let clickPopupContent = "<h4>" + eventData.title + "</h4>";
    clickPopupContent += "<p>" + eventData.description + "</p>";
    clickPopupContent += "<p>Date de début : " + new Date(eventData.start).toLocaleString('fr-FR', options) + "</p>";
    clickPopupContent += "<p>Date de fin : " + new Date(eventData.end).toLocaleString('fr-FR', options) + "</p>";
    
    let clickPopup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false }).setHTML(clickPopupContent).setMaxWidth("400px");
    
    // ajouter des messages dans les popup de markers orange et rouge
    if(color === 'orange') {
      let hoursDiff = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
      clickPopup.setHTML(clickPopupContent + "<p>Attention cet événement commence dans " + daysDiff + " jours et " + hoursDiff + " heures !</p>");
    } else if(color === 'red'){
      clickPopup.setHTML(clickPopupContent + "<p>Quel dommage ! Vous avez raté cet événement !");
    }
    
    // écouter les click et les hover
    marker.getElement().addEventListener('mouseenter', function () {
      marker.setPopup(hoverPopup).togglePopup();
    });

    marker.getElement().addEventListener('mouseleave', function () {
      marker.togglePopup();
    });  

    marker.getElement().addEventListener('click', function () {
      marker.setPopup(clickPopup).togglePopup();
    });

    // afficher le popup associé au click
    marker.setPopup(clickPopup);
  }

  // récupérer les données géo en cliquant sur la carte
  map.on('click', function(clickEvent) {
    let lngLat = clickEvent.lngLat;
    let latitude = lngLat.lat;
    let longitude = lngLat.lng;

    // remplir les champs longitude et latitude du formulaire
    document.getElementById("evento-lat").value = latitude;
    document.getElementById("evento-lon").value = longitude;
  });

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

    // charger les événements du localStorage
    loadEventDataFromLocalStorage();
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

  // bouton de mise à jour
  function updateData() {
    // réactualiser
    location.reload(); 
  }
  let updateButton = document.getElementById("update-button");
  updateButton.addEventListener("click", updateData);
});