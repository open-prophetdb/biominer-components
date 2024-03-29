// @ts-ignore
import * as plotly from 'plotly.js/dist/plotly';
import * as React from 'react';
// @ts-ignore
import PlotlyEditor from 'react-chart-editor';
// @ts-ignore
import PlotlyChart from 'react-plotly.js';
import { getLocale } from './util';

// @ts-ignore
import * as localeDictionary from 'plotly.js/lib/locales/zh-cn';
import type {
  Data,
  Frames,
  Layout,
  PlotlyEditorState,
  PlotlyChart as PlotlyChartType,
} from './data';

import 'react-chart-editor/lib/react-chart-editor.css';
import './index.less';

export interface ChartEditorProps {
  plotlyData: PlotlyChartType | null;
  handleUpdate?: (state: PlotlyEditorState) => void;
  mode?: string;
  responsiveKey: number | string;
}

export default class ChartEditor extends React.PureComponent<ChartEditorProps> {
  constructor(props: ChartEditorProps) {
    super(props);
  }

  handleUpdate = (data: Data, layout: Layout, frames: Frames) => {
    if (this.props.handleUpdate) {
      this.props.handleUpdate({ data, layout, frames });
    }
  };

  handleRender = (data: Data, layout: Layout, frames: Frames) => {
    if (this.props.handleUpdate) {
      this.props.handleUpdate({ data, layout, frames });
    }
  };

  handleResize = () => {
    if (this.ref.state.graphDiv instanceof HTMLElement)
      plotly.Plots.resize(this.ref.state.graphDiv);
  };

  render() {
    const config = {
      toImageButtonOptions: {
        format: 'svg', // one of png, svg, jpeg, webp
        filename: 'custom_image',
        height: 1000,
        width: 1000,
        scale: 1, // Multiply title/legend/axis/canvas sizes by this factor
      },
      editable: true,
      scrollZoom: false,
      displaylogo: false,
      displayModeBar: true,
      showTips: true,
      responsive: true,
      // @ts-ignore
      locales: { 'zh-CN': localeDictionary },
      locale: getLocale(),
    };

    console.log('PlotlyViewer updated: ', this.props.mode);

    let { data, layout, frames } = this.props.plotlyData || {
      data: [],
      layout: {},
    };

    layout = {
      ...layout,
      // Reset the margin
      margin: {
        t: 50,
        r: 50,
        b: 50,
        l: 50,
      },
    };

    // mode: ["Plotly", "PlotlyEditor"]
    return this.props.mode === 'Plotly' ? (
      <PlotlyChart
        ref={(plotlyRef: PlotlyEditor) => {
          this.ref = plotlyRef;
        }}
        useResizeHandler
        className="plotly-viewer"
        data={data}
        layout={layout}
        // @ts-ignore - TODO: how to fix this?
        config={config}
      />
    ) : (
      <div className="plotly-editor">
        <PlotlyEditor
          ref={(ref: PlotlyEditor) => {
            this.ref = ref;
          }}
          data={data}
          layout={layout}
          config={config}
          frames={frames}
          plotly={plotly}
          onUpdate={this.handleUpdate}
          onRender={this.handleRender}
          useResizeHandler
          debug
          advancedTraceTypeSelector
        />
      </div>
    );
  }

  ref: PlotlyEditor;
}
