$( document ).on("ready, page:change",function() {
  var path = window.location.pathname;

  if(path.search(/export$/)!=-1){

    L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
    var map = L.mapbox.map('map', 'thanosbel.lmm46d4d',{
      zoomControl: false
    });

  // create the initial directions object, from which the layer
  // and inputs will pull data.
  directions = L.mapbox.directions({units: 'metric'});

  directionsLayer = L.mapbox.directions.layer(directions)
  .addTo(map);

  var directionsInputControl = L.mapbox.directions.inputControl('inputs', directions)
  .addTo(map);

  var directionsErrorsControl = L.mapbox.directions.errorsControl('errors', directions)
  .addTo(map);

  var directionsRoutesControl = L.mapbox.directions.routesControl('routes', directions)
  .addTo(map);

  var directionsInstructionsControl = L.mapbox.directions.instructionsControl('instructions', directions)
  .addTo(map);
  var link=undefined;
  link = document.createElement("a");
  link.className += "btn ";
  link.className += "btn-default ";
  link.className += "disabled";
  link.role = "button"
  link.download = "your_route.json"
  link.innerHTML = "download route";

  var url = window.URL || window.webkitURL;


  document.getElementById("download-button").appendChild(link);


  var routeGeoJson= undefined;
  var blob=undefined;
  directions.on('load' , function(e){

    routeGeoJson = {type: "Feature", geometry: e.routes[0].geometry};

    blob = new Blob( [JSON.stringify(routeGeoJson)] , {type: "application/json"})
    link.href= url.createObjectURL(blob);
    $(link).removeClass("disabled").addClass("enabled");



  });

  directions.on('origin destination', function(e){
    $(link).removeClass("enabled").addClass("disabled");
  })



 }
});
