import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import haversine from "haversine";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_PUBLIC_KEY;

const Status = ({ status }) => <p>{status}</p>;

const DenverDirectionFinder = () => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [status, setStatus] = useState("Finding your location...");

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-98.5795, 39.8283],
      zoom: 11,
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat1 = position.coords.latitude;
        const lng1 = position.coords.longitude;
        const lat2 = 39.7392;
        const lng2 = -104.9903;

        const bearing = haversine(
          { latitude: lat1, longitude: lng1 },
          { latitude: lat2, longitude: lng2 },
          { unit: "km" }
        );

        console.log("BEARING", bearing + "km");

        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setBearing(bearing);
        setStatus("Arrow pointing towards Denver, CO");

        map.setCenter({
          lng: lng1,
          lat: lat1,
        });

        // denver marker
        new mapboxgl.Marker().setLngLat([lng2, lat2]).addTo(map);

        // current marker
        new mapboxgl.Marker().setLngLat([lng1, lat1]).addTo(map);

        // Add arrow symbol layer to the map
        map.loadImage("/right-arrow.png", (error, image) => {
          if (error) throw error;

          map.addImage("arrow", image);
          map.addLayer({
            id: "arrow",
            type: "symbol",
            source: {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: [
                  {
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [lng1, lat1],
                    },
                    properties: {
                      bearing,
                    },
                  },
                ],
              },
            },
            layout: {
              "icon-image": "arrow",
              "icon-rotate": ["+", ["get", "bearing"], -45], // manually adjust the rotation to point towards Denver
              "icon-rotation-alignment": "map",
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
              "icon-size": 0.15,
            },
          });
        });
      },
      (error) => {
        setStatus(`Error: ${error.message}`);
      }
    );

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map" style={{ width: "100%", height: "800px" }}></div>;
};

export default DenverDirectionFinder;
