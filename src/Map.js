import React, { useState, useEffect } from "react";
import ReactMapGL, {
  GeolocateControl,
  Marker,
  NavigationControl,
} from "react-map-gl";
import haversine from "haversine";

const Map = () => {
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 5,
  });
  const [bearing, setBearing] = useState(0);
  const [lat1, setLat1] = useState(null);
  const [lng1, setLng1] = useState(null);
  const [lat2, setLat2] = useState(null);
  const [lng2, setLng2] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setViewport({ latitude, longitude, zoom: 10 });
        setLat1(latitude);
        setLng1(longitude);
        const denver = { latitude: 39.7392, longitude: -104.9903 };
        setLat2(denver.latitude);
        setLng2(denver.longitude);

        // haversine equation to get bearing from point 1 to point 2 in km
        const bearing = haversine(
          { latitude: latitude, longitude: longitude },
          { latitude: denver.latitude, longitude: denver.longitude },
          { unit: "km" }
        );
        setBearing(bearing);
      },
      () => alert("Could not get your location"),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  const handleMoveMap = (e) => {
    setViewport({
      ...viewport,
      latitude: e.viewState.latitude,
      longitude: e.viewState.longitude,
      zoom: e.viewState.zoom,
    });
  };

  return (
    <ReactMapGL
      {...viewport}
      style={{ width: "100vw", height: "100vh", padding: "50px" }}
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_PUBLIC_KEY}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      //   setViewport={setViewport}
      onMove={handleMoveMap}
      scrollZoom={true}
      dragPan={true}
      dragRotate={false}
    >
      {/*  DENVER MARKER */}
      <Marker latitude={lat2} longitude={lng2}>
        <img src="/logo192.png" alt="arrow" width={20} height={20} />
      </Marker>
      {/* CURRENT COORDS MARKER */}
      <Marker latitude={lat1} longitude={lng1}>
        <img
          src="/right-arrow.png"
          alt="arrow"
          width={50}
          height={50}
          style={{ transform: `rotate(${bearing - 40}deg)` }}
        />
      </Marker>
      <div style={{ position: "absolute", right: 10, top: 10 }}>
        <NavigationControl />
        <GeolocateControl />
      </div>
    </ReactMapGL>
  );
};

export default Map;
