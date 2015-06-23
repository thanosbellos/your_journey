(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
turfBuffer = require ('./turf-buffer-artisinal/index.js');


},{"./turf-buffer-artisinal/index.js":2}],2:[function(require,module,exports){
var featurecollection = require('turf-featurecollection');
var destination = require('turf-destination');
var bearing = require('turf-bearing');
var point = require('turf-point');
var polygon = require('turf-polygon');

module.exports = function(feature, radius, units, resolution){
  if(!resolution) resolution = 36;
  var geom = feature.geometry
  if(geom.type === 'Point') {
    return pointBuffer(feature, radius, units, resolution);
  } else if(geom.type === 'MultiPoint') {
    var buffers = [];
    geom.coordinates.forEach(function(coords) {
      buffers.push(pointBuffer(point(coords[0], coords[1]), radius, units, resolution));
    });
    return featurecollection(buffers)
  } else if(geom.type === 'LineString') {
    return lineBuffer(feature, radius, units, resolution);
  } else if(geom.type === 'MultiLineString') {
    var buffers = [];
    geom.coordinates.forEach(function(line){
      buffers.push(lineBuffer(feature, radius, units, resolution));
    });
  } else if(geom.type === 'Polygon') {

  } else if(geom.type === 'MultiPolygon') {

  }
}

function pointBuffer (pt, radius, units, resolution) {
  var ring = []
  var resMultiple = 360/resolution;
  for(var i  = 0; i < resolution; i++) {
    var spoke = destination(pt, radius, i*resMultiple, units);
    ring.push(spoke.geometry.coordinates);
  }
  if((ring[0][0] !== ring[ring.length-1][0]) && (ring[0][1] != ring[ring.length-1][1])) {
    ring.push([ring[0][0], ring[0][1]]);
  }
  return polygon([ring])
}

function lineBuffer (line, radius, units, resolution) {
  var lineBuffers = featurecollection([])
  //break line into segments
  var segments = [];
  for(var i = 0; i < line.geometry.coordinates.length-1; i++) {
    segments.push([line.geometry.coordinates[i], line.geometry.coordinates[i+1]]);
  }
  /*create a set of boxes parallel to the segments

    ---------

 ((|¯¯¯¯¯¯¯¯¯|))
(((|---------|)))
 ((|_________|))

  */
  for(var i = 0; i < segments.length; i++) {
    var bottom = point(segments[i][0][0], segments[i][0][1])
    var top = point(segments[i][1][0], segments[i][1][1])

    var direction = bearing(bottom, top);

    var bottomLeft = destination(bottom, radius, direction - 90, units);
    var bottomRight = destination(bottom, radius, direction + 90, units);
    var topLeft = destination(top, radius, direction - 90, units);
    var topRight = destination(top, radius, direction + 90, units);

    var poly = polygon([[bottomLeft.geometry.coordinates, topLeft.geometry.coordinates]]);

    // add top curve
    var spokeNum = Math.floor(resolution/2);
    var topStart = bearing(top, topLeft);
    for(var k = 1; k < spokeNum; k++) {
      var spokeDirection = topStart + (180 * (k/spokeNum))
      var spoke = destination(top, radius, spokeDirection, units);
      poly.geometry.coordinates[0].push(spoke.geometry.coordinates);
    }
    // add right edge
    poly.geometry.coordinates[0].push(topRight.geometry.coordinates)
    poly.geometry.coordinates[0].push(bottomRight.geometry.coordinates)
    //add bottom curve
    var bottomStart = bearing(bottom, bottomRight);
    for(var k = 1; k < spokeNum; k++) {
      var spokeDirection = (bottomStart + (180 * (k/spokeNum)))
      var spoke = destination(bottom, radius, spokeDirection, units);
      poly.geometry.coordinates[0].push(spoke.geometry.coordinates);
    }

    poly.geometry.coordinates[0].push(bottomLeft.geometry.coordinates)
    lineBuffers.features.push(poly);
  }
  return lineBuffers;
}

},{"turf-bearing":3,"turf-destination":4,"turf-featurecollection":5,"turf-point":6,"turf-polygon":7}],3:[function(require,module,exports){
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html

module.exports = function (point1, point2) {
    var coordinates1 = point1.geometry.coordinates
    var coordinates2 = point2.geometry.coordinates

    var lon1 = toRad(coordinates1[0])
    var lon2 = toRad(coordinates2[0])
    var lat1 = toRad(coordinates1[1])
    var lat2 = toRad(coordinates2[1])
    var a = Math.sin(lon2 - lon1) * Math.cos(lat2);
    var b = Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);

    var bearing = toDeg(Math.atan2(a, b));

    return bearing
}

function toRad(degree) {
    return degree * Math.PI / 180
}

function toDeg(radian) {
    return radian * 180 / Math.PI;
}

},{}],4:[function(require,module,exports){
//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
var point = require('turf-point')

module.exports = function (point1, distance, bearing, units) {
    var coordinates1 = point1.geometry.coordinates
    var longitude1 = toRad(coordinates1[0])
    var latitude1 = toRad(coordinates1[1])
    var bearing_rad = toRad(bearing)

    var R = 0
    switch (units) {
    case 'miles':
        R = 3960
        break
    case 'kilometers':
        R = 6373
        break
    case 'degrees':
        R = 57.2957795
        break
    case 'radians':
        R = 1
        break
    }

    var latitude2 = Math.asin(Math.sin(latitude1) * Math.cos(distance / R) +
        Math.cos(latitude1) * Math.sin(distance / R) * Math.cos(bearing_rad));
    var longitude2 = longitude1 + Math.atan2(Math.sin(bearing_rad) * Math.sin(distance / R) * Math.cos(latitude1),
        Math.cos(distance / R) - Math.sin(latitude1) * Math.sin(latitude2));

    return point(toDeg(longitude2), toDeg(latitude2))
};

function toRad(degree) {
    return degree * Math.PI / 180
}

function toDeg(rad) {
    return rad * 180 / Math.PI
}

},{"turf-point":6}],5:[function(require,module,exports){
module.exports = function(features){
  var fc = {
    "type": "FeatureCollection",
    "features": features
  }

  return fc
}
},{}],6:[function(require,module,exports){
module.exports = function(x, y, properties){
  if(isNaN(x) || isNaN(y)) throw new Error('Invalid coordinates')
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [x, y]
    },
    properties: properties || {}
  }
}

},{}],7:[function(require,module,exports){
module.exports = function(coordinates, properties){
  if(coordinates === null) return new Error('No coordinates passed')
  var polygon = { 
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": coordinates
    },
    "properties": properties
  }

  if(!polygon.properties){
    polygon.properties = {}
  }
  
  return polygon
}
},{}]},{},[1]);
