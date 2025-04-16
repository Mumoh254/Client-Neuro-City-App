import { useEffect, useState } from 'react';
import { Card, Container, Row, Col, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { WiCloudy, WiDaySunny, WiRain, WiUmbrella, WiStrongWind, WiThermometer } from 'react-icons/wi';
import styled from 'styled-components';

const API_KEY = '12eefad78d76ef54b269ad5184db4985';

// Enhanced Styled Components
const LocationHeader = styled.div`
  background:  linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9));
  padding: 2rem;
  border-radius: 20px;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  .location-details {
    display: flex;
    gap: 2rem;
    align-items: center;
    
    span {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
    }
  }
`;

const WeatherCard = styled(Card)`
  background: ${props => props.bg || 'linear-gradient(145deg, #ffffff, #f8f9fa)'};
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  transition: transform 0.3s ease;
  min-height: 300px;
  overflow: hidden;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  }
`;

const WeatherIcon = styled.div`
  font-size: 6rem;
  margin: 1rem 0;
  color: ${props => props.color};
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
`;

const AdvisoryBadge = styled(Badge)`
  font-size: 0.9rem;
  padding: 1rem 0rem  1rem  0rem ;
  margin-left: 2rem;
  border-radius: 10px;
  background: ${props => props.variant === 'warning' 
    ? 'linear-gradient(45deg, #ff6b6b, #ff9f43)' 
    : props.variant === 'info' 
    ? 'linear-gradient(45deg, #2e86de, #54a0ff)' 
    : 'linear-gradient(45deg, #2ed573, #1dd1a1)'};
  color: white;
  margin: 0.5rem 0;
  width: fit-content;
  text-align: centre;
`;

const getWeatherIcon = (conditionCode) => {
  if (conditionCode >= 200 && conditionCode < 300) return { icon: <WiRain />, color: '#ff7675' };
  if (conditionCode >= 300 && conditionCode < 600) return { icon: <WiRain />, color: '#0984e3' };
  if (conditionCode >= 600 && conditionCode < 700) return { icon: <WiRain />, color: '#74b9ff' };
  if (conditionCode === 800) return { icon: <WiDaySunny />, color: '#fdcb6e' };
  if (conditionCode > 800) return { icon: <WiCloudy />, color: '#636e72' };
  return { icon: <WiCloudy />, color: '#b2bec3' };
};


const getWeatherAdvisory = (conditionCode) => {
  if (conditionCode >= 200 && conditionCode < 300) return { 
    text: '⚡ Thunderstorm Alert: Avoid open areas', 
    variant: 'warning' 
  };
  if (conditionCode >= 300 && conditionCode < 600) return { 
    text: '☔ Rain Alert: Carry umbrella, drive slowly (<60km/h)', 
    variant: 'info' 
  };
  if (conditionCode >= 600 && conditionCode < 700) return { 
    text: '❄️ Snow Alert: Use winter tires', 
    variant: 'info' 
  };
  if (conditionCode > 800) return { 
    text: '☁️ Cloudy: Reduce speed, maintain distance', 
    variant: 'info' 
  };
  return { 
    text: '☀️ Clear: Enjoy outdoor activities', 
    variant: 'success' 
  };
};


const WeatherForecast = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=-1.2921&lon=36.8219&appid=${API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Fetching live weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center my-5">
        ⚠️ Error: {error}
      </Alert>
    );
  }

  if (!weatherData) return null;

  const { main, weather, wind, sys, clouds, visibility, coord, name, dt } = weatherData;
  const { icon, color } = getWeatherIcon(weather[0].id);
  const advisory = getWeatherAdvisory(weather[0].id);
  const localTime = new Date(dt * 1000 + weatherData.timezone * 1000);

  return (
    <Container className="my-5">
      <LocationHeader>
        <h1>{name}, Kenya</h1>
        <div className="location-details">
          <span>
            <WiThermometer />
            Coordinates: {coord.lat.toFixed(2)}°N, {coord.lon.toFixed(2)}°E
          </span>
          <span>
            🕒 Local Time: {localTime.toLocaleTimeString('en-KE', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </span>
        </div>
      </LocationHeader>

      <Row className="g-4">
        <Col xs={12} lg={6}>
          <WeatherCard bg="linear-gradient(135deg, #f6f9ff, #eef2ff)" className="p-4">
            <Row className="align-items-center">
              <Col xs={4}>
                <WeatherIcon color={color}>{icon}</WeatherIcon>
                <h3 className="display-4 fw-bold mb-0">{Math.round(main.temp)}°C</h3>
                <p className="text-muted">Feels like {Math.round(main.feels_like)}°C</p>
              </Col>
              <Col xs={6} className="text-end">
                <AdvisoryBadge variant={advisory.variant}>
                  {advisory.text}
                </AdvisoryBadge>
                <div className="mt-3">
                  <p className="mb-2">
                    <WiUmbrella className="me-2" />
                    Cloud Cover: {clouds.all}%
                  </p>
                  <p className="mb-2">
                    <WiStrongWind className="me-2" />
                    Wind: {wind.speed}m/s ({getWindDirection(wind.deg)})
                  </p>
                  <p className="mb-0">
                    <WiThermometer className="me-2" />
                    Humidity: {main.humidity}%
                  </p>
                </div>
              </Col>
            </Row>
          </WeatherCard>
        </Col>

        {/* Secondary Cards */}
        <Col xs={12} md={6} lg={3}>
          <WeatherCard className="p-3">
            <h6 className="text-muted mb-3">Sun Cycle</h6>
            <div className="d-flex flex-column gap-2">
              <div>
                <span className="text-warning">🌅 Sunrise</span>
                <div>{new Date(sys.sunrise * 1000).toLocaleTimeString()}</div>
              </div>
              <div>
                <span className="text-primary">🌇 Sunset</span>
                <div>{new Date(sys.sunset * 1000).toLocaleTimeString()}</div>
              </div>
            </div>
            <ProgressBar className="mt-3" variant="warning" now={(new Date().getHours()/24)*100} 
              label={`Day Progress: ${((new Date().getHours()/24)*100).toFixed(1)}%`} />
          </WeatherCard>
        </Col>

        <Col xs={12} md={6} lg={3}>
          <WeatherCard className="p-3">
            <h6 className="text-muted mb-3">Environmental Data</h6>
            <div className="weather-details">
              <p>🌡️ Pressure: {main.pressure}hPa</p>
              <p>👁️ Visibility: {(visibility/1000).toFixed(1)}km</p>
              <p>🌫️ Dew Point: {calculateDewPoint(main.temp, main.humidity).toFixed(1)}°C</p>
            </div>
          </WeatherCard>
        </Col>
      </Row>
    </Container>
  );
};

// Helper Functions
const getWindDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(degrees / 45) % 8];
};

const calculateDewPoint = (temp, humidity) => {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * temp) / (b + temp) + Math.log(humidity / 100);
  return (b * alpha) / (a - alpha);
};

export default WeatherForecast;