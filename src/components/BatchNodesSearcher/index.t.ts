import { type APIs, type SearchObjectInterface, type GraphData, type MergeMode } from '../typings';
import { joinNodeIds } from '../utils';

export type BatchNodesSearcherProps = {
  /**
   * @description A function to get the entities.
   */
  getEntities: APIs['GetEntitiesFn'];
  /**
   * @description All the entity types that stored in the database.
   */
  entityTypes: string[];
  /**
   * @description A listener to listen the submit event.
   * @default undefined
   */
  onOk?: (searchObj: BatchNodesSearchObjectClass) => void;
  /**
   * @description A listener to listen the cancel event.
   * @default undefined
   */
  onCancel?: () => void;
  /**
   * @description A initial search object.
   * @default undefined
   */
  searchObject?: BatchNodesSearchObjectClass;
};

// Allow to predict the edges between two nodes.
type BatchNodesSearchObject = {
  entity_ids: string[];
  entity_types: string[];
};

export class BatchNodesSearchObjectClass implements SearchObjectInterface {
  data: BatchNodesSearchObject;
  merge_mode: MergeMode;

  constructor(data: BatchNodesSearchObject, merge_mode: MergeMode) {
    this.data = data;
    this.merge_mode = merge_mode;
  }

  get_instance_id(): string {
    return `batch-nodes-search-object`;
  }

  get_current_node_id(): string | undefined {
    return undefined;
  }

  process(apis: APIs): Promise<GraphData> {
    if (this.data.entity_ids.length == this.data.entity_types.length) {
      return apis.GetNodesFn({
        node_ids: joinNodeIds(this.data.entity_ids, this.data.entity_types),
      });
    }

    return new Promise((resolve, reject) => {
      reject('The length of entity_ids and entity_types must be equal.');
    });
  }
}
