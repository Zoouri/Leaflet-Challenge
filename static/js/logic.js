const queryUrl  = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";


// Request for the URL query
d3.json(queryUrl).then(function(data){
    createMap(data.features);
});

// Creating a map with earthquake data
function createMap(earthquakeData) {
    // Assigning a popup for each feature describing the place and time of the earthquake and its location
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3> Where: " + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p></br><h2> Magnitude: "+feature.properties.mag+"</h2>");
    }

    // Creating marker
    function createCircleMarker(feature, latlng){
        let options = {
            radius: feature.properties.mag*4,
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            color: chooseColor(feature.properties.mag),
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
            return L.circleMarker(latlng, options);
        
        }

    // Assign colours based on the depth of the earthquake
    function chooseColor(depth){
        if (depth >=  90){
            return "crimson";
        } else if (depth < 90 && depth >= 70) {
            return "orangered";
        } else if (depth < 70 && depth > 50) {
            return "darkorange";
        } else if(depth < 50 && depth > 30) {
            return "orange";
        } else if(depth < 30 && depth > 10) {
            return "yellow";
        } else {
            return "bisque"
    }
}
    // Creating GeoJSON layer with the array on the earthquakeData object and running it onEachFeature
        let earthquakes = L.geoJSON(earthquakeData, {
            onEachFeature: onEachFeature,
            pointToLayer: createCircleMarker
        });

// Creating the tile layer that will be the background of my map.
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',

});

// Defining base maps
let baseMaps = {
    "Street": streetmap,
    "Topographic": topo,
};

// Creating Overlay
let overlayMaps = {
    Earthquakes: earthquakes
};

// Creating Map and giving it the streetmap and earthquake layers to display
let finalMap = L.map("map",{
    center: [-3.5294, 35.458],
    zoom: 4,
    layers: [streetmap, earthquakes]
});

L.control.layers(baseMaps, overlayMaps,{
    collapsed: false
}).addTo(finalMap);


let legend = L.control({position: "bottomright"});
legend.onAdd = function(map) {
    let div = L.DomUtil.create("div", "info legend");
    const magnitudes = [-10, 10, 30, 50, 70, 90];
    const labels = [];
    const legendInfo = "<strong>  </strong>";
    div.innerHTML = legendInfo;
    // Looping through magnitudes array to create a legend for each range
    for (let i = 0; i < magnitudes.length; i++) {
        const from = magnitudes[i];
        const to = magnitudes[i+1];
        labels.push(
            '<li style = "background-color:' +
            chooseColor(from +0.1) + '"><span>' +
            from + (to ? '&ndash;' + to: '+') +
            '</span></li>'
        );
    }
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};
legend.addTo(finalMap);
};