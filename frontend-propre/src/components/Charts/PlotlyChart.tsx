import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';
import { Loader } from 'lucide-react';

export interface ChartData {
  type: 'scatter' | 'bar' | 'pie' | 'line' | 'area' | 'histogram' | 'box' | 'heatmap';
  x?: any[];
  y?: any[];
  z?: any[];
  values?: any[];
  labels?: any[];
  name?: string;
  mode?: 'lines' | 'markers' | 'lines+markers' | 'none';
  line?: {
    color?: string;
    width?: number;
    shape?: 'linear' | 'spline' | 'hv' | 'vh' | 'hvh' | 'vhv';
    smoothing?: number;
    dash?: 'solid' | 'dot' | 'dash' | 'longdash' | 'dashdot' | 'longdashdot';
  };
  marker?: {
    color?: string | string[];
    size?: number | number[];
    symbol?: 'circle' | 'square' | 'diamond' | 'cross' | 'x' | 'triangle-up' | 'triangle-down';
    opacity?: number;
  };
  text?: string[];
  hoverinfo?: 'all' | 'x' | 'y' | 'z' | 'text' | 'name' | 'none';
  orientation?: 'v' | 'h';
  width?: number;
  hole?: number;
  [key: string]: any;
}

export interface ChartLayout {
  title?: {
    text: string;
    font?: { size: number; color: string; family: string };
    x?: number;
    xanchor?: 'auto' | 'left' | 'center' | 'right';
  };
  xaxis?: {
    title?: string;
    showgrid?: boolean;
    gridcolor?: string;
    gridwidth?: number;
    zeroline?: boolean;
    showline?: boolean;
    linecolor?: string;
    linewidth?: number;
    tickfont?: { size: number; color: string };
    tickangle?: number;
    type?: 'linear' | 'log' | 'date' | 'category';
    rangeselector?: any;
    rangeslider?: any;
  };
  yaxis?: {
    title?: string;
    showgrid?: boolean;
    gridcolor?: string;
    gridwidth?: number;
    zeroline?: boolean;
    showline?: boolean;
    linecolor?: string;
    linewidth?: number;
    tickfont?: { size: number; color: string };
    type?: 'linear' | 'log' | 'date' | 'category';
  };
  showlegend?: boolean;
  legend?: {
    x?: number;
    y?: number;
    bgcolor?: string;
    bordercolor?: string;
    borderwidth?: number;
    font?: { size: number; color: string };
    orientation?: 'v' | 'h';
  };
  margin?: {
    l?: number;
    r?: number;
    t?: number;
    b?: number;
    pad?: number;
  };
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  hovermode?: 'x' | 'y' | 'closest' | false;
  barmode?: 'group' | 'stack' | 'overlay' | 'relative';
  bargap?: number;
  bargroupgap?: number;
  colorway?: string[];
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface ChartConfig {
  responsive?: boolean;
  displaylogo?: boolean;
  displayModeBar?: boolean | 'hover';
  modeBarButtonsToRemove?: string[];
  modeBarButtonsToAdd?: any[];
  toImageButtonOptions?: {
    format?: 'png' | 'svg' | 'jpeg' | 'webp';
    filename?: string;
    height?: number;
    width?: number;
    scale?: number;
  };
  showTips?: boolean;
  showLink?: boolean;
  linkText?: string;
  sendData?: boolean;
  staticPlot?: boolean;
  editable?: boolean;
  edits?: {
    annotationPosition?: boolean;
    annotationTail?: boolean;
    annotationText?: boolean;
    axisTitleText?: boolean;
    colorbarPosition?: boolean;
    colorbarTitleText?: boolean;
    legendPosition?: boolean;
    legendText?: boolean;
    shapePosition?: boolean;
    titleText?: boolean;
  };
  scrollZoom?: boolean;
  doubleClick?: 'reset' | 'autosize' | 'reset+autosize' | false;
}

interface PlotlyChartProps {
  data: ChartData[];
  layout?: ChartLayout;
  config?: ChartConfig;
  style?: React.CSSProperties;
  className?: string;
  onInitialized?: (figure: any) => void;
  onClick?: (event: any) => void;
  onHover?: (event: any) => void;
  onSelected?: (event: any) => void;
  onRelayout?: (event: any) => void;
  loading?: boolean;
  height?: number | string;
  width?: number | string;
  useResizeHandler?: boolean;
}

const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout = {},
  config = {},
  style = {},
  className = '',
  onInitialized,
  onClick,
  onHover,
  onSelected,
  onRelayout,
  loading = false,
  height = 400,
  width = '100%',
  useResizeHandler = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartId = useRef(`plotly-chart-${Math.random().toString(36).substr(2, 9)}`);

  // Configuration par défaut
  const defaultLayout: ChartLayout = {
    autosize: true,
    margin: { l: 50, r: 30, t: 50, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, sans-serif', size: 12, color: '#374151' },
    hovermode: 'closest',
    ...layout,
  };

  const defaultConfig: ChartConfig = {
    responsive: true,
    displaylogo: false,
    displayModeBar: 'hover',
    modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'chart',
      height: 600,
      width: 1200,
      scale: 2,
    },
    scrollZoom: true,
    ...config,
  };

  // Initialisation du graphique
  useEffect(() => {
    if (!chartRef.current || loading) return;

    const initChart = () => {
      Plotly.newPlot(
        chartId.current,
        data,
        defaultLayout,
        defaultConfig
      ).then((figure) => {
        if (onInitialized) onInitialized(figure);
      });
    };

    initChart();

    // Nettoyage
    return () => {
      if (chartRef.current) {
        Plotly.purge(chartId.current);
      }
    };
  }, []);

  // Mise à jour des données
  useEffect(() => {
    if (!chartRef.current || loading) return;

    Plotly.react(chartId.current, data, defaultLayout, defaultConfig);
  }, [data, layout, config, loading]);

  // Gestion du redimensionnement
  useEffect(() => {
    if (!useResizeHandler || !chartRef.current) return;

    const handleResize = () => {
      Plotly.Plots.resize(chartId.current);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [useResizeHandler]);

  // Gestionnaires d'événements
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = document.getElementById(chartId.current);
    if (!chart) return;

    if (onClick) {
      chart.on('plotly_click', onClick);
      return () => {
        chart.removeListener('plotly_click', onClick);
      };
    }
  }, [onClick]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = document.getElementById(chartId.current);
    if (!chart) return;

    if (onHover) {
      chart.on('plotly_hover', onHover);
      return () => {
        chart.removeListener('plotly_hover', onHover);
      };
    }
  }, [onHover]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = document.getElementById(chartId.current);
    if (!chart) return;

    if (onSelected) {
      chart.on('plotly_selected', onSelected);
      return () => {
        chart.removeListener('plotly_selected', onSelected);
      };
    }
  }, [onSelected]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = document.getElementById(chartId.current);
    if (!chart) return;

    if (onRelayout) {
      chart.on('plotly_relayout', onRelayout);
      return () => {
        chart.removeListener('plotly_relayout', onRelayout);
      };
    }
  }, [onRelayout]);

  return (
    <div
      ref={chartRef}
      style={{
        position: 'relative',
        width,
        height,
        minHeight: height,
        ...style,
      }}
      className={className}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-neutral-600">Chargement du graphique...</p>
          </div>
        </div>
      )}
      <div id={chartId.current} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PlotlyChart;