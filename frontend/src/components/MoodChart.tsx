import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodData {
  id: number;
  mood: string;
  mood_intensity: number;
  created_at: string;
  note?: string;
}

interface MoodChartProps {
  moodData: MoodData[];
  chartType: 'line' | 'bar' | 'radar' | 'doughnut';
  timeRange?: 'week' | 'month' | 'all';
  className?: string;
}

const MoodChart: React.FC<MoodChartProps> = ({ 
  moodData, 
  chartType, 
  timeRange = 'week',
  className = '' 
}) => {
  // Filter data based on time range
  const filterDataByTimeRange = (data: MoodData[]) => {
    const now = new Date();
    const timeRanges = {
      week: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      month: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      all: new Date(0)
    };
    
    return data.filter(mood => new Date(mood.created_at) >= timeRanges[timeRange]);
  };

  const filteredData = filterDataByTimeRange(moodData);

  // Process data for different chart types
  const processDataForCharts = () => {
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group by date for line/bar charts
    const groupedByDate = sortedData.reduce((acc, mood) => {
      const date = new Date(mood.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { moods: [], intensities: [] };
      }
      acc[date].moods.push(mood.mood);
      acc[date].intensities.push(mood.mood_intensity);
      return acc;
    }, {} as Record<string, { moods: string[], intensities: number[] }>);

    // Calculate average intensity per date
    const dates = Object.keys(groupedByDate);
    const avgIntensities = dates.map(date => {
      const intensities = groupedByDate[date].intensities;
      return intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length;
    });

    // Count moods for doughnut chart
    const moodCounts = sortedData.reduce((acc, mood) => {
      acc[mood.mood] = (acc[mood.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Prepare radar chart data
    const moodIntensityByType = sortedData.reduce((acc, mood) => {
      if (!acc[mood.mood]) {
        acc[mood.mood] = { total: 0, count: 0 };
      }
      acc[mood.mood].total += mood.mood_intensity;
      acc[mood.mood].count += 1;
      return acc;
    }, {} as Record<string, { total: number, count: number }>);

    const radarLabels = Object.keys(moodIntensityByType);
    const radarData = radarLabels.map(mood => 
      moodIntensityByType[mood].total / moodIntensityByType[mood].count
    );

    return {
      dates,
      avgIntensities,
      moodCounts,
      radarLabels,
      radarData
    };
  };

  const chartData = processDataForCharts();

  // Chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#181818',
        titleColor: '#FFFFFF',
        bodyColor: '#B3B3B3',
        borderColor: '#282828',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#B3B3B3' },
        grid: { color: '#282828' }
      },
      y: {
        ticks: { color: '#B3B3B3' },
        grid: { color: '#282828' }
      }
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <Line
            data={{
              labels: chartData.dates,
              datasets: [
                {
                  label: 'Average Mood Intensity',
                  data: chartData.avgIntensities,
                  borderColor: '#1DB954',
                  backgroundColor: 'rgba(29, 185, 84, 0.1)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#1DB954',
                  pointBorderColor: '#FFFFFF',
                  pointBorderWidth: 2
                }
              ]
            }}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Mood Intensity Over Time',
                  color: '#FFFFFF',
                  font: { size: 16, weight: 'bold' }
                }
              },
              scales: {
                ...commonOptions.scales,
                y: {
                  ...commonOptions.scales.y,
                  min: 0,
                  max: 10,
                  ticks: {
                    ...commonOptions.scales.y.ticks,
                    stepSize: 2
                  }
                }
              }
            }}
          />
        );

      case 'bar':
        return (
          <Bar
            data={{
              labels: chartData.dates,
              datasets: [
                {
                  label: 'Average Mood Intensity',
                  data: chartData.avgIntensities,
                  backgroundColor: '#1DB954',
                  borderColor: '#1DB954',
                  borderWidth: 1
                }
              ]
            }}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Mood Intensity by Day',
                  color: '#FFFFFF',
                  font: { size: 16, weight: 'bold' }
                }
              },
              scales: {
                ...commonOptions.scales,
                y: {
                  ...commonOptions.scales.y,
                  min: 0,
                  max: 10,
                  ticks: {
                    ...commonOptions.scales.y.ticks,
                    stepSize: 2
                  }
                }
              }
            }}
          />
        );

      case 'radar':
        return (
          <Radar
            data={{
              labels: chartData.radarLabels,
              datasets: [
                {
                  label: 'Average Intensity by Mood',
                  data: chartData.radarData,
                  borderColor: '#1DB954',
                  backgroundColor: 'rgba(29, 185, 84, 0.2)',
                  pointBackgroundColor: '#1DB954',
                  pointBorderColor: '#FFFFFF',
                  pointBorderWidth: 2
                }
              ]
            }}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Mood Intensity Analysis',
                  color: '#FFFFFF',
                  font: { size: 16, weight: 'bold' }
                }
              },
              scales: {
                r: {
                  min: 0,
                  max: 10,
                  ticks: {
                    color: '#B3B3B3',
                    stepSize: 2
                  },
                  grid: {
                    color: '#282828'
                  },
                  pointLabels: {
                    color: '#B3B3B3'
                  }
                }
              }
            }}
          />
        );

      case 'doughnut':
        const colors = [
          '#1DB954', '#A78BFA', '#F472B6', '#FBBF24', 
          '#EF4444', '#3B82F6', '#10B981', '#8B5CF6'
        ];
        
        return (
          <Doughnut
            data={{
              labels: Object.keys(chartData.moodCounts),
              datasets: [
                {
                  data: Object.values(chartData.moodCounts),
                  backgroundColor: colors.slice(0, Object.keys(chartData.moodCounts).length),
                  borderColor: '#181818',
                  borderWidth: 2
                }
              ]
            }}
            options={{
              ...commonOptions,
              plugins: {
                ...commonOptions.plugins,
                title: {
                  display: true,
                  text: 'Mood Distribution',
                  color: '#FFFFFF',
                  font: { size: 16, weight: 'bold' }
                }
              }
            }}
          />
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  if (filteredData.length === 0) {
    return (
      <div className={`bg-spotify-medium-gray rounded-lg p-6 text-center ${className}`}>
        <div className="text-4xl mb-4">📊</div>
        <h3 className="spotify-text-body-medium text-white mb-2">
          No mood data available
        </h3>
        <p className="spotify-text-body-small spotify-text-gray">
          Start logging your moods to see beautiful visualizations
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-spotify-medium-gray rounded-lg p-6 ${className}`}>
      <div className="h-64">
        {renderChart()}
      </div>
    </div>
  );
};

export default MoodChart; 