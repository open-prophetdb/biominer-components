// import { message } from 'antd';
import type {
  APIs,
  RelationStat,
  SearchObjectInterface,
  GraphData,
  MergeMode,
  ComposeQueryItem,
  QueryItem,
} from '../typings';
import { COMPOSED_ENTITY_DELIMITER } from '../typings';

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
  onOk?: (searchObj: LinkedNodesSearchObjectClass) => void;
  /**
   * @description A listener to listen the cancel event.
   * @default undefined
   */
  onCancel?: () => void;
  /**
   * @description A initial search object.
   * @default undefined
   */
  searchObject?: LinkedNodesSearchObjectClass;
};

// Allow to query the linked nodes and related edges of a node, these nodes may connect with the node by one or several hops.
type LinkedNodesSearchObject = {
  entity_type: string;
  entity_id: string;
  relation_types?: string[];
  nsteps?: number;
  limit?: number;
};

export class LinkedNodesSearchObjectClass implements SearchObjectInterface {
  data: LinkedNodesSearchObject;
  merge_mode: MergeMode;

  constructor(data: LinkedNodesSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  get_instance_id(): string {
    return `linked-nodes-search-object`;
  }

  get_current_node_id(): string | undefined {
    return `${this.data.entity_type}${COMPOSED_ENTITY_DELIMITER}${this.data.entity_id}`;
  }

  async process(apis: APIs): Promise<GraphData> {
    if (!this.data.nsteps || this.data.nsteps === 1) {
      const source_query: ComposeQueryItem = {
        operator: 'and',
        items: [
          {
            field: 'source_type',
            operator: '=',
            value: this.data.entity_type,
          },
          {
            field: 'source_id',
            operator: '=',
            value: this.data.entity_id,
          },
        ],
      };

      const target_query: ComposeQueryItem = {
        operator: 'and',
        items: [
          {
            field: 'target_type',
            operator: '=',
            value: this.data.entity_type,
          },
          {
            field: 'target_id',
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
        source_query.items.push(item);
        target_query.items.push(item);
      }

      let query: ComposeQueryItem = {
        operator: 'or',
        items: [source_query, target_query],
      };

      return apis.GetOneStepLinkedNodesFn({
        query_str: JSON.stringify(query),
        page: 1,
        page_size: this.data.limit || 10,
      });
    } else {
      return new Promise((resolve, reject) => {
        // message.error('Not implemented yet.');
        console.log('LinkedNodesSearchObjectClass: Not implemented yet.');
        resolve({ nodes: [], edges: [] });
      });
    }
  }
}
