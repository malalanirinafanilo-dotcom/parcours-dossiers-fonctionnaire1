import React from 'react';
import PlotlyChart, { ChartData, ChartLayout } from './PlotlyChart';

interface LineChartProps {
  title?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  data: {
    x: any[];
    y: number[];
    name?: string;
    color?: string;
    dash?: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';
    markers?: boolean;
    fill?: boolean;
  }[];
  height?: number;
  showLegend?: boolean;
  xAxisType?: 'linear' | 'log' | 'date' | 'category';
  yAxisType?: 'linear' | 'log';
  className?: string;
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  xAxisTitle,
  yAxisTitle,
  data,
  height = 400,
  showLegend = true,
  xAxisType = 'category',
  yAxisType = 'linear',
  className = '',
  loading = false,
}) => {
  const colors = ['#22C55E', '#16A34A', '#15803D', '#4ADE80', '#86EFAC'];
  
  const chartData: ChartData[] = data.map((series, index) => ({
    type: 'scatter',
    mode: series.markers ? 'lines+markers' : 'lines',
    x: series.x,
    y: series.y,
    name: series.name || `Série ${index + 1}`,
    line: {
      color: series.color || colors[index % colors.length],
      width: 2.5,
      dash: series.dash || 'solid',
      shape: 'spline',
      smoothing: 1.3,
    },
    marker: series.markers ? {
      size: 6,
      color: series.color || colors[index % colors.length],
      symbol: 'circle',
      line: {
        color: 'white',
        width: 1,
      },
    } : undefined,
    fill: series.fill ? 'tozeroy' : 'none',
    fillcolor: series.fill ? `rgba(34, 197, 94, 0.1)` : undefined,
    hovertemplate: '<b>%{x}</b><br>Valeur: %{y:.2f}<extra></extra>',
  }));

  const layout: ChartLayout = {
    title: title ? {
      text: title,
      font: { size: 16, color: '#111827', family: 'Inter, sans-serif' },
      x: 0.5,
      xanchor: 'center',
    } : undefined,
    xaxis: {
      title: xAxisTitle,
      type: xAxisType,
      showgrid: true,
      gridcolor: '#E5E7EB',
      gridwidth: 1,
      zeroline: false,
      showline: true,
      linecolor: '#D1D5DB',
      linewidth: 1,
      tickfont: { size: 11, color: '#4B5563' },
      tickangle: -45,
      rangeslider: xAxisType === 'date' ? { visible: true } : undefined,
    },
    yaxis: {
      title: yAxisTitle,
      type: yAxisType,
      showgrid: true,
      gridcolor: '#E5E7EB',
      gridwidth: 1,
      zeroline: true,
      zerolinecolor: '#D1D5DB',
      zerolinewidth: 1,
      showline: true,
      linecolor: '#D1D5DB',
      linewidth: 1,
      tickfont: { size: 11, color: '#4B5563' },
    },
    showlegend: showLegend,
    legend: {
      x: 1,
      y: 1,
      xanchor: 'right',
      yanchor: 'top',
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: '#E5E7EB',
      borderwidth: 1,
      font: { size: 11, color: '#374151' },
    },
    hovermode: 'x unified',
    margin: { l: 60, r: 30, t: title ? 80 : 30, b: 80 },
  };

  return (
    <PlotlyChart
      data={chartData}
      layout={layout}
      height={height}
      className={className}
      loading={loading}
    />
  );
};

export default LineChart;