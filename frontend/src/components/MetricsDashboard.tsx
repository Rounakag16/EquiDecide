
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MetricsDashboardProps {
  score: number;
  historicalRate: number;
}

export function MetricsDashboard({ score, historicalRate }: MetricsDashboardProps) {
  // Determine color based on score (Funky but subtle variations)
  const getColor = (val: number) => {
    if (val < 50) return '#f43f5e'; // rose
    if (val < 75) return '#eab308'; // yellow
    return '#10b981'; // emerald
  };

  const data = {
    labels: ['Equity Index', 'Gap'],
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [
          getColor(score),
          '#f1f5f9' // slate base gap
        ],
        borderWidth: 2,
        borderColor: '#0f172a',
        circumference: 180,
        rotation: 270,
        cutout: '75%',
        borderRadius: [2, 0] // Quirky imperfect borders
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    animation: {
      duration: 2000,
      easing: 'easeOutQuart' as const
    }
  };

  return (
    <div className="bg-white doodle-box w-full p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
        {/* Left Section: Context Stats */}
        <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-slate-200 border-dashed pb-6 md:pb-0 md:pr-6">
          <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-2"><span>📊</span> Equity Dashboard</h2>
          <p className="text-sm font-semibold text-slate-500 mb-6 mt-2 leading-relaxed bg-slate-50 p-2 doodle-box-sm">System-wide transparency metrics tracking historical fairness over time.</p>
          
          <div className="bg-[#fffbeb] p-4 doodle-box-sm border border-[#fef08a]">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Historical Group Approval Rate</h4>
            <div className="flex items-end gap-2 text-slate-800">
              <span className="text-4xl font-black font-mono tracking-tighter">{(historicalRate * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Right Section: Gauge */}
        <div className="w-full md:w-2/3 flex flex-col items-center justify-center relative min-h-[160px]">
          <div className="w-full max-w-[300px] h-[150px] relative">
            <Doughnut data={data} options={options} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-[120%] text-center">
              <div className="text-5xl font-black text-slate-800 tracking-tighter" style={{ color: getColor(score) }}>{score}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Index</div>
            </div>
            
            {/* Visual labels on max and min side of gauge */}
            <div className="absolute bottom-4 left-0 text-slate-800 font-mono text-sm font-black bg-white px-2 py-0.5 border-4 border-slate-900 shadow-[2px_2px_0px_#f472b6] transform -rotate-6">0</div>
            <div className="absolute bottom-4 right-0 text-slate-800 font-mono text-sm font-black bg-white px-2 py-0.5 border-4 border-slate-900 shadow-[2px_2px_0px_#0ea5e9] transform rotate-6">100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
