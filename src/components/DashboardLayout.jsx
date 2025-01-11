import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, eachDayOfInterval, parseISO } from 'date-fns';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pyvqqsmvsdnpjmmbfpqj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5dnFxc212c2RucGptbWJmcHFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1NjQyOTMsImV4cCI6MjA1MjE0MDI5M30.3uNQE8hSnLZTu7T2DtuKBs3P3kNNOXF4Pe7jL0Sn7lA'
);

const HARDCODED_USER_ID = '17da05b6-236d-44df-8624-50c2eda0bdac';

const generateRandomValueForDate = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash;
  }
  
  const baseValue = 20 + Math.abs(hash % 25);
  const daysFromStart = Math.floor((new Date(dateStr) - new Date('2024-01-01')) / (1000 * 60 * 60 * 24));
  return baseValue + (daysFromStart * 0.1);
};

const DashboardLayout = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [powerStats, setPowerStats] = useState({
    dailypower: 0,
    totalpower: 0,
    avgdailypower: 0,
    applianceBreakdown: [],
    timeSeriesData: []
  });
  const [costStats, setCostStats] = useState({
    totalCost: 0,
    days: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const COLORS = ['#00ff9d', '#1a1a1a'];

  const generatePowerData = () => {
    try {
      // Generate dates between start and end date
      const dates = eachDayOfInterval({
        start: parseISO(dateRange.startDate),
        end: parseISO(dateRange.endDate)
      });

      // Sort dates in ascending order (earliest to latest)
      dates.sort((a, b) => a - b);

      // Generate power data for each date
      const powerReadings = dates.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const power = generateRandomValueForDate(dateStr);
        return {
          date: format(date, 'MMM dd'),
          power: parseFloat(power.toFixed(2))
        };
      });

      // Calculate statistics
      const totalPower = powerReadings.reduce((sum, reading) => sum + reading.power, 0);
      const avgPower = totalPower / powerReadings.length;

      setPowerStats({
        ...powerStats,
        dailypower: powerReadings[powerReadings.length - 1].power,
        totalpower: parseFloat(totalPower.toFixed(2)),
        avgdailypower: parseFloat(avgPower.toFixed(2)),
        timeSeriesData: powerReadings
      });

      // Update cost stats
      const costPerKwh = 0.12;
      const dailyCosts = powerReadings.map(reading => ({
        _id: reading.date,
        dailyCost: parseFloat((reading.power * costPerKwh).toFixed(2))
      }));

      setCostStats({
        totalCost: parseFloat((totalPower * costPerKwh).toFixed(2)),
        days: dailyCosts
      });
    } catch (error) {
      console.error('Error generating power data:', error);
    }
  };

  useEffect(() => {
    generatePowerData();
  }, [dateRange]);

  const renderPowerContent = () => (
    <div className="content">
      <h2>Power Consumption Statistics</h2>
      <div className="date-range">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          className="date-input"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          className="date-input"
        />
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={powerStats.timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="power" stroke="#00ff9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="dashboard-content">
      <h2>Welcome to Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Consumption</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Used', value : 300 },
                    { name: 'Remaining', value: Math.max(0, 2000 - 300) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-value">
              <p>{300.00}</p>
              <span>kWh</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Daily Average</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Average', value: 30 },
                    { name: 'Remaining', value: Math.max(0, 100 - 30) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-value">
              <p>{30.00}</p>
              <span>kWh/day</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Cost Savings</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Saved', value: 112.3432},
                    { name: 'Target', value: Math.max(0, 200 - 112.3432 ) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-value">
              <p>${112.3434}</p>
              <span>saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCostContent = () => (
    <div className="content">
      <h2>Cost Analysis</h2>
      <div className="date-range">
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          className="date-input"
        />
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          className="date-input"
        />
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={costStats.days}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="dailyCost" stroke="#00ff9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeMenu) {
      case 'dashboard':
        return renderDashboardContent();
      case 'power':
        return renderPowerContent();
      case 'cost':
        return renderCostContent();
      case 'energy':
        return <div className="content"><h2>Energy Usage Analysis</h2></div>;
      case 'appliances':
        return <div className="content"><h2>Appliance Management</h2></div>;
      default:
        return <div className="content"><h2>Select an option</h2></div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="brand">
            <h2>EnergyTracker</h2>
          </div>
          
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveMenu('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeMenu === 'power' ? 'active' : ''}`}
              onClick={() => setActiveMenu('power')}
            >
              Power Consumption
            </button>
            <button 
              className={`nav-item ${activeMenu === 'energy' ? 'active' : ''}`}
              onClick={() => setActiveMenu('energy')}
            >
              Energy Consumption
            </button>
            <button 
              className={`nav-item ${activeMenu === 'cost' ? 'active' : ''}`}
              onClick={() => setActiveMenu('cost')}
            >
              Cost
            </button>
            <button 
              className={`nav-item ${activeMenu === 'appliances' ? 'active' : ''}`}
              onClick={() => setActiveMenu('appliances')}
            >
              Appliances
            </button>
          </nav>
        </div>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background-color: #f5f5f5;
        }

        .sidebar {
          width: 250px;
          background-color: #1a1a1a;
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .brand h2 {
          color: #00ff9d;
          margin-bottom: 40px;
          font-size: 24px;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nav-item {
          width: 100%;
          padding: 12px;
          text-align: left;
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          background-color: #333;
        }

        .nav-item.active {
          background-color: #00ff9d;
          color: #1a1a1a;
          font-weight: bold;
        }

        .signout-button {
          padding: 12px;
          background-color: #ff4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 20px;
          transition: background-color 0.3s ease;
        }

        .signout-button:hover {
          background-color: #ff0000;
        }

        .main-content {
          flex-grow: 1;
          padding: 30px;
          background-color: #ffffff;
          margin: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .stat-card {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .stat-card h3 {
          color: #666;
          font-size: 16px;
          margin-bottom: 10px;
          text-align: center;
        }

        .chart-wrapper {
          position: relative;
          height: 200px;
        }

        .chart-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .chart-value p {
          color: #1a1a1a;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }

        .chart-value span {
          color: #666;
          font-size: 14px;
        }

        .date-range {
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
        }

        .date-input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .chart-container {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        h2 {
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .content {
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;