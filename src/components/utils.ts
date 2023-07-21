import type {
  RelationStat,
  OptionType,
  Entity,
  QueryItem,
  ComposeQueryItem,
  APIs,
} from './typings';
import { COMPOSED_ENTITY_DELIMITER } from './typings';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getIdentity = async () => {
  let visitorId = localStorage.getItem('rapex-visitor-id');

  if (!visitorId) {
    const fpPromise = FingerprintJS.load();
    // Get the visitor identifier when you need it.
    const fp = await fpPromise;
    const result = await fp.get();

    visitorId = result.visitorId;
  }

  return visitorId;
};

export const formatNodeId = (entityId: string, entityType: string): string => {
  return `${entityType}${COMPOSED_ENTITY_DELIMITER}${entityId}`;
};

export const parseNodeId = (nodeId: string): { entityType: string; entityId: string } => {
  const [entityType, entityId] = nodeId.split(COMPOSED_ENTITY_DELIMITER);
  return {
    entityType,
    entityId,
  };
};

export const parseNodeIds = (nodeIds: string[]): { entityIds: string[]; entityTypes: string[] } => {
  const entityIds = [];
  const entityTypes = [];
  for (let i = 0; i < nodeIds.length; i++) {
    const { entityType, entityId } = parseNodeId(nodeIds[i]);
    entityIds.push(entityId);
    entityTypes.push(entityType);
  }

  return {
    entityIds,
    entityTypes,
  };
};

export const formatNodeIds = (entityIds: string[], entityTypes: string[]): string[] => {
  const nodeIds = [];
  for (let i = 0; i < entityIds.length; i++) {
    nodeIds.push(formatNodeId(entityIds[i], entityTypes[i]));
  }

  return nodeIds;
};

export const joinNodeIds = (
  entityIds: string[],
  entityTypes: string[],
  delemiter?: ',' | ';',
): string => {
  const nodeIds = formatNodeIds(entityIds, entityTypes);
  return nodeIds.join(delemiter || ',');
};

// Prepare the list of relation types.
export const getMaxDigits = (nums: number[]): number => {
  let max = 0;
  nums.forEach((element: number) => {
    let digits = element.toString().length;
    if (digits > max) {
      max = digits;
    }
  });

  return max;
};

export const getDefaultRelSep = () => {
  return '<>';
};

export const getRelationOption = (
  relationType: string,
  resource: string,
  sourceNodeType: string,
  targetNodeType: string,
) => {
  const sep = getDefaultRelSep();

  // Two formats of relationships are supported:
  // 1. Single field mode: bioarx::Covid2_acc_host_gene::Disease:Gene
  // 2. Multiple fields mode: relationshipType<>resource<>sourceNodeType<>targetNodeType
  if (relationType.indexOf('::') >= 0) {
    return relationType;
  } else {
    return [relationType, resource, sourceNodeType, targetNodeType].join(sep);
  }
};

export const makeRelationTypes = (edgeStat: RelationStat[]): OptionType[] => {
  let o: OptionType[] = [];
  const maxDigits = getMaxDigits(edgeStat.map((element: RelationStat) => element.relation_count));

  edgeStat.forEach((element: RelationStat) => {
    const relation_count = element.relation_count.toString().padStart(maxDigits, '0');
    const relationshipType = getRelationOption(
      element.relation_type,
      element.resource,
      element.start_entity_type,
      element.end_entity_type,
    );

    o.push({
      order: element.relation_count,
      label: `[${relation_count}] ${relationshipType}`,
      value: relationshipType,
    });
  });

  console.log('makeRelationTypes', o, edgeStat);
  return o.sort((a: any, b: any) => a.order - b.order);
};

// **************************************************************
// Prepare the list of entities.
export function makeQueryEntityStr(params: Partial<Entity>): string {
  let query: ComposeQueryItem = {} as ComposeQueryItem;

  let id_query_item = {} as QueryItem;
  if (params.id) {
    id_query_item = {
      operator: 'ilike',
      field: 'id',
      value: `%${params.id}%`,
    };
  }

  let name_query_item = {} as QueryItem;
  if (params.name) {
    name_query_item = {
      operator: 'ilike',
      field: 'name',
      value: `%${params.name}%`,
    };
  }

  let label_query_item = {} as QueryItem;
  if (params.label) {
    label_query_item = {
      operator: '=',
      field: 'label',
      value: params.label,
    };
  }

  if (id_query_item && name_query_item) {
    query = {
      operator: 'or',
      items: [id_query_item, name_query_item],
    };
  } else if (id_query_item) {
    query = {
      operator: 'and',
      items: [id_query_item],
    };
  } else if (name_query_item) {
    query = {
      operator: 'and',
      items: [name_query_item],
    };
  }

  if (query.operator == 'or') {
    query = {
      operator: 'and',
      items: [query, label_query_item],
    };
  } else {
    query = {
      operator: 'and',
      items: [...query.items, label_query_item],
    };
  }

  return JSON.stringify(query);
}

let timeout: ReturnType<typeof setTimeout> | null;

// This function is used to fetch the entities of the selected entity type.
// All the nodes will be added to the options as a dropdown list.
export const fetchNodes = async (
  getEntities: APIs['GetEntitiesFn'],
  entityType: string,
  value: string,
  callback: (any: any) => void,
) => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  const fetchData = () => {
    getEntities({
      query_str: makeQueryEntityStr({ id: value, name: value, label: entityType }),
      page: 1,
      page_size: 50,
    })
      .then((response) => {
        const { records } = response;
        const formatedData = records.map((item: any) => ({
          value: item['id'],
          text: `${item['id']} | ${item['name']}`,
        }));
        console.log('getLabels results: ', formatedData);
        // const options = formatedData.map(d => <Option key={d.value}>{d.text}</Option>);
        const options = formatedData.map((d) => {
          return { label: d.text, value: d.value };
        });
        callback(options);
      })
      .catch((error) => {
        console.log('requestNodes Error: ', error);
        callback([]);
      });
  };

  timeout = setTimeout(fetchData, 300);
};
