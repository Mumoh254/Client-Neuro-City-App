import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// SACCOs data (create a new file saccosData.js)
const StagesData = [
  {
    stage: "Pipeline",
    location: "Embakasi",
    saccos: [
      { name: "Umoinner Sacco", routes: ["Pipeline-CBD", "Pipeline-Kasarani"], contact: "0712345678" },
      { name: "Salty Danora", routes: ["Pipeline-Kayole", "Pipeline-Dandora"], contact: "0723456789" }
    ],
    coordinates: { lat: -1.3070, lng: 36.9147 }
  },
  {
    stage: "Dandora",
    location: "Nairobi East",
    saccos: [
      { name: "Dandora Sacco", routes: ["Dandora-CBD", "Dandora-Kariobangi"], contact: "0734567890" },
      { name: "Kayole Travellers", routes: ["Kayole-CBD", "Kayole-Umoja"], contact: "0745678901" }
    ],
    coordinates: { lat: -1.2600, lng: 36.9085 }
  },
  // Add more stages and SACCOs as needed
];

// Stages List Component
function StagesList() {
  return (
    <div className="stages-container">
      <h2>Nairobi Matatu Stages</h2>
      <div className="stages-grid">
        {stagesData.map((stage) => (
          <Link 
            to={`/stage/${stage.stage}`} 
            key={stage.stage}
            className="stage-card"
          >
            <h3>{stage.stage} Stage</h3>
            <p>Location: {stage.location}</p>
            <p>Available SACCOs: {stage.saccos.length}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// SaccoDetail Component
function SaccoDetail() {
  const { stageName, saccoName } = useParams();
  const stage = stagesData.find(s => s.stage === stageName);
  const sacco = stage?.saccos.find(s => s.name === saccoName);

  return (
    <div className="sacco-detail">
      <h2>{saccoName}</h2>
      <div className="sacco-info">
        <div className="sacco-meta">
          <p>Stage: {stageName}</p>
          <p>Contact: {sacco?.contact}</p>
          <p>Routes: {sacco?.routes.join(', ')}</p>
        </div>
        <div className="sacco-map">
          <TomTomTrafficMap 
            center={stage.coordinates}
            zoom={14}
            marker={stage.coordinates}
          />
        </div>
      </div>
      <Link to="/stages" className="back-button">← Back to Stages</Link>
    </div>
  );
}

export default  StagesData