import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { format } from 'date-fns';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [powerStats, setPowerStats] = useState(null);
  const [costStats, setCostStats] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2025-06-02'
  });

  const ELECTRICITY_RATE = 0.12; // $0.12 per kWh

  const filteredData = useMemo(() => {
    return costStats.filter(
      (item) =>
        item.date >= dateRange.startDate && item.date <= dateRange.endDate
    );
  }, [dateRange, costStats]);

  const powerData = useMemo(() => {
    return filteredData.map((item) => ({
      date: new Date(item.date).toISOString().split("T")[0],
      dailyPower: Number((item.dailyCost / ELECTRICITY_RATE).toFixed(2)),
      avgDailyPower: Number((item.avgDailyCost / ELECTRICITY_RATE).toFixed(2))
    }));
  }, [filteredData]);

  const costChartData = useMemo(() => {
    return filteredData.map((item) => ({
      date: new Date(item.date).toISOString().split("T")[0],
      dailyCost: item.dailyCost
    }));
  }, [filteredData]);

  const [avgDailyCost, setAvgDailyCost] = useState(0.0);

  const COLORS = ['#00ff9d', '#1a1a1a'];

  const fetchStats = async () => {
    try {
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        console.error("Invalid date range: Start date is after end date.");
        setPowerStats(null);
        setCostStats([]);
        setAvgDailyCost(0);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const [powerResponse, costResponse] = await Promise.all([
        fetch(
          `http://localhost:5000/api/power-consumption/power-stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `http://localhost:5000/api/power-consumption/cost-stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )     
      ]
    );
    console.log(powerResponse);
      if (!powerResponse.ok || !costResponse.ok)
        throw new Error("Failed to fetch stats");

      const powerData = await powerResponse.json();
      let costData = await costResponse.json();

      if (!Array.isArray(costData)) {
        console.warn("costData is not an array; defaulting to empty array.");
        costData = [];
      }

      setPowerStats(powerData);
      setCostStats(costData);

      if (costData.length === 0) {
        setAvgDailyCost(0);
        return;
      }

      const totalCost = costData.reduce((sum, item) => sum + item.dailyCost, 0);
      setAvgDailyCost(totalCost / costData.length);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    if (
      activeMenu === "power" ||
      activeMenu === "cost" ||
      activeMenu === "dashboard"
    ) {
      fetchStats();
    }
  }, [activeMenu, dateRange]);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
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
                    { name: "Used", value: powerStats?.totalPower || 0 },
                    { name: "Remaining", value: 2000 - (powerStats?.totalPower || 0) }
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
                    { name: "Average", value: powerStats?.averageDailyPower || 0 },
                    { name: "Remaining", value: 100 - (powerStats?.averageDailyPower || 0) }
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
              <p>{powerStats?.averageDailyPower?.toFixed(2) || 0}</p>
              <span>kWh/day</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h3>Cost Savings (AVG DAILY COST)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Saved", value: avgDailyCost || 0 },
                    { name: "Target", value: 200 - (avgDailyCost || 0) }
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
              <p>${avgDailyCost.toFixed(2) || 0}</p>
              <span>saved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderPowerContent = () => {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">
          Power Consumption Statistics
        </h2>

        {/* Date Range Inputs */}
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>
        </div>

        {/* Power Chart */}
        <div style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer>
            <LineChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(str) => format(new Date(str), "MMM d")}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="dailyPower"
                stroke="#00ff9d"
                name="Daily Power (kWh)"
              />
              <Line
                type="monotone"
                dataKey="avgDailyPower"
                stroke="#0088FE"
                name="Average Power (kWh)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };


  const renderCostContent = () => {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Cost Analysis</h2>

        {/* Date Range Inputs */}
        <div className="flex gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="border p-2 rounded"
            />
          </div>
        </div>

        {/* Cost Analysis Chart */}
        <div style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer>
            <LineChart data={costChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(str) => format(new Date(str), "MMM d")}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="dailyCost"
                stroke="#ff7300"
                name="Daily Cost ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };


  const renderEnergyContent = () => {
    if (!powerStats) {
      return <div className="content"><h2>Loading Energy Consumption Data...</h2></div>;
    }
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Energy Consumption</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Power</h3>
            <p>{powerStats.totalPower.toFixed(2)} kWh</p>
          </div>
          <div className="stat-card">
            <h3>Total Daily Power</h3>
            <p>{powerStats.totalDailyPower.toFixed(2)} kWh</p>
          </div>
          <div className="stat-card">
            <h3>Average Daily Power</h3>
            <p>{powerStats.averageDailyPower.toFixed(2)} kWh</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAppliancesContent = () => {
    if (!powerStats || !powerStats.applianceBreakdown) {
      return <div className="content"><h2>Loading Appliance Data...</h2></div>;
    }

    const applianceData = Object.keys(powerStats.applianceBreakdown).map(
      (key) => ({
        name: key,
        value: powerStats.applianceBreakdown[key]
      })
    );

    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Appliance Energy Breakdown</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={applianceData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {applianceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} kWh`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return renderDashboardContent();
      case "power":
        return renderPowerContent();
      case "cost":
        return renderCostContent();
      case "energy":
        return renderEnergyContent();
      case "appliances":
        return renderAppliancesContent();
      default:
        return (
          <div className="content">
            <h2>Select an option</h2>
          </div>
        );
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
              className={`nav-item ${activeMenu === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveMenu("dashboard")}
            >
              Dashboard
            </button>
            <button
              className={`nav-item ${activeMenu === "power" ? "active" : ""}`}
              onClick={() => setActiveMenu("power")}
            >
              Power Consumption
            </button>
            <button
              className={`nav-item ${activeMenu === "energy" ? "active" : ""}`}
              onClick={() => setActiveMenu("energy")}
            >
              Energy Consumption
            </button>
            <button
              className={`nav-item ${activeMenu === "cost" ? "active" : ""}`}
              onClick={() => setActiveMenu("cost")}
            >
              Cost
            </button>
            <button
              className={`nav-item ${activeMenu === "appliances" ? "active" : ""}`}
              onClick={() => setActiveMenu("appliances")}
            >
              Appliances
            </button>
          </nav>
        </div>

        <button className="signout-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="main-content">{renderContent()}</div>

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
          text-align: center;
        }
        .stat-card h3 {
          color: #666;
          font-size: 16px;
          margin-bottom: 10px;
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
