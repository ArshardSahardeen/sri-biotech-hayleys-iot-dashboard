import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  FlaskConical, 
  Activity, 
  CloudRain, 
  Sun, 
  Cloud,
  Bell, 
  Settings, 
  Power,
  Wifi,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Seed historical telemetry for the 15-point rolling chart window
const initialChartData = Array.from({ length: 15 }, (_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  moisture: 40 + Math.random() * 5,
  temp: 27 + Math.random() * 3,
}));

export default function App() {
  const [metrics, setMetrics] = useState({
    moisture: 42.5,
    ph: 6.1,        // Optimal Paddy soil pH: 5.5 - 6.5
    salinity: 1.2,  // Paddy EC threshold: < 2.0 dS/m
    temp: 29.5
  });

  const [irrigation, setIrrigation] = useState({
    isAuto: true,
    isPumpOn: false
  });

  const [chartData, setChartData] = useState(initialChartData);

  const [alerts, setAlerts] = useState([
    { id: 1, time: '10:12 AM', msg: 'System online. Edge gateway connected via NB-IoT.', type: 'info' },
    { id: 2, time: '10:05 AM', msg: 'Monsoon rain predicted in Kurunegala. Automated irrigation paused to prevent lodging.', type: 'warning' },
    { id: 3, time: '09:30 AM', msg: 'Soil pH optimal for Paddy crop (6.1).', type: 'success' },
  ]);

  // Poll simulated MQTT telemetry stream every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const fluctuate = (val, min, max) => {
          let newVal = val + (Math.random() - 0.5) * 0.8;
          if (newVal < min) newVal = min;
          if (newVal > max) newVal = max;
          return Number(newVal.toFixed(1));
        };

        const newMoisture = irrigation.isPumpOn ? prev.moisture + 0.5 : fluctuate(prev.moisture, 25, 80);

        return {
          moisture: newMoisture,
          ph: fluctuate(prev.ph, 5.0, 7.0),
          salinity: fluctuate(prev.salinity, 0.5, 3.0),
          temp: fluctuate(prev.temp, 24, 36)
        };
      });

      setChartData(prev => {
        const newData = [...prev.slice(1)];
        const now = new Date();
        newData.push({
          time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
          moisture: metrics.moisture,
          temp: metrics.temp
        });
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [irrigation.isPumpOn, metrics]);

  const handleToggleAuto = () => {
    setIrrigation(prev => {
      const newAuto = !prev.isAuto;
      if (newAuto) {
        addAlert('System reverted to Automated Control.', 'info');
      } else {
        addAlert('Manual Override engaged. Automation disabled.', 'warning');
      }
      return { ...prev, isAuto: newAuto };
    });
  };

  const handleTogglePump = () => {
    setIrrigation(prev => {
      const newPumpState = !prev.isPumpOn;
      // Disengage automated rules whenever manual pump control is triggered
      const newAutoState = false; 
      
      addAlert(`Irrigation Pump manually turned ${newPumpState ? 'ON' : 'OFF'}.`, newPumpState ? 'success' : 'warning');
      
      return { isAuto: newAutoState, isPumpOn: newPumpState };
    });
  };

  const addAlert = (msg, type) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setAlerts(prev => [{ id: Date.now(), time: timeStr, msg, type }, ...prev].slice(0, 5));
  };

  const MetricCard = ({ title, value, unit, icon: Icon, colorClass, status }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline space-x-1">
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            <span className="text-slate-400 text-sm">{unit}</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-20`}>
          <Icon className={colorClass.replace('bg-', 'text-').replace('text-opacity-20', '')} size={24} />
        </div>
      </div>
      <div className="flex items-center text-xs">
        <span className={`px-2 py-1 rounded-full ${status === 'Optimal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
          {status}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Droplets className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sri Biotech IoT</h1>
            <p className="text-emerald-400 text-sm font-medium">Hayleys Agriculture - Kurunegala Paddy Farm</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex flex-col text-right">
            <span className="text-slate-400 text-sm">System Status</span>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-medium">NB-IoT Online</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Soil Moisture" 
          value={metrics.moisture} 
          unit="%" 
          icon={Droplets} 
          colorClass="text-blue-400 bg-blue-400"
          status={metrics.moisture > 35 ? "Optimal" : "Low"}
        />
        <MetricCard 
          title="Soil pH" 
          value={metrics.ph} 
          unit="pH" 
          icon={FlaskConical} 
          colorClass="text-purple-400 bg-purple-400"
          status={metrics.ph >= 5.5 && metrics.ph <= 6.5 ? "Optimal (Paddy)" : "Warning"}
        />
        <MetricCard 
          title="Salinity (EC)" 
          value={metrics.salinity} 
          unit="dS/m" 
          icon={Activity} 
          colorClass="text-amber-400 bg-amber-400"
          status={metrics.salinity < 2.0 ? "Optimal" : "High"}
        />
        <MetricCard 
          title="Ambient Temp" 
          value={metrics.temp} 
          unit="°C" 
          icon={Thermometer} 
          colorClass="text-red-400 bg-red-400"
          status={metrics.temp > 35 ? "High" : "Optimal"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Live Edge Analytics</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-400">Moisture</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-slate-400">Temp</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12} domain={[0, 50]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="moisture" stroke="#3b82f6" strokeWidth={3} dot={false} animationDuration={300} />
                <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={3} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center">
            <CloudRain className="mr-2 text-blue-400" size={20} />
            Kurunegala Weather API
          </h2>
          
          <div className="flex-grow flex flex-col justify-center items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 mb-4">
            <CloudRain size={48} className="text-blue-400 mb-2" />
            <h3 className="text-3xl font-bold text-white mb-1">85%</h3>
            <p className="text-slate-400 text-sm">Monsoon Rain Probability (24h)</p>
            <p className="text-blue-400 text-xs font-medium mt-2 bg-blue-400/10 px-3 py-1 rounded-full">
              Expect &gt; 15mm rainfall
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
              <span className="text-slate-400 flex items-center"><Sun size={14} className="mr-2 text-amber-400"/> Today</span>
              <span className="text-white font-medium">31° / 25°</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
              <span className="text-slate-400 flex items-center"><CloudRain size={14} className="mr-2 text-blue-400"/> Tomorrow</span>
              <span className="text-white font-medium">28° / 24°</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center"><Cloud size={14} className="mr-2 text-slate-400"/> Wednesday</span>
              <span className="text-white font-medium">30° / 24°</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center">
            <Settings className="mr-2 text-emerald-400" size={20} />
            Edge Gateway Irrigation Control
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
              <div>
                <p className="font-semibold text-white">Automated Logic (AI)</p>
                <p className="text-xs text-slate-400 mt-1">Uses soil sensors + weather API to prevent paddy flooding.</p>
              </div>
              <button 
                onClick={handleToggleAuto}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${irrigation.isAuto ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${irrigation.isAuto ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${irrigation.isPumpOn ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${irrigation.isPumpOn ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  <Power size={24} />
                </div>
                <div>
                  <p className="font-semibold text-white">Main Water Pump</p>
                  <p className={`text-xs mt-1 font-medium ${irrigation.isPumpOn ? 'text-blue-400' : 'text-slate-400'}`}>
                    Status: {irrigation.isPumpOn ? 'ACTIVE (Watering)' : 'STANDBY'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleTogglePump}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg ${
                  irrigation.isPumpOn 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/50' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-900/50'
                }`}
              >
                {irrigation.isPumpOn ? 'TURN OFF' : 'TURN ON'}
              </button>
            </div>
            
            {!irrigation.isAuto && (
              <div className="flex items-center text-amber-400 text-xs font-medium bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">
                <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                Warning: Manual mode active. Weather safety overrides are currently disabled.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col h-full">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center">
            <Bell className="mr-2 text-amber-400" size={20} />
            System Alerts Log
          </h2>
          
          <div className="flex-grow overflow-y-auto pr-2 space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="mt-0.5">
                  {alert.type === 'warning' && <AlertTriangle size={16} className="text-amber-400" />}
                  {alert.type === 'success' && <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div></div>}
                  {alert.type === 'info' && <Wifi size={16} className="text-blue-400" />}
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-slate-200">{alert.msg}</p>
                  <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
