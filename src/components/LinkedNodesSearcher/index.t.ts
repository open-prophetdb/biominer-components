import { message } from 'antd';
import type {
  APIs,
  RelationStat,
  SearchObjectInterface,
  GraphData,
  MergeMode,
  ComposeQueryItem,
  QueryItem,
} from '../typings';

export type LinkedNodesSearcherProps = {
  /**
   * @description A function to get the entities.
   */
  getEntities: APIs['GetEntitiesFn'];
  /**
   * @description A function to get the relation counts.
   */
  getRelationCounts: APIs['GetRelationCountsFn'];
  /**
   * @description All the entity types that stored in the database.
   */
  entityTypes: string[];
  /**
   * @description All the statistics of the relations.
   */
  relationStat: RelationStat[];
  /**
   * @description A listener to listen the submit event.
   * @default undefined
   */
  onOk?: (searchObj: NodeEdgeSearchObjectClass) => void;
  /**
   * @description A listener to listen the cancel event.
   * @default undefined
   */
  onCancel?: () => void;
  /**
   * @description A initial search object.
   * @default undefined
   */
  searchObject?: NodeEdgeSearchObjectClass;
};

// Allow to query the linked nodes and related edges of a node, these nodes may connect with the node by one or several hops.
type NodeEdgeSearchObject = {
  entity_type: string;
  entity_id: string;
  relation_types?: string[];
  nsteps?: number;
  limit?: number;
};

export class NodeEdgeSearchObjectClass implements SearchObjectInterface {
  data: NodeEdgeSearchObject;
  merge_mode: MergeMode;

  constructor(data: NodeEdgeSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  async process(apis: APIs): Promise<GraphData> {
    if (!this.data.nsteps || this.data.nsteps === 1) {
      const query: ComposeQueryItem = {
        operator: 'and',
        items: [
          {
            field: 'entity_type',
            operator: '=',
            value: this.data.entity_type,
          },
          {
            field: 'entity_id',
            operator: '=',
            value: this.data.entity_id,
          },
        ],
      };

      if (this.data.relation_types && this.data.relation_types.length > 0) {
        const item: QueryItem = {
          field: 'relation_type',
          operator: 'in',
          value: this.data.relation_types,
        };
        query.items.push(item);
      }

      return apis.GetOneStepLinkedNodesFn({
        query_str: JSON.stringify(query),
        page: 1,
        page_size: this.data.limit || 10,
      });
    } else {
      return new Promise((resolve, reject) => {
        message.error('Not implemented yet.');
        resolve({ nodes: [], edges: [] });
      });
    }
  }
}
