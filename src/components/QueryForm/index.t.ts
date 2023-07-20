import type { SearchObjectInterface, RelationStat, APIs } from '../typings';

export type QueryFormProps = {
  onOk?: (searchObj: SearchObjectInterface) => void;
  onCancel?: () => void;
  searchObject?: SearchObjectInterface;
  entityTypes: string[];
  relationStat: RelationStat[];
  getEntities: APIs['GetEntitiesFn'];
  getRelationCounts: APIs['GetRelationCountsFn'];
  tabKey?:
    | 'linked-nodes-searcher'
    | 'similarity-nodes-searcher'
    | 'path-searcher'
    | 'batch-nodes-searcher';
};
