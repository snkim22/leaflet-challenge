// Define the query URL
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// use D3 to get the data
d3.json(queryURL).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer containing the features array and run through array
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createMarkers
    });

    // Send the earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define the map layers
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>'
    });

    // Create a baseMaps object to hold the streetmap and topo layers
    let baseMaps = {
        "Street Map": streetmap,
        "Topographic Map": topo
    };

    // Create an overlayMaps object to hold the earthquakes layer
    let overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create the map object with options
    let map = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [streetmap, earthquakes]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");
      let limits = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
      let labelsColor = [];
      let labelsText = [];
    
      // Add min & max
      let legendInfo =
        "<h1>Earthquake Depth</h1>" +
        '<div class="labels">' +
        '<div class="min">' +
        limits[0] +
        "</div>" +
        '<div class="max">' +
        limits[limits.length - 1] +
        "</div>" +
        "</div>";
    
      div.innerHTML = legendInfo;
    
      limits.forEach(function (limit, index) {
        labelsColor.push(markerColor(getDepthValue(limit)));
        labelsText.push(
          '<li style="background-color: ' +
            labelsColor[index] +
            '"></li><span>' +
            limit +
            "</span>"
        );
      });
    
      div.innerHTML += "<ul>" + labelsText.join("") + "</ul>";
      return div;
    };
    
    // Function to get the depth value from the limit string
    function getDepthValue(limit) {
      const regex = /(\d+)/g;
      const matches = limit.match(regex);
      if (matches.length === 2) {
        return (parseInt(matches[0]) + parseInt(matches[1])) / 2;
      } else if (matches.length === 1) {
        return parseInt(matches[0]);
      } else {
        return 0;
      }
    }

    legend.addTo(map);
}

// Function to create markers based on magnitude and depth
function createMarkers(feature, latlng) {
    let options = {
        radius: markerSize(feature.properties.mag), // Adjust the scale factor as needed
        fillColor: markerColor(feature.geometry.coordinates[2]), // Pass the depth value to markerColor function
        fillOpacity: markerOpacity(feature.geometry.coordinates[2]), // Pass the depth value to markerOpacity function
        color: "none"
    };
    return L.circleMarker(latlng, options);
}

// Function to determine marker size based on magnitude
function markerSize(magnitude) {
    return magnitude * 5; // Adjust the scale factor as needed
}

function markerColor(depth) {
    let minDepth = -10;
    let maxDepth = 90;
    let minColor = [15, 157, 88]; // Green color in RGB format
    let maxColor = [219, 68, 55]; // Red color in RGB format
  
    // Interpolate the colors based on the depth value
    let color = [];
    for (let i = 0; i < 3; i++) {
      color[i] = Math.round((maxColor[i] - minColor[i]) * (depth - minDepth) / (maxDepth - minDepth) + minColor[i]);
    }
  
    // Convert the RGB color array to a CSS color string
    return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
  }

// Function to determine marker opacity based on depth
function markerOpacity(depth) {
    if (depth < 10) {
        return 1;
    } else if (depth < 90) {
        return 0.8;
    } else {
        return 0.6;
    }
}
