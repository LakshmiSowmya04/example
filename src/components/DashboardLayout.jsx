import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [powerStats, setPowerStats] = useState(null);
  const [costStats, setCostStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const COLORS = ['#00ff9d', '#1a1a1a'];

  const fetchStats = async () => {
    try {
      const [powerResponse, costResponse] = await Promise.all([
        fetch(`/api/power-consumption/power-stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        fetch(`/api/power-consumption/cost-stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);

      const powerData = await powerResponse.json();
      const costData = await costResponse.json();

      console.log('Power Data:', powerData); // Debugging log
      console.log('Cost Data:', costData);
      
      setPowerStats(powerData);
      setCostStats(costData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (activeMenu === 'power' || activeMenu === 'cost') {
      fetchStats();
    }
  }, [activeMenu, dateRange]);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
                    { name: 'Used', value: powerStats?.totalPower || 0 },
                    { name: 'Remaining', value: 2000 - (powerStats?.totalPower || 0) }
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
              <p>{powerStats?.totalPower?.toFixed(2) || 0}</p>
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
                    { name: 'Average', value: powerStats?.avgDailyPower || 0 },
                    { name: 'Remaining', value: 100 - (powerStats?.avgDailyPower || 0) }
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
              <p>{powerStats?.avgDailyPower?.toFixed(2) || 0}</p>
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
                    { name: 'Saved', value: costStats?.totalCost || 0 },
                    { name: 'Target', value: 200 - (costStats?.totalCost || 0) }
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
              <p>${costStats?.totalCost?.toFixed(2) || 0}</p>
              <span>saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
          <LineChart data={powerStats?.days || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="dailyPower" stroke="#00ff9d" />
          </LineChart>
        </ResponsiveContainer>
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
          <LineChart data={costStats?.days || []}>
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
        
        <button className="signout-button" onClick={handleSignOut}>
          Sign Out
        </button>
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