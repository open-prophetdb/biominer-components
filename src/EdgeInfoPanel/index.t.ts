import type { GraphNode, GraphEdge, APIs } from '../typings';

export type EdgeInfo = {
  startNode: GraphNode;
  endNode: GraphNode;
  edge: GraphEdge;
};

export type EdgeInfoPanelProps = {
  /**
   * @description The information of the edge
   * @default undefined
   */
  edgeInfo?: EdgeInfo;
  /**
   * @description The function to fetch publications
   * @default undefined
   */
  fetchPublications?: APIs['GetPublicationsFn'];
  /**
   * @description The function to fetch publication
   * @default undefined
   */
  fetchPublication?: APIs['GetPublicationFn'];
};
