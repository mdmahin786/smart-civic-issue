import { useRef, useEffect, useState } from 'react';
import './HeatmapWidget.css';

const HeatmapWidget = ({ geoData = [] }) => {
  const canvasRef = useRef(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'dots'

  // Bangalore coordinate bounding box for scaling coordinates onto canvas
  // Lat: 12.85 to 13.10
  // Lng: 77.45 to 77.75
  const bounds = {
    minLat: 12.85,
    maxLat: 13.10,
    minLng: 77.45,
    maxLng: 77.75
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw stylized background grid (Bangalore Map Mock)
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw main Bengaluru arterial roads (mocked for visualization depth)
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.15)';
    ctx.lineWidth = 2.5;
    
    // Outer Ring Road loop representation
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Central roads crossing
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Neighborhood text markers
    ctx.fillStyle = 'rgba(107, 114, 128, 0.45)';
    ctx.font = '10px Outfit, Inter, system-ui';
    ctx.fillText("Koramangala", width * 0.6, height * 0.65);
    ctx.fillText("Indiranagar", width * 0.65, height * 0.45);
    ctx.fillText("Whitefield", width * 0.8, height * 0.5);
    ctx.fillText("Jayanagar", width * 0.4, height * 0.7);
    ctx.fillText("Malleshwaram", width * 0.35, height * 0.35);
    ctx.fillText("Hebbal", width * 0.5, height * 0.2);

    // Transform coordinate to canvas pixels
    const getXY = (lat, lng) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
      // Latitude goes from bottom to top in canvas y-axis (inverted)
      const y = height - (((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height);
      return { x, y };
    };

    if (viewMode === 'heatmap') {
      // Draw smooth radial gradients representing hot zones
      geoData.forEach(point => {
        const coords = point.location?.coordinates;
        if (!coords || !coords.lat || !coords.lng) return;
        const { x, y } = getXY(coords.lat, coords.lng);

        // Radial gradient from core color to transparent
        const gradient = ctx.createRadialGradient(x, y, 2, x, y, 28);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        gradient.addColorStop(0.3, 'rgba(249, 115, 22, 0.2)');
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 28, 0, Math.PI * 2);
        ctx.fill();
      });
    } else {
      // Draw individual priority dots
      geoData.forEach(point => {
        const coords = point.location?.coordinates;
        if (!coords || !coords.lat || !coords.lng) return;
        const { x, y } = getXY(coords.lat, coords.lng);

        // Color based on category or status
        let dotColor = '#10B981'; // Green (resolved/default)
        if (point.status === 'pending') dotColor = '#EF4444'; // Red
        if (point.status === 'assigned') dotColor = '#F59E0B'; // Orange
        if (point.status === 'in_progress') dotColor = '#8B5CF6'; // Purple
        if (point.status === 'rejected') dotColor = '#6B7280'; // Gray

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw subtle ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }
  }, [geoData, viewMode]);

  // Click handler to select coordinates
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    const getXY = (lat, lng) => {
      const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
      const y = height - (((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height);
      return { x, y };
    };

    // Find nearest point within click threshold
    let nearest = null;
    let minDist = 15;

    geoData.forEach(point => {
      const coords = point.location?.coordinates;
      if (!coords || !coords.lat || !coords.lng) return;
      const { x, y } = getXY(coords.lat, coords.lng);
      const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      
      if (dist < minDist) {
        minDist = dist;
        nearest = point;
      }
    });

    setSelectedPoint(nearest);
  };

  return (
    <div className="heatmap-widget card">
      <div className="heatmap-header">
        <div>
          <h3>BBMP GIS Interactive Heatmap</h3>
          <p>Real-time location density and ward hotspot clusters</p>
        </div>
        <div className="map-controls">
          <button 
            type="button" 
            className={`btn-toggle ${viewMode === 'heatmap' ? 'active' : ''}`}
            onClick={() => setViewMode('heatmap')}
          >
            🔥 Heatmap
          </button>
          <button 
            type="button" 
            className={`btn-toggle ${viewMode === 'dots' ? 'active' : ''}`}
            onClick={() => setViewMode('dots')}
          >
            📍 Pin Clusters
          </button>
        </div>
      </div>

      <div className="canvas-wrapper">
        <canvas 
          ref={canvasRef} 
          width={650} 
          height={380} 
          onClick={handleCanvasClick}
          className="map-canvas"
        />

        {selectedPoint && (
          <div className="map-tooltip">
            <button className="tooltip-close" onClick={() => setSelectedPoint(null)}>×</button>
            <h4>{selectedPoint.title}</h4>
            <div className="tooltip-details">
              <span><strong>Category:</strong> {selectedPoint.category}</span>
              <span><strong>Status:</strong> {selectedPoint.status}</span>
            </div>
          </div>
        )}
      </div>

      <div className="map-legend">
        <span className="legend-item"><span className="color-indicator" style={{background: '#EF4444'}}></span> Pending</span>
        <span className="legend-item"><span className="color-indicator" style={{background: '#F59E0B'}}></span> Assigned</span>
        <span className="legend-item"><span className="color-indicator" style={{background: '#8B5CF6'}}></span> In Progress</span>
        <span className="legend-item"><span className="color-indicator" style={{background: '#10B981'}}></span> Resolved</span>
        <span className="legend-item"><span className="color-indicator" style={{background: '#6B7280'}}></span> Rejected</span>
        <span className="legend-item"><span className="color-indicator" style={{background: 'rgba(239, 68, 68, 0.45)'}}></span> High Density Area</span>
      </div>
    </div>
  );
};

export default HeatmapWidget;
