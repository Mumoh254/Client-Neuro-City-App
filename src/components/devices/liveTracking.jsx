// LiveTrackingMap.js
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled, { keyframes } from 'styled-components';
import { FiAlertTriangle, FiMapPin, FiWifiOff } from 'react-icons/fi';

// Custom marker SVG
const createCustomIcon = (color) => new L.DivIcon({
  className: 'custom-icon',
  html: `
    <svg width="40" height="40" viewBox="0 0 40 40">
      <path fill="${color}" d="M20 0c8.837 0 16 7.163 16 16 0 8.836-16 24-16 24S4 24.836 4 16C4 7.163 11.163 0 20 0z"/>
      <circle cx="20" cy="16" r="6" fill="#fff"/>
    </svg>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

// Animation for active tracking
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
`;

// Styled components
const TrackingBanner = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme[props.status]};
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const MapWrapper = styled.div`
  height: 100vh;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  margin: 2rem 0;
  position: relative;

  .custom-icon {
    animation: ${pulse} 2s infinite;
  }
`;

const StatusPanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 280px;
`;

const Marker = ({ position, status, imei, timestamp }) => {
  const map = useMap();
  const markerRef = useRef(null);
  
  useEffect(() => {
    if (status === 'TRACKING') {
      map.flyTo(position, 16, { duration: 1 });
    }
  }, [position, status, map]);

  return (
    <L.marker 
      position={position}
      icon={createCustomIcon(status === 'LOST' ? '#ff4757' : '#2ed573')}
      ref={markerRef}
    >
      <L.Tooltip permanent direction="bottom">
        <div className="text-center">
          <FiMapPin className="mb-1" />
          <div className="fw-bold">{imei}</div>
          <small>{new Date(timestamp).toLocaleTimeString()}</small>
        </div>
      </L.Tooltip>
    </L.marker>
  );
};

const LiveTrackingMap = () => {
  const [trackingDevice, setTrackingDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const ws = useRef(null);

 
  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(`wss:${BASE_URl}/tracking`);

      ws.current.onopen = () => {
        setConnectionStatus('connected');
        ws.current.send(JSON.stringify({ type: 'INIT' }));
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          const lostDevices = data.filter(d => d.status === 'LOST');
          setDevices(lostDevices);
          if (lostDevices.length > 0) {
            setTrackingDevice(lostDevices[0]);
          }
        }
      };

      ws.current.onerror = (error) => {
        setConnectionStatus('error');
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        setConnectionStatus('disconnected');
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  return (
    <MapWrapper>
      {trackingDevice && (
        <TrackingBanner status={trackingDevice.status === 'LOST' ? 'warning' : 'success'}>
          <FiAlertTriangle size={24} />
          <div>
            <h4 className="mb-0">Tracking Lost Device</h4>
            <small>IMEI: {trackingDevice.imei}</small>
          </div>
        </TrackingBanner>
      )}

      <StatusPanel>
        <h5 className="d-flex align-items-center gap-2">
          {connectionStatus === 'connected' ? (
            <>
              <span className="text-success">●</span> Live Tracking
            </>
          ) : (
            <>
              <FiWifiOff />
              Connection Lost
            </>
          )}
        </h5>
        <div className="mt-2">
          {devices.map(device => (
            <div 
              key={device.imei} 
              className="p-2 mb-2 rounded cursor-pointer"
              style={{ 
                background: device.imei === trackingDevice?.imei ? '#f8f9fa' : 'transparent',
                border: `2px solid ${device.status === 'LOST' ? '#ff4757' : '#2ed573'}`
              }}
              onClick={() => setTrackingDevice(device)}
            >
              <div className="d-flex justify-content-between">
                <div>
                  <div className="fw-bold">{device.imei}</div>
                  <small className="text-muted">
                    {new Date(device.timestamp).toLocaleTimeString()}
                  </small>
                </div>
                <div className={`badge ${device.status === 'LOST' ? 'bg-danger' : 'bg-success'}`}>
                  {device.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </StatusPanel>

      <MapContainer
        center={[-1.286389, 36.817223]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {trackingDevice && (
          <Marker
            position={[trackingDevice.latitude, trackingDevice.longitude]}
            status={trackingDevice.status}
            imei={trackingDevice.imei}
            timestamp={trackingDevice.timestamp}
          />
        )}
      </MapContainer>
    </MapWrapper>
  );
};

export default LiveTrackingMap;