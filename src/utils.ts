import type {
  RelationStat,
  OptionType,
  Entity,
  QueryItem,
  ComposeQueryItem,
  APIs,
} from './typings';
import { filter, uniqBy, isEqual } from 'lodash';
import { Graph } from '@antv/g6';
import { COMPOSED_ENTITY_DELIMITER, Layout, GraphData } from './typings';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const getJwtAccessToken = (): string | null => {
  let jwtToken = null;
  // Check if the cookie exists
  if (document.cookie && document.cookie.includes('jwt_access_token=')) {
    // Retrieve the cookie value
    // @ts-ignore
    jwtToken = document.cookie
      .split('; ')
      .find((row) => row.startsWith('jwt_access_token='))
      .split('=')[1];
  }

  if (jwtToken) {
    console.log('JWT access token found in the cookie.');
    return jwtToken;
  } else {
    console.log('JWT access token not found in the cookie.');
    return null;
  }
};

export const getIdentity = async () => {
  const jwtAccessToken = getJwtAccessToken();

  if (jwtAccessToken) {
    // Don't set a identity and let the backend get identity from an access key.
    return null;
  } else {
    let visitorId = localStorage.getItem('rapex-visitor-id');

    if (!visitorId) {
      const fpPromise = FingerprintJS.load();
      // Get the visitor identifier when you need it.
      const fp = await fpPromise;
      const result = await fp.get();

      visitorId = result.visitorId;
    }

    return visitorId;
  }
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
  if (!edgeStat || edgeStat.length === 0) {
    return [];
  }
  let o: OptionType[] = [];
  const maxDigits = getMaxDigits(edgeStat.map((element: RelationStat) => element.relation_count));

  // TODO: It might have several resources for the same relation type. So we need to group them. But whether we have fixed this issue completely?
  const grouped: { [key: string]: RelationStat & { resources: string[] } } = {};
  edgeStat.forEach((element) => {
    const key = `${element.relation_type}-${element.start_entity_type}-${element.end_entity_type}`;

    if (!grouped[key]) {
      grouped[key] = {
        id: element.id,
        description: element.description,
        relation_count: element.relation_count,
        // Only for compatibility with the data type, it is not used.
        resource: element.resource,
        resources: [element.resource],
        relation_type: element.relation_type,
        start_entity_type: element.start_entity_type,
        end_entity_type: element.end_entity_type,
      };
    } else {
      grouped[key].relation_count += element.relation_count;
      grouped[key].resources.push(element.resource);
    }
  });

  const groupedEdgeStat: RelationStat[] = Object.values(grouped).map((group) => ({
    id: group.id,
    description: group.description,
    relation_count: group.relation_count,
    resource: group.resources.join('|'),
    relation_type: group.relation_type,
    start_entity_type: group.start_entity_type,
    end_entity_type: group.end_entity_type,
  }));

  groupedEdgeStat.forEach((element: RelationStat) => {
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
      description: element.description || 'No description available.',
    });
  });

  console.log('makeRelationTypes', o, edgeStat, groupedEdgeStat);
  return uniqBy(o, 'value').sort((a: any, b: any) => b.order - a.order);
};

// **************************************************************
// Prepare the list of entities.
export function makeQueryEntityStr(params: Partial<Entity>, order?: string[]): string {
  let query: ComposeQueryItem = {} as ComposeQueryItem;

  let label_query_item = {} as QueryItem;
  if (params.label) {
    label_query_item = {
      operator: '=',
      field: 'label',
      value: params.label,
    };
  }

  let filteredKeys = filter(Object.keys(params), (key) => key !== 'label');
  if (filteredKeys.length > 1) {
    query = {
      operator: 'or',
      items: [],
    };

    if (order) {
      // Order and filter the keys.
      filteredKeys = order.filter((key) => filteredKeys.includes(key));
    }
  } else {
    query = {
      operator: 'and',
      items: [],
    };
  }

  query['items'] = filteredKeys.map((key) => {
    return {
      operator: 'ilike',
      field: key,
      value: `%${params[key as keyof Entity]}%`,
    };
  });

  if (label_query_item.field) {
    if (query['operator'] === 'and') {
      query['items'].push(label_query_item);
    } else {
      query = {
        operator: 'and',
        items: [query, label_query_item],
      };
    }
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
  // We might not get good results when the value is short than 3 characters.
  if (value.length < 3) {
    callback([]);
    return;
  }

  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }

  // TODO: Check if the value is a valid id.

  let queryMap = {};
  let order: string[] = [];
  // If the value is a number, then maybe it is an id or xref but not for name or synonyms.
  if (value && !isNaN(Number(value))) {
    queryMap = { id: value, xrefs: value, label: entityType };
    order = ['id', 'xrefs'];
  } else {
    queryMap = { name: value, synonyms: value, xrefs: value, id: value, label: entityType };
    order = ['name', 'synonyms', 'xrefs', 'id'];
  }

  const fetchData = () => {
    getEntities({
      query_str: makeQueryEntityStr(queryMap, order),
      page: 1,
      page_size: 50,
    })
      .then((response) => {
        const { records } = response;
        const options: OptionType[] = records.map((item: Entity, index: number) => ({
          order: index,
          value: item['id'],
          label: `${item['id']} | ${item['name']}`,
          description: item['description'],
          metadata: item,
        }));
        console.log('getLabels results: ', options);
        callback(options);
      })
      .catch((error) => {
        console.log('requestNodes Error: ', error);
        callback([]);
      });
  };

  timeout = setTimeout(fetchData, 300);
};

export const prepareGraphData = (
  graph: Graph,
): {
  data: GraphData;
  layout: Layout;
} => {
  const data = {
    nodes: graph.getNodes().map((node: any) => {
      const n = node.getModel();
      return {
        ...n,
        style: n._initialStyle,
        _initialStyle: n.style,
      };
    }),
    edges: graph.getEdges().map((edge: any) => {
      const e = edge.getModel();
      return {
        ...e,
        style: e._initialStyle,
        _initialStyle: e.style,
      };
    }),
  };

  return {
    data: data,
    layout: {
      width: graph.getWidth(),
      height: graph.getHeight(),
      // @ts-ignore
      matrix: graph.cfg.group.getMatrix(),
    },
  };
};

export const guessLink = (value: string | number | boolean | undefined) => {
  if (!value) {
    return '';
  }

  let v = `${value}`;
  if (v.startsWith('ENTREZ')) {
    // return `https://www.ncbi.nlm.nih.gov/gene/${v.split(':')[1]}`;
    return `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${v.split(':')[1]}`;
  } else if (v.startsWith('DrugBank')) {
    return `https://go.drugbank.com/drugs/${v.split(':')[1]}`;
  } else if (v.startsWith('KEGG')) {
    // https://www.genome.jp/entry/pathway+hsa00010
    return `https://www.genome.jp/entry/pathway+${v.split(':')[1]}`;
  } else if (v.startsWith('WikiPathways')) {
    // https://www.wikipathways.org/pathways/WP3673.html
    return `https://www.wikipathways.org/pathways/${v.split(':')[1]}.html`;
  } else if (v.startsWith('MESH')) {
    // e.g. https://bioportal.bioontology.org/ontologies/MESH/?p=classes&conceptid=D000602
    return `https://bioportal.bioontology.org/ontologies/MESH?p=classes&conceptid=${
      v.split(':')[1]
    }`;
  } else if (v.startsWith('Reactome')) {
    // https://reactome.org/content/detail/R-HSA-70326
    return `https://reactome.org/content/detail/${v.split(':')[1]}`;
  } else if (v.startsWith('MONDO')) {
    // https://bioportal.bioontology.org/ontologies/MONDO/?p=classes&conceptid=MONDO:0000001
    return `https://bioportal.bioontology.org/ontologies/MONDO?p=classes&conceptid=${v}`;
  } else if (v.startsWith('DOID')) {
    // https://bioportal.bioontology.org/ontologies/DOID/?p=classes&conceptid=DOID:9351
    return `https://bioportal.bioontology.org/ontologies/DOID?p=classes&conceptid=${v}`;
  } else if (v.startsWith('HP')) {
    // https://bioportal.bioontology.org/ontologies/HP/?p=classes&conceptid=HP:0000001
    return `https://bioportal.bioontology.org/ontologies/HP?p=classes&conceptid=${v}`;
  } else if (v.startsWith('GO')) {
    // https://bioportal.bioontology.org/ontologies/GO/?p=classes&conceptid=GO:0008150
    return `https://bioportal.bioontology.org/ontologies/GO?p=classes&conceptid=${v}`;
  } else if (v.startsWith('SYMP')) {
    // https://bioportal.bioontology.org/ontologies/SYMP/?p=classes&conceptid=SYMP:0000462
    return `https://bioportal.bioontology.org/ontologies/SYMP?p=classes&conceptid=${v}`;
  } else if (v.startsWith('HMDB')) {
    // https://hmdb.ca/metabolites/HMDB00001
    return `https://hmdb.ca/metabolites/${v.split(':')[1]}`;
  } else if (v.startsWith('UBERON')) {
    // https://bioportal.bioontology.org/ontologies/UBERON/?p=classes&conceptid=http://purl.obolibrary.org/obo/UBERON_0002113
    return `https://bioportal.bioontology.org/ontologies/UBERON?p=classes&conceptid=http://purl.obolibrary.org/obo/UBERON_${
      v.split(':')[1]
    }`;
  }
};

export const guessSpecies = (value: string | number | undefined) => {
  if (!value) {
    return '';
  }

  let v: string = `${value}`;
  if (typeof value === 'number') {
    v = value.toFixed(0).toString();
  }

  const speciesMap: Record<string, string> = {
    '9606': 'Human',
    '10090': 'Mouse',
    '10116': 'Rat',
    // TODO: Add more species.
  };

  return speciesMap[v] || '';
};
