$( document).ready(function() {
  clearFields();
  var path = window.location.pathname;
  var active = $("div.active").attr("id");
  mapPointDivId = 'point-map';

  if((path.search(/\/search$/)!= -1)){
    clearFields();
    pointMap = initializeMap();
    drawnFeatureGroup = L.featureGroup().addTo(pointMap);
    resultsFeatureLayer = undefined;

   if($(window).width() >1050){

     drawControl = addDrawControl(pointMap , drawnFeatureGroup);

    }

    geocodeControl = addGeocodeControl(pointMap);

    geolocationControl = L.control.accurateLocateControl({position: 'topright',featureGroup: drawnFeatureGroup,
                                                          strings: {title: "Show me where I am"}
                                                        });
    geolocationControl.addTo(pointMap);
    $("#radius").change(function(){
     radius = $("#radius").val();
     drawnFeatureGroup.eachLayer(function(layer){
       if(typeof layer._circle == 'undefined'){
          layer.setRadius(radius);
       }
     });
    });
    $("#trail-search-form").on("ajax:success", function(e, data , status ,xhr){
     if(typeof data.message =='undefined'){
       resultsFeatureLayer = L.geoJson(data,{pointToLayer: L.mapbox.marker.style});
       drawnFeatureGroup.addLayer(resultsFeatureLayer);
         $("#results").append(xhr.responseText)
    } else {
      $("#results").append(data.message)
    }

   })
   $("#trail-search-form").on("ajax:before", function(e , data, status, xhr){
     if(typeof resultsFeatureLayer !=='undefined'){
         pointMap.removeLayer(resultsFeatureLayer)
     }
     if($("#lnglat:hidden").val()== undefined){
       return false;
     }
   });


  }
});



function initializeMap(){
// set up my map and set zoom

  L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A';
  var map = L.mapbox.map('point-map', 'thanosbel.lmm46d4d');
  map.setZoom(2);
  return map;


// add my controls on map

}

function addDrawControl(_map , _featureGroup){

  var drawOnMapOptions = {
       position: 'topleft',
       draw: {
          polyline: false,
          polygon: false,
          circle: false,
          rectangle: false,
          marker: {
            icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 'star',
                              'marker-color': '00E263'
                             })

            }
       },
        edit: {
        edit:false,
        featureGroup: _featureGroup
       }
    }

  var drawControl = new L.Control.Draw(drawOnMapOptions);
  _map.on('draw:created', function(e) {
    geolocationControl.stopGeolocate();
    clearCustomLayers(_featureGroup);
    position = e.layer._latlng;
    circleMarker = addCustomCircleMarker(position , _featureGroup);
    setLocation(position,_map);
  });
  _map.on('draw:drawstart',function(e){
    geolocationControl.stopGeolocate();
  })
  _map.on('draw:deleted' , function(e) {
    geolocationControl.stopGeolocate();
    console.log("lala");

  });

  _map.addControl(drawControl);
  return drawControl;
}

function addGeocodeControl(_map, _featureGroup){
  var myGeocoder = L.Control.geocoder().addTo(_map);
  myGeocoder.markGeocode = markerFromGeocode;
  return  myGeocoder;
}



function markerFromGeocode(result){

  geolocationControl.stopGeolocate();
  if(this._geocodeMarker){
    this._map.removeLayer(this._geocodeMarker);
    this._map.removeLayer(this._geocodeCircle);
  }
  this._map.fitBounds(result.bbox);
  var markerCircle =  addCustomCircleMarker([result.center.lat, result.center.lng] , drawnFeatureGroup);
  this._geocodeMarker = markerCircle.marker;
  this._geocodeCircle = markerCircle.circle;
  this._geocodeMarker.bindPopup(result.html || result.name)
  .addTo(this._map)
  .openPopup();

  setLocation(result.center,result.name|| result.html);
  return this;
}


function addCustomCircleMarker(position , _featureGroup){
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
  _featureGroup.addLayer(userMarker);

  userMarker.bounce(3);
  userCircle = L.circle();
  userMarker._circle = userCircle;
  userMarker.on('drag' , function(e){
    userCircle.setLatLng(userMarker.getLatLng());
  });
  userCircle.setLatLng(position);

  userCircle._marker = userMarker;
  userCircle.setRadius($("#radius").val());
   _featureGroup.addLayer(userCircle)
  window.setTimeout(function(){
    _featureGroup._map.setView(position , 13);
  },3000);
  userMarker.on('drag' , function(e){
    userCircle.setLatLng(userMarker.getLatLng());
  });

  userMarker.on('dragend', function(e){
    clearFields();
    setLocation(userMarker.getLatLng());
  });

  userMarker.on('remove' , function(e){
     clearFields();
     this._status = 'removed';
     if(this._circle._status !== 'removed'){
       this._circle.fire('click');
       this._circle._status = undefined;
     }

  });

  userCircle.on('remove' , function(e){
    clearFields();
    this._status = 'removed';
    if(this._marker._status !=='removed'){
      this._marker.fire('click');
      this._marker._status = undefined;
    }


  });



  return {marker:userMarker , circle:userCircle};
}


function setLocation(latlng ,map , name){
  clearFields();
  $("#lnglat:hidden").val([latlng.lng, latlng.lat]);
  if(!name){
    geocodeControl.options.geocoder.reverse(latlng , 12 , function(results){
        var r = results[0];
        name = r.name
        $("#location").val(name);
    });
  }
  $("#location").val(name);
}

function clearFields(){
 $("#location:hidden").val('');
 $("#location").val('');
 $("#results").empty();
}
function clearCustomLayers(_featureGroup){
  _featureGroup.clearLayers();
}




