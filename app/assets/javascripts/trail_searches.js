$( document).ready(function() {
 var path = window.location.pathname;
 if (path.search(/\/search$/)!=-1){
   $("#location").val('')
   radius = $("#radius").val();

   L.mapbox.accessToken = 'pk.eyJ1IjoidGhhbm9zYmVsIiwiYSI6InZqbFEtSk0ifQ.nLEw7BjpabHkHfC1g0Gr_A';
   map = L.mapbox.map('map', 'thanosbel.lmm46d4d');
   map.addControl(new MyControl());
   myGeocoder =  L.Control.Geocoder.nominatim(),
   geocodeControl = L.Control.geocoder({
                geocoder:myGeocoder
   }).addTo(map);
   drawnLayers = {size:0};

   $("#radius").change(function(){
     radius = parseInt($("#radius").val());
        if(typeof drawnLayers.userCircle !=='undefined'){
          drawnLayers.userCircle.setRadius(radius);
        }
   });

   $("#trail-search-form").on("ajax:success", function(e, data , status ,xhr){
     if(typeof data.message =='undefined'){
        featureLayer = L.mapbox.featureLayer(data).addTo(map);



         $(this).append(xhr.responseText)
    } else {
      alert(data.message);
    }


   })
   $("#trail-search-form").on("ajax:before", function(e , data, status, xhr){
     if($("#location").val()==''){
       return false;
     }
     if(typeof featureLayer !=='undefined'){
     map.removeLayer(featureLayer)
     }
   });


   }
});


function cleanDrawnLayers(){
  for( var key in drawnLayers){
    if (key != "size"){
      removeDrawnLayer(key);
    }
  }
  if(typeof featureLayer !=='undefined'){
    map.removeLayer(featureLayer)
  }
}
function removeDrawnLayer(layerType){
  map.removeLayer(drawnLayers[layerType]);
  delete drawnLayers[layerType];
  drawnLayers.size--;
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
             .on(this._link, 'click', L.DomEvent.stopPropagation)
             .on(this._link, 'click', L.DomEvent.preventDefault)
             .on(this._link, 'click', function() {
               console.log(this._status);
               if(this._status == "pressed"){
                 //this in here refers to the control
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

        map.on('accuratepositionprogress', this.onAccuratePositionProgress,this);
        map.on('accuratepositionfound', this.onAccuratePositionFound,this);
        map.on('accuratepositionerror', this.onAccuratePositionError,this);

     },

    startGeolocate: function(){
      if(this._reanimate == true){
        cleanDrawnLayers();
        maxWait = 500;
      }else{
        maxWait= 5000;
        this.animateSearching();
      }
      this.setCssClasses('searching');
      map.findAccuratePosition({
        maxWait: maxWait, // defaults to 10000
        desiredAccuracy: 30// defaults to 20
      });


    },
    stopGeolocate: function(){
      this.cleanCssClasses();
      $("#lnglat:hidden").val("");

      if (typeof animateSearching !== 'undefined'){
        clearInterval(animateSearching);
      }
      this._map._cleanUpAccuratePositioning();
      this._status = "reset";
      $("#location").val("");
      map.setZoom(3);
      cleanDrawnLayers();

    },

    animateSearching: function(){
      t = 0
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
      console.log("from on proggress");

       }

     },

    onAccuratePositionFound: function(e){
      this.setCssClasses('active');
      if(this._reanimate == false){
        clearInterval(animateSearching);
        removeDrawnLayer("searchAnimationaMarker");
      }
      this._reanimate = true;
      console.log(this._reanimate);
      var userPosition = [e.latlng.lat , e.latlng.lng];
      $("#lnglat:hidden").val([userPosition[1],userPosition[0]]);
      this.addUserMarker(userPosition);
    },
    onAccuratePositionError: function(e){
      alert("Geolocation is not available for you right now");
      this.stopGeolocate();
    },

    addUserMarker : function(userPosition){
     userMarker = L.marker( userPosition , {
                                draggable: true,
                                title: 'The most accurate geolocated position' ,
                                icon: L.mapbox.marker.icon({
                                'marker-size': 'medium',
                                'marker-symbol': 'star',
                                'marker-color': '00E263'
                               })
                             }).setBouncingOptions({
                                 bounceHeight : 35
                                });

     userMarker.addTo(map).bounce();
     drawnLayers.userMarker = userMarker;
     drawnLayers.size++;

     userCircle = L.circle();
     drawnLayers.userCircle = userCircle;
     drawnLayers.size++;

     userCircle.setLatLng(userPosition);
     userCircle.setRadius(radius);
     userCircle.addTo(map);
     window.setTimeout(function(){
     map.setView(userPosition ,12);

      myGeocoder.reverse(userMarker.getLatLng(), map.options.crs.scale(map.getZoom()), function(results) {
        var r = results[0];
        $("#location").val(r.name);
      });
      userMarker.stopBouncing();
     },2000);
     //add drag events on marker
     userMarker.on('drag' , function(e){
      userCircle.setLatLng(userMarker.getLatLng());
     });

     userMarker.on('dragend', function(e){
       myGeocoder.reverse(userMarker.getLatLng(), map.options.crs.scale(map.getZoom()) ,  function(results){
          var r = results[0];
         $("#location").val(r.name);
      });

       this._status = "reset";
       this._map._cleanUpAccuratePositioning();
       this.cleanCssClasses();
     },this)
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
