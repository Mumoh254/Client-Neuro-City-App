import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';

const API_KEY = 'DlEzVnQ82dvbAocIfiwPCTBNZDAWKCKk';

const TomTomTrafficMap = () => {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [congestedRoads, setCongestedRoads] = useState([]);
  const [freeRoads, setFreeRoads] = useState([]);
  
  const toggleModal = () => setModalOpen(!modalOpen);

  useEffect(() => {
    mapRef.current = tt.map({
      key: API_KEY,
      container: mapElement.current,
      center: [36.8219, -1.2921], // Nairobi center
      zoom: 16,
    });

    mapRef.current.on('load', () => {
      mapRef.current.addLayer({
        id: 'traffic-flow',
        type: 'raster',
        source: {
          type: 'raster',
          tiles: [
            `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${API_KEY}`,
          ],
          tileSize: 756,
        },
      });

      // Fetch traffic flow segments in Nairobi
      fetch(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=-1.2921,36.8219&unit=KMPH&key=${API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.flowSegmentData) {

            const roadsData = data.flowSegmentData;


            const congested = roadsData.filter((road) => road.currentSpeed < road.freeFlowSpeed); 
            const free = roadsData.filter((road) => road.currentSpeed >= road.freeFlowSpeed);

            // Mock data for demonstration, replace with dynamic values
            setCongestedRoads(congested.length ? congested.map((road) => road.name || 'Unknown Road') : ['Thika Road', 'Mombasa Road']);
            setFreeRoads(free.length ? free.map((road) => road.name || 'Unknown Road') : ['Ngong Road', 'Kilimani Road']);
          } else {
            // Fallback in case the API response structure is different
            console.error("Flow data is missing or malformed.");
            setCongestedRoads(['Thika Road', 'Mombasa Road']); // Mocked congested roads
            setFreeRoads(['Ngong Road', 'Kilimani Road']); // Mocked free roads
          }
        })
        .catch((error) => {
          console.error("Error fetching data from TomTom API:", error);
    
          setCongestedRoads(['Thika Road', 'Mombasa Road']);
          setFreeRoads(['Ngong Road', 'Kilimani Road']);
        });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ padding: '0px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center' }}>
        <span  style={{fontSize: "18px"}}>Welt Tallis Nairobi Traffic</span>
        <button
          onClick={toggleModal}
          style={{
            padding: '8px 5px',
            background: '#06b10f',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            marginLeft: '0px',
            flexShrink: 0,
          }}
        >
          View Traffic Status
        </button>
      </h2>

      <div
        ref={mapElement}
        style={{
          width: '100%',
          height: '100vh',
          borderRadius: '10px',
          marginBottom: '0rem',
        }}
      />
      
      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '100%',
            }}
          >
            <h3>Traffic Color Meaning</h3>
            <ul>
              <li>
                <strong style={{ color: 'green' }}>Green:</strong> Free-flowing
                traffic
              </li>
              <li>
                <strong style={{ color: 'orange' }}>Yellow:</strong> Medium
                congestion
              </li>
              <li>
                <strong style={{ color: 'red' }}>Red:</strong> Heavy congestion
              </li>
              <li>
                <strong style={{ color: 'black' }}>Black:</strong> Road closed
                or blocked
              </li>
            </ul>

            <hr />
            <h4>🚦 Congested Roads</h4>
            <ul>
              {congestedRoads.length
                ? congestedRoads.map((r, i) => <li key={i}>{r}</li>)
                : <li>No congested roads data available</li>}
            </ul>

            <h4>🟢 Free Roads</h4>
            <ul>
              {freeRoads.length
                ? freeRoads.map((r, i) => <li key={i}>{r}</li>)
                : <li>No free roads data available</li>}
            </ul>

            <button
              onClick={toggleModal}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: '#ff1900',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TomTomTrafficMap;