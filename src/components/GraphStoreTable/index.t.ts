export type GraphHistoryItem = {
  description: string;
  payload: Record<string, any>;
  name: string;
  id: string;
  created_time: number;
  db_version: string;
  version: string;
  owner: any;
  parent: string;
};

export type GraphHistoryResponse = {
  total: number;
  page: number;
  page_size: number;
  data: GraphHistoryItem[];
};

export type GraphHistoryParams = {
  page?: number;
  page_size?: number;
  owner?: string;
  db_version?: string;
  version?: string;
};

export type GraphHistoryItemPayload = {
  description?: string;
  payload: Record<string, any>;
  name: string;
  created_time?: number;
  db_version?: string;
  version?: string;
  owner?: any;
  parent?: string;
};

export type TreeGraph = GraphHistoryItem & {
  children?: TreeGraph[];
  title: string;
  key: string;
  isLeaf?: boolean;
};

export type GraphTableProps = {
  /**
   * @description A list of graphs to be displayed.
   */
  graphs: GraphHistoryItem[];
  /**
   * @description Whether the table is visible.
   * @default false
   */
  visible?: boolean;
  /**
   * @description A callback function, executed when the user clicks the "Load" button. You may want to use this to load the graph into the graph studio.
   * @default () => {}
   */
  onLoad?: (graph: GraphHistoryItem, latestChild: GraphHistoryItem) => void;
  /**
   * @description A callback function, executed when the user clicks the "Delete" button. You may want to use this to delete the graph from the graph store.
   * @default () => {}
   */
  onDelete?: (graph: GraphHistoryItem) => void;
  /**
   * @description A callback function, executed when the user clicks the "Close" button. You may want to use this to close the table.
   * @default () => {}
   */
  onClose?: () => void;
  /**
   * @description A callback function, executed when the user clicks the "Upload" button. You may want to use this to upload the graph to the graph store.
   * @default () => {}
   */
  onUpload?: (graph: GraphHistoryItem) => void;
  /**
   * @description A component which can be as the parent of the table.
   * @default document.body
   */
  parent?: HTMLElement;
  /**
   * @description Whether to show the tree panel.
   * @default false
   */
  treeFormat?: boolean;
  /**
   * @description Which graph is selected.
   * @default undefined
   */
  selectedGraphId?: string;
};
