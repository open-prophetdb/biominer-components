import type { APIs, GetGeneInfoFn, GetItems4GenePanelFn } from './interface';

export type KnowledgeGraphProps = {
  postMessage?: (message: any) => void;
  apis: APIs;
  getGeneInfo?: GetGeneInfoFn;
  getItems4GenePanel?: GetItems4GenePanelFn;
};
