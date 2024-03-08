import type { PlotlyEditorState, PlotlyChart as PlotlyChartType } from './data';

export interface PlotlyViewerProps {
  /**
   * @description The id of the div that will contain the plotly chart
   */
  divId?: string;
  /**
   * @description Whether or not to force a resize of the plotly chart
   * @default false
   */
  forceResize?: boolean;
  /**
   * @description The plotly data to be rendered
   * @default null
   */
  plotlyData: PlotlyChartType | null;
  /**
   * @description Listener for plotly chart's update event
   * @default null
   */
  handleUpdate?: (state: PlotlyEditorState) => void;
  /**
   * @description Plotly or PlotlyEditor
   * @default Plotly
   */
  mode?: string;
  /**
   * @description Listener for plotly chart's click event
   * @default null
   */
  onClick?: (event: any) => void;
}
