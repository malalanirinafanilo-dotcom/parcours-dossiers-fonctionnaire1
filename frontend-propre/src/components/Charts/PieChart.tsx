import React from 'react';
import PlotlyChart, { ChartData, ChartLayout } from './PlotlyChart';

interface PieChartProps {
  title?: string;
  data: {
    labels: string[];
    values: number[];
    colors?: string[];
    hole?: number;
    name?: string;
  }[];
  height?: number;
  showLegend?: boolean;
  donut?: boolean;
  className?: string;
  loading?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  height = 400,
  showLegend = true,
  donut = false,
  className = '',
  loading = false,
}) => {
  const defaultColors = ['#22C55E', '#16A34A', '#15803D', '#4ADE80', '#86EFAC', '#BBF7D0', '#DCFCE7'];
  
  const chartData: ChartData[] = data.map((series, index) => ({
    type: 'pie',
    labels: series.labels,
    values: series.values,
    name: series.name || `Série ${index + 1}`,
    hole: donut ? 0.4 : series.hole,
    marker: {
      colors: series.colors || defaultColors,
      line: {
        color: 'white',
        width: 2,
      },
    },
    textinfo: 'label+percent',
    textposition: 'inside',
    insidetextorientation: 'radial',
    hoverinfo: 'label+value+percent',
    textfont: { size: 12, color: 'white' },
    automargin: true,
  }));

  const layout: ChartLayout = {
    title: title ? {
      text: title,
      font: { size: 16, color: '#111827', family: 'Inter, sans-serif' },
      x: 0.5,
      xanchor: 'center',
    } : undefined,
    showlegend: showLegend,
    legend: {
      x: 1,
      y: 0.5,
      xanchor: 'right',
      yanchor: 'middle',
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: '#E5E7EB',
      borderwidth: 1,
      font: { size: 11, color: '#374151' },
    },
    margin: { l: 30, r: 120, t: title ? 80 : 30, b: 30 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
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

export default PieChart;