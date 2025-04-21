import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InstallCount = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [dailyData, setDailyData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [latestCount, setLatestCount] = useState(0);
  const [error, setError] = useState(null);

  const DAILY_GOAL = 1000;

  useEffect(() => {
    const fetchInstallStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/apiV1/smartcity-ke/track-install');

        const { totalCount, dailyStats } = response.data;

        if (dailyStats && dailyStats.length > 0) {
          setTotalCount(totalCount);
          setLabels(dailyStats.map(item => item.date));
          setDailyData(dailyStats.map(item => item.count));
          setLatestCount(dailyStats[dailyStats.length - 1].count);
        } else {
          setError('No install data available yet.');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load install stats.');
      }
    };

    fetchInstallStats();
  }, []);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Installs Per Day',
        data: dailyData,
        backgroundColor: 'rgba(6, 177, 15, 0.7)',
        borderColor: 'rgba(6, 177, 15, 1)',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '📊 Daily Install Trend (Last 7 Days)' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  const progressPercent = Math.min((latestCount / DAILY_GOAL) * 100, 100).toFixed(1);

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4 fw-bold">📱 City Neuro App Analytics</h2>

      {error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <>
          <div className="row text-center mb-4">
            <div className="col-md-6 mb-3">
              <h5>Total Installs</h5>
              <h2 className="text-primary">{totalCount.toLocaleString()}</h2>
            </div>
            <div className="col-md-6">
              <h5>Today's Installs</h5>
              <h2 className="text-success">{latestCount}</h2>
              <div className="progress mt-2" style={{ height: '20px' }}>
                <div
                  className="progress-bar progress-bar-striped bg-success"
                  role="progressbar"
                  style={{ width: `${progressPercent}%` }}
                  aria-valuenow={progressPercent}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progressPercent}% of {DAILY_GOAL}
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow p-4">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
};

export default InstallCount;
