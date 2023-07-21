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
    | 'linked-nodes-search-object'
    | 'similarity-nodes-search-object'
    | 'path-search-object'
    | 'nodes-search-object';
};
