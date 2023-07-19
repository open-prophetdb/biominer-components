import type { GraphNode, GetItems4GenePanelFn, GetGeneInfoFn } from '../typings';

export type NodeInfoPanelProps = {
  node?: GraphNode;
  getItems4GenePanel: GetItems4GenePanelFn;
  getGeneInfo: GetGeneInfoFn;
};
