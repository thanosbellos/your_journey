$( document).ready(function() {
  var path = window.location.pathname;
  if(path.search(/\/search$/) -1){
    clearFields();
    L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
    map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
    map.setZoom(2);
    myGeocoder = L.Control.geocoder().addTo(map);
    myGeocoder.markGeocode = markerFromGeocode;
    customControl = new MyControl();
    geolocationControl = map.addControl(customControl);

  }
  drawnLayers ={size:0};
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

  map.on('click' , function(e){
    if(drawnLayers.size==0){

      addCustomCircleMarker([e.latlng.lat , e.latlng.lng]);

    }
  })


});

function clearDrawnLayers(){
  for( var key in drawnLayers){
    if (key != "size"){
      removeDrawnLayer(key);
    }
  }
  //if(typeof featureLayer !=='undefined'){
    //map.removeLayer(featureLayer)
  //}
}
function removeDrawnLayer(layerType){
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

function addCustomCircleMarker(position){
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
  $(customControl).trigger("stopGeolocate");
  if(this._geocodeMarker){
    this._map.removeLayer(this._geocodeMarker);
    this._map.removeLayer(this._geocodeCircle);
  }
  this._map.fitBounds(result.bbox);
  var markerCircle =  addCustomCircleMarker([result.center.lat, result.center.lng]);
  this._geocodeMarker = markerCircle.marker;
  this._geocodeCircle = markerCircle.circle;
  this._geocodeMarker.bindPopup(result.html || result.name)
  .addTo(this._map)
  .openPopup();

  setLocation(result.center,result.name|| result.html);
  return this;
}



 var MyControl = L.Control.extend({
       options: {
       position: 'topleft'
     },
     onAdd: function(map){
       var container = L.DomUtil.create('div','leaflet-control-locate leaflet-bar leaflet-control');
        this._link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
        this._link.href = '#';
        this._icon = L.DomUtil.create('span', 'fa fa-map-marker', this._link);
        this._status = undefined;
        this._reanimate = false;
        L.DomEvent
             .on(this._link, 'stopGeolocate' , function(){
               this.stopGeolocate();
             },this)
             .on(this._link, 'click', L.DomEvent.stopPropagation)
             .on(this._link, 'click', L.DomEvent.preventDefault)
             .on(this._link, 'click', function() {
               console.log(this._status);
               if(this._status == "pressed"){
                 this.stopGeolocate();
               }else {
                 this._status = "pressed"
                 this.startGeolocate();
               }
             }, this)

       this.bindAccuratePositionMethods();
       return container;
     },

     bindAccuratePositionMethods: function(){

        this._map.on('accuratepositionprogress', this.onAccuratePositionProgress,this);
        this._map.on('accuratepositionfound', this.onAccuratePositionFound,this);
        this._map.on('accuratepositionerror', this.onAccuratePositionError,this);

     },

    startGeolocate: function(){
      clearFields();
      clearDrawnLayers();
      //clear everything there is as user marker and user circle
      if(this._reanimate == true){
        maxWait = 500;
      }else{

        maxWait= 4000;
        this.animateSearching();
      }
      this.setCssClasses('searching');
      this._map.findAccuratePosition({
        maxWait: maxWait, // defaults to 10000
        desiredAccuracy: 30// defaults to 20
      });


    },
    stopGeolocate: function(){
      //clear every marker and circle
      clearFields();
      clearDrawnLayers();
      this.cleanCssClasses();
      if (typeof animateSearching !== 'undefined'){
        clearInterval(animateSearching);
      }
      this._map._cleanUpAccuratePositioning();
      this._status = "reset";
      this._map.setZoom(2);

    },

    animateSearching: function(){
      t = 0
      this._map.setZoom(2);
      marker = L.marker([-73, 40], {
             icon: L.mapbox.marker.icon({
              'marker-color': '#f86767'
              })
       });
       marker.addTo(map);
       drawnLayers.searchAnimationaMarker = marker;
       drawnLayers.size++;
       animateSearching = window.setInterval(function(){
        marker.setLatLng(L.latLng(
           Math.cos(t * 0.5) * 50,
           Math.sin(t) * 50));
          t += 0.1;
        },35);


    },
     onAccuratePositionProgress: function(e){
       if(this._status=="pressed"){
       }

     },

    onAccuratePositionFound: function(e){
      clearDrawnLayers();
      this.setCssClasses('active');
      if(this._reanimate == false){
        clearInterval(animateSearching);
      }
      this._reanimate = true;
      var userPosition = [e.latlng.lat , e.latlng.lng];
      var markerCircle = addCustomCircleMarker(userPosition);
      setLocation(e.latlng);

      markerCircle.marker.on('dragend' , function(e){
        this._status = "reset"
        this._map._cleanUpAccuratePositioning();
        this.cleanCssClasses();

      },this);
    },

    onAccuratePositionError: function(e){
      alert("Geolocation is not available for you right now");
      this.stopGeolocate();
    },

    setCssClasses: function(state){
      if(state == 'searching'){
          cssClassNamesToRemove = "fa fa-map-marker".split(' ');
          cssClassNamesToAdd =  "fa fa-spinner fa-spin".split(' ');

          L.DomUtil.removeClass(this._container, "active");
          L.DomUtil.addClass(this._container, "searching");

          for(var i=0, tot= cssClassNamesToRemove.length; i<tot; i++){
            L.DomUtil.removeClass(this._icon, cssClassNamesToRemove[i]);
          }

           for(var i=0, tot= cssClassNamesToAdd.length; i<tot; i++){
            L.DomUtil.addClass(this._icon, cssClassNamesToAdd[i]);
          }
        }
      else if(state == "active"){
          cssClassNamesToRemove = "fa fa-spinner fa-spin".split(' ');
          cssClassNamesToAdd =  "fa fa-map-marker".split(' ');


          L.DomUtil.removeClass(this._container, "searching");
          L.DomUtil.addClass(this._container, "active");
          L.DomUtil.addClass(this._container, "following");


          for(var i=0, tot= cssClassNamesToRemove.length; i<tot; i++){
            L.DomUtil.removeClass(this._icon, cssClassNamesToRemove[i]);
          }

           for(var i=0, tot= cssClassNamesToAdd.length; i<tot; i++){
            L.DomUtil.addClass(this._icon, cssClassNamesToAdd[i]);
          }
        }
      },
       cleanCssClasses: function(){
           cssClassNamesToRemove = "fa fa-spinner fa-spin".split(' ');
           cssClassNamesToAdd = "fa fa-map-marker".split(' ');
           L.DomUtil.removeClass(this._container, "requesting");
           L.DomUtil.removeClass(this._container, "active");
           for(var i=0, tot= cssClassNamesToRemove.length; i<tot; i++){
            L.DomUtil.removeClass(this._icon, cssClassNamesToRemove[i]);
           }
           for(var i=0, tot= cssClassNamesToAdd.length; i<tot; i++){
            L.DomUtil.addClass(this._icon, cssClassNamesToAdd[i]);
           }
      },


 })

