function initializeMap(){
// set up my map and set zoom

  L.mapbox.accessToken = "pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6IjRmMGU0NWNjZmM0ZTNiYzY2ZjE5ZDc2MDQ3ZTg4ZWQwIn0.oLX-8wI3088OqyhYC-c4_A";
  var map = L.mapbox.map('point-map', 'thanosbel.lmm46d4d',{tileLayer:{reuseTiles: true, unloadInvisibleTiles:true,updateWhenIdle:true}});
  map.setZoom(3);
  return map;
}

function addDrawControl(_map , _drawnFeatureGroup , _userMarkerFeatureGroup){

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
        featureGroup: _drawnFeatureGroup
       }
    }

  var drawControl = new L.Control.Draw(drawOnMapOptions);
  _map.on('draw:created', function(e) {

    var position = e.layer._latlng;
    addCustomCircleMarker(position, _userMarkerFeatureGroup);
    _userMarkerFeatureGroup.eachLayer( function(layer){
      _drawnFeatureGroup.addLayer(layer);
    });
    _setOrigin(position);

    });

  _map.on('draw:drawstart',function(e){
    _drawnFeatureGroup.clearLayers();

    });
  _map.on('draw:drawstop',function(e){
    if(_drawnFeatureGroup.getLayers().length ==0){
      _userMarkerFeatureGroup.eachLayer(function(layer){
        _drawnFeatureGroup.addLayer(layer);
      })
    }
  });
  _map.on('draw:deleted' , function(e) {
    if(e.layers.getLayers().length !=0){
    _userMarkerFeatureGroup.eachLayer(function(layer){
      if(e.layers.hasLayer(layer)){
        clearFields();
        _userMarkerFeatureGroup.removeLayer(layer)
      }
    })
    }
  });

  _map.on('draw:deletestart' , function(e){
    _userMarkerFeatureGroup.eachLayer(function(layer){
      layer._status = undefined;
    })

  })
  _map.addControl(drawControl);
  return drawControl;
}

function addGeocodeControl(_map){
  var myGeocoder = L.Control.geocoder().addTo(_map);
  myGeocoder.markGeocode = markerFromGeocode;
  return  myGeocoder;
}





function addCustomCircleMarker(position,_userMarkerFeatureGroup){
  var userMarker = L.marker( position, {
                             draggable:true,
                             title: 'Start Search Point- You can move me around if you want',
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 'star',
                              'marker-color': '00E263'
                             }),
                             zIndexOffset: 100
                    }).setBouncingOptions({
                        bounceHeight: 25
                      });
  _userMarkerFeatureGroup.clearLayers();
  _userMarkerFeatureGroup.addLayer(userMarker);

  userMarker.bounce(3);
  var userCircle = L.circle();
  userCircle.setLatLng(position);


  userCircle.setRadius($("#radius").val());
  _userMarkerFeatureGroup.addLayer(userCircle);

  window.setTimeout(function(){
    userCircle._map.setView(position , 13);
  },1500);


  userMarker._circle = userCircle;
  userCircle._marker = userMarker;


  userMarker.on('drag' , function(e){
    userCircle.setLatLng(userMarker.getLatLng());
  });

  userMarker.on('dragend', function(e){
    clearFields();
    _setOrigin(userMarker.getLatLng());
  });

  userMarker.on('remove' , function(e){
     if(this._circle._status !== 'removed'){
        this._status = 'removed';

       this._circle.fireEvent('click');
       this._circle._status = undefined;
     }

  });

  userCircle.on('remove' , function(e){
    if(this._marker._status !=='removed'){

      this._status = 'removed';

      this._marker.fireEvent('click');
      this._marker._status = undefined;
    }


  });

  return;
};


function _setOrigin(latlng ,map , name){
  var originLonLat = $("#origin_lnglat:hidden");
  var originName = $("#origin");

  originLonLat.val([latlng.lng, latlng.lat]);
  originLonLat.data("prev-origin-lnglat" , originLonLat.val());

  if(!name){
    geocodeControl.options.geocoder.reverse(latlng , 12 , function(results){
        var r = results[0];
        name = r.name
        originName.val(name);
        originName.data("prev-origin-name" , originName.val());
    });
  }
  if(name){
    $("#origin").val(name);
    $("#origin").change();
  }
}


function clearFields(){
 //reset radius default value();
 $("#origin").val('');

 $("#origin_lnglat:hidden").val('');
 $("#destination_lnglat:hidden").val('');
 $("#destination").val('');
 $("#sample_route:hidden").val('');
}
function clearCustomLayers(_featureGroup){
  _featureGroup.clearLayers();
}




