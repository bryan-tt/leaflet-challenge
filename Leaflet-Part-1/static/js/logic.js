let geourl =
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(geourl).then(function (data) {
    createFeatures(data.features);
});

let earthquakes;

// Define a function that we want to run once for each feature in the features array.
function createFeatures(earthquakeData) {
    // Function to choose RGB color based on depth (coordinate 3)
    function chooseColor(depth) {
        if (depth > 90) {
            return "rgb(255, 0, 0)"; // Red
        } else if (depth >= 70) {
            return "rgb(255, 69, 0)"; // Dark Orange
        } else if (depth >= 50) {
            return "rgb(255, 165, 0)"; // Orange
        } else if (depth >= 30) {
            return "rgb(255, 244, 0)"; // Yellow
        } else if (depth >= 10) {
            return "rgb(173,255,47)"; // Lime Green
        } else {
            return "rgb(0, 255, 0)"; // Green
        }
    }

    // Change point to circle
    function pointToLayer(feature, latlng) {
        // console.log(feature.geometry.coordinates[2])
        return L.circleMarker(latlng, {
            radius: feature.properties.mag * 4,
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            color: "black",
            weight: 0.5,
            opacity: 1,
            fillOpacity: 0.7,
        });
    }

    // Give each feature a popup that describes the place, magnitude, and depth of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(
            `<h3>${
                feature.properties.place
            }</h3><hr><p>Magnitude: ${feature.properties.mag.toFixed(
                2
            )}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`
        );
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature,
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Adding the tile layer "Stadia.AlidadeSmooth"
    let stadia = L.tileLayer(
        "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
        {
            maxZoom: 20,
            attribution:
                '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        }
    );

    let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    });

    // Create a baseMaps object
    let baseMaps = {
        "Grayscale": stadia,
        "Topographic Map": topo,
    };

    // Create an overlay object to hold our overlay
    let overlayMaps = {
        Earthquakes: earthquakes,
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [40.014206, -109.321311],
        zoom: 5,
        layers: [stadia, earthquakes],
    });

    // Create a layer control.
    // Pass in baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control
        .layers(baseMaps, overlayMaps, {
            collapsed: false,
        })
        .addTo(myMap);

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        let limits = [
            "-10 to 10",
            "10 to 30",
            "30 to 50",
            "50 to 70",
            "70 to 90",
            "90+",
        ];
        let colors = [
            "rgb(0, 255, 0)",
            "rgb(173,255,47)",
            "rgb(255, 244, 0)",
            "rgb(255, 165, 0)",
            "rgb(255, 69, 0)",
            "rgb(255, 0, 0)",
        ];
        let labels = ["<strong>Depth of<br>Earthquake</strong>"];

        limits.forEach(function (limit, index) {
            labels.push(
                '<li style="background-color: ' +
                    colors[index] +
                    '">' +
                    limits[index] +
                    "</li>"
            );
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}
