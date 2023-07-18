export type GeneInfo = {
  _id: string;
  _version: number;
  entrezgene: number;
  hgnc: number;
  name: string;
  symbol: string;
  taxid: number;
  summary: string;
  type_of_gene: string;
  ensembl: {
    gene: string;
    transcript: string[];
    protein: string[];
    translation: string[];
  };
  genomic_pos: {
    chr: string;
    start: number;
    end: number;
    strand: number;
  };
};

export type GraphNode = {
  comboId: string;
  id: string;
  label: string;
  nlabel: string;
  cluster: string;
  style: any;
  category: 'node' | 'edge';
  type: 'graphin-circle';
  data: Record<string, any>; // at least id, name
  x?: number;
  y?: number;
};

export type GetItems4GenePanelFn = (info: GeneInfo, exclude: any[]) => any[];

export type GetGeneInfoFn = (geneId: string) => Promise<GeneInfo>;

export type NodeInfoPanelProps = {
  node?: GraphNode;
  getItems4GenePanel: GetItems4GenePanelFn;
  getGeneInfo: GetGeneInfoFn;
};
