$( document).ready(function() {
  var path = window.location.pathname;
  if(path.search(/\/search$/) -1){
    clearFields();
    L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
    map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
    map.setZoom(2);
    myGeocoder = L.Control.geocoder().addTo(map);
    myGeocoder.markGeocode = markerFromGeocode;
    drawnLayers ={size:0};


    geolocationControl = L.control.accurateLocateControl({drawnLayers: drawnLayers});
    map.addControl(geolocationControl);

  }
  
  $("#radius").change(function(){
     radius = parseInt($("#radius").val());
        if(typeof drawnLayers.userCircle !=='undefined'){
          drawnLayers.userCircle.setRadius(radius);
        }
  });
  $("#trail-search-form").on("ajax:success", function(e, data , status ,xhr){
     if(typeof data.message =='undefined'){
        featureLayer = L.mapbox.featureLayer(data).addTo(map);
        drawnLayers.featureLayer = featureLayer;

         $("#results").append(xhr.responseText)
    } else {
      $("#results").append(data.message)
    }

   })
  $("#trail-search-form").on("ajax:before", function(e , data, status, xhr){
    $("#results").empty();
     if(typeof featureLayer !=='undefined'){
          map.removeLayer(featureLayer)
     }
     if($("#location:hidden").val()==''){
       return false;
     }
  });



});

function clearCustomLayers(drawnLayers){
  for( var key in drawnLayers){
    if (key != "size"){
      removeDrawnLayer(key,drawnLayers);
    }
  }
}
function removeDrawnLayer(layerType ,drawnLayers){
  map.removeLayer(drawnLayers[layerType]);
  delete drawnLayers[layerType];
  drawnLayers.size--;
}

function clearFields(){
 $("#location:hidden").val('');
 $("#location").val('');
 $("#results").empty();
}
function setLocation(latlng , name){
  clearFields();
  $("#lnglat:hidden").val([latlng.lng, latlng.lat]);
  if(!name){
    myGeocoder.options.geocoder.reverse(latlng , 12 , function(results){
        var r = results[0];
        name = r.name
        $("#location").val(name);
    });
  }
  $("#location").val(name);
}

function addCustomCircleMarker(position , drawnLayers){
 var userMarker = L.marker( position, {
                             draggable:true,
                             title: 'Start Search Point- You can move me around if you want',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 'star',
                              'marker-color': '00E263'
                             })
                    }).setBouncingOptions({
                        bounceHeight: 25
                      });
  userMarker.addTo(map).bounce(4);
  drawnLayers.userMarker = userMarker;
  drawnLayers.size++;

  userCircle = L.circle();
  userMarker.on('drag' , function(e){
    userCircle.setLatLng(userMarker.getLatLng());
  });

  userCircle.setLatLng(position);
  userCircle.setRadius($("#radius").val());
  userCircle.addTo(map);
  drawnLayers.userCircle = userCircle;
  drawnLayers.size++;

  window.setTimeout(function(){
    map.setView(position , 13);
  },3000);
  userMarker.on('drag' , function(e){
    userCircle.setLatLng(userMarker.getLatLng());
  });

  userMarker.on('dragend', function(e){
    clearFields();
    setLocation(userMarker.getLatLng());
  });
  return {marker:userMarker , circle:userCircle};
}

function markerFromGeocode(result){
  console.log(this);
  $(geolocationControl).trigger("stopGeolocate");
  if(this._geocodeMarker){
    this._map.removeLayer(this._geocodeMarker);
    this._map.removeLayer(this._geocodeCircle);
  }
  this._map.fitBounds(result.bbox);
  var markerCircle =  addCustomCircleMarker([result.center.lat, result.center.lng] , drawnLayers);
  this._geocodeMarker = markerCircle.marker;
  this._geocodeCircle = markerCircle.circle;
  this._geocodeMarker.bindPopup(result.html || result.name)
  .addTo(this._map)
  .openPopup();

  setLocation(result.center,result.name|| result.html);
  return this;
}


