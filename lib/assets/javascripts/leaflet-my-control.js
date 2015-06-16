(function (factory, window) {

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        window.L.MyAccurateLocateControl = factory(L);
    }
}(function (L) {
  L.Control.MyAccurateLocateControl = L.Control.extend({
       options: {
       position: 'topleft',
     },
     onAdd: function(map){
       var container = L.DomUtil.create('div','leaflet-control-locate leaflet-bar leaflet-control');
        this._link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
        this._link.href = '#';
        this._icon = L.DomUtil.create('span', 'fa fa-user', this._link);
        this._status = undefined;
        this._reanimate = false;
        this._userMarker = this.options.userMarker;
        this._featureGroup = this.options.featureGroup;
        L.DomEvent
             .on(this._link, 'stopGeolocate' , function(){
               this.stopGeolocate();
             },this)
             .on(this._link, 'click', L.DomEvent.stopPropagation)
             .on(this._link, 'click', L.DomEvent.preventDefault)
             .on(this._link, 'click', function() {
               console.log(this._status);
               if(this._status == "activated"){
                 this.stopGeolocate();
               }else {
                 this._status = "activated"
                 this.startGeolocate();
               }
             }, this)

       this.bindAccuratePositionMethods();
       return container;
     },
     initialize: function (options) {
            for (var i in options) {
                if (typeof this.options[i] === 'object') {
                    L.extend(this.options[i], options[i]);
                } else {
                    this.options[i] = options[i];
                }
            }
        },

     bindAccuratePositionMethods: function(){

        this._map.on('accuratepositionprogress', this.onAccuratePositionProgress,this);
        this._map.on('accuratepositionfound', this.onAccuratePositionFound,this);
        this._map.on('accuratepositionerror', this.onAccuratePositionError,this);

     },

    startGeolocate: function(){
      clearFields();

      this._featureGroup.clearLayers();
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
      //
      clearFields();
      this._featureGroup.clearLayers();
       if(typeof this._userMarker !== 'undefined'){
        this._userMarker.clearLayers();
      }


      this.cleanCssClasses();
      if (typeof this._searchAnimation !== 'undefined'){
        clearInterval(this._searchAnimation);
      }
      this._map._cleanUpAccuratePositioning();
      this._status = "reset";

    },

    animateSearching: function(){
      t = 0
      this._map.setZoom(2);
      marker = L.marker([-73, 40], {
                             icon: L.mapbox.marker.icon({
                              'marker-size': 'medium',
                              'marker-symbol': 'star',
                              'marker-color': '00E263'
       })});
       this._featureGroup.addLayer(marker);
       this._searchAnimation = window.setInterval(function(){
        marker.setLatLng(L.latLng(
           Math.cos(t * 0.5) * 50,
           Math.sin(t) * 50));
          t += 0.1;
        },35);


    },
     onAccuratePositionProgress: function(e){
       if(this._status=="activated"){
       }

     },

    onAccuratePositionFound: function(e){
      this._featureGroup.clearLayers();
      this.setCssClasses('active');
      if(this._reanimate == false){
        clearInterval(this._searchAnimation);
      }
      this._reanimate = true;
      var userPosition = [e.latlng.lat , e.latlng.lng];
      addCustomCircleMarker(userPosition ,this._userMarker);

      var marker = undefined;

      var _featureGroup = this._featureGroup;
      this._userMarker.eachLayer(function(layer){
        _featureGroup.addLayer(layer);
        if((typeof layer._mRadius) == 'undefined'){
         marker = layer;

        }

      });

      _setOrigin(e.latlng,this._map);

     marker.on('dragend' , function(e){
       if(this._status =='activated'){
         this._status = 'reset'
         this._map._cleanUpAccuratePositioning();
         this.cleanCssClasses();
       }
      },this);
    },

    onAccuratePositionError: function(e){
      alert("Geolocation is not available for you right now");
      this.stopGeolocate();
    },

    setCssClasses: function(state){
      if(state == 'searching'){
          cssClassNamesToRemove = "fa fa-user'".split(' ');
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
          cssClassNamesToAdd =  "fa fa-user".split(' ');


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
           cssClassNamesToAdd = "fa fa-user".split(' ');
           L.DomUtil.removeClass(this._container, "requesting");
           L.DomUtil.removeClass(this._container, "active");
           for(var i=0, tot= cssClassNamesToRemove.length; i<tot; i++){
            L.DomUtil.removeClass(this._icon, cssClassNamesToRemove[i]);
           }
           for(var i=0, tot= cssClassNamesToAdd.length; i<tot; i++){
            L.DomUtil.addClass(this._icon, cssClassNamesToAdd[i]);
           }
      }
  });

  L.control.accurateLocateControl = function(options) {
    return new L.Control.MyAccurateLocateControl(options);
  }


  return L.Control.MyAccurateLocateControl;
}, window));






