import type { APIs, GetGeneInfoFn, GetItems4GenePanelFn, GraphData } from '../typings';

export type KnowledgeGraphProps = {
  postMessage?: (message: any) => void;
  apis: APIs;
  data?: GraphData;
  getGeneInfo?: GetGeneInfoFn;
  getItems4GenePanel?: GetItems4GenePanelFn;
};

export type PromptItem = {
  key: string;
  label: string;
  type: 'node' | 'edge' | 'subgraph';
};
