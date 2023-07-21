import type { TableColumnType } from 'antd';
import { filter, uniq } from 'lodash';
import { Graph } from '@antv/g6';
import { GraphNode, GraphEdge, COMPOSED_ENTITY_DELIMITER, Entity, Entity2D } from '../typings';
import voca from 'voca';

export const formatNodeIdFromEntity = (entity: Entity) => {
  return `${entity.label}${COMPOSED_ENTITY_DELIMITER}${entity.id}`;
};

export const formatNodeIdFromEntity2D = (entity: Entity2D) => {
  return `${entity.entity_type}${COMPOSED_ENTITY_DELIMITER}${entity.entity_id}`;
};

export const formatNodeIdFromGraphNode = (node: GraphNode) => {
  return `${node.data.label}${COMPOSED_ENTITY_DELIMITER}${node.data.id}`;
};

export const processEdges = (edges: GraphEdge[], options: any): GraphEdge[] => {
  const edgeMap: Map<string, GraphEdge[]> = new Map();
  edges.forEach((edge) => {
    const { source, target } = edge;
    const id = `${source}-${target}`;
    if (edgeMap.has(id)) {
      const objs = edgeMap.get(id);
      if (objs) {
        edgeMap.set(id, [...objs, edge]);
      }
    } else {
      edgeMap.set(id, [edge]);
    }
  });

  const newEdges: GraphEdge[] = [];
  edgeMap.forEach((value, key) => {
    if (value.length > 1) {
      const [firstEdge] = value;
      const { source, target, ...others } = firstEdge;
      const reltypes = value.map((edge: GraphEdge) => edge.reltype);
      newEdges.push({
        source,
        target,
        ...others,
        reltype: reltypes.join('|'),
        relid: `MultipleLabels-${source}-${target}`,
        style: {
          ...others.style,
          label: {
            value: 'MultipleLabels',
          },
        },
        data: {
          ...others.data,
          identity: `MultipleLabels-${source}-${target}`,
          reltypes: reltypes,
        },
      });
    } else {
      newEdges.push(value[0]);
    }
  });

  return newEdges;
};

export const makeColumns = (dataSource: Array<Record<string, any>>, blackList: Array<string>) => {
  let keys: Array<string> = [];
  dataSource.map((item) => {
    keys = keys.concat(Object.keys(item));
  });

  let columns: TableColumnType<any>[] = [];
  const uniqKeys = uniq(keys);
  const filteredUniqKeys = filter(uniqKeys, (key) => {
    return blackList.indexOf(key) < 0;
  });
  filteredUniqKeys.map((item) => {
    columns.push({
      title: voca.titleCase(item),
      key: item,
      dataIndex: item,
      align: 'center',
      ellipsis: true,
    });
  });

  return columns;
};

export const makeDataSources = (dataSource: Array<Record<string, any>>) => {
  return dataSource.map((item) => {
    return makeDataSource(item);
  });
};

export const removeComplexData = (dataItem: Record<string, any>, blackList?: Array<string>) => {
  const newObj: any = {};
  const keys = Object.keys(dataItem);
  const filteredKeys = filter(keys, (key) => {
    if (blackList) {
      return blackList.indexOf(key) < 0;
    } else {
      return true;
    }
  });
  filteredKeys.forEach((key) => {
    if (['string', 'number', 'boolean'].indexOf(typeof dataItem[key]) >= 0) {
      newObj[key] = dataItem[key];
    }
  });

  return newObj;
};

export const makeDataSource = (dataItem: Record<string, any>, blackList?: Array<string>) => {
  if (dataItem.data) {
    return {
      ...removeComplexData(dataItem.data, blackList),
      ...removeComplexData(dataItem, blackList),
    };
  } else {
    return removeComplexData(dataItem);
  }
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
  if (relationType.indexOf(COMPOSED_ENTITY_DELIMITER) >= 0) {
    return relationType;
  } else {
    return [relationType, resource, sourceNodeType, targetNodeType].join(sep);
  }
};

export const defaultLayout = {
  type: 'grid',
};

// TODO: The platform cannot stop the layout animation, then we cannot update the layout
// So we need to use the auto layout before we can fix this issue
export const legacyDefaultLayout = {
  type: 'graphin-force',
  workerEnabled: false, // 可选，开启 web-worker
  gpuEnabled: false, // 可选，开启 GPU 并行计算，G6 4.0 支持
  animation: true,
  preset: {
    type: 'force', // 力导的前置布局
  },
  clustering: true,
  leafCluster: true,
  preventOverlap: true,
  nodeClusterBy: 'cluster', // 节点聚类的映射字段
  clusterNodeStrength: 40, // 节点聚类作用力
  minNodeSpacing: 20,
  nodeSize: 40,
  // @ts-ignore
  defSpringLen: (_edge, source, target) => {
    const nodeSize = 40;
    const Sdegree = source.data.layout?.degree;
    const Tdegree = target.data.layout?.degree;
    const minDegree = Math.min(Sdegree, Tdegree);
    return minDegree === 1 ? nodeSize * 4 : Math.min(minDegree * nodeSize * 1.5, 200);
  },
  getId: function getId(d: any) {
    return d.id;
  },
  getHeight: function getHeight() {
    return 16;
  },
  getWidth: function getWidth() {
    return 16;
  },
  getVGap: function getVGap() {
    return 80;
  },
  getHGap: function getHGap() {
    return 50;
  },
};

// Mode details on https://antv-g6.gitee.io/en/examples/net/radialLayout#sortRadial
export const layouts = [
  {
    type: 'preset',
  },
  {
    type: 'auto',
  },
  {
    ...legacyDefaultLayout,
  },
  {
    type: 'force',
    workerEnabled: false, // 可选，开启 web-worker
    gpuEnabled: false, // 可选，开启 GPU 并行计算，G6 4.0 支持
    animation: true,
    preset: {
      type: 'grid', // 力导的前置布局
    },
    clustering: true,
    leafCluster: true,
    preventOverlap: true,
    clusterAttr: 'cluster',
    nodeClusterBy: 'cluster', // 节点聚类的映射字段
    clusterNodeStrength: 40, // 节点聚类作用力
    minNodeSpacing: 20,
    nodeSize: 40,
    // @ts-ignore
    defSpringLen: (_edge, source, target) => {
      const nodeSize = 40;
      const Sdegree = source.data.layout?.degree;
      const Tdegree = target.data.layout?.degree;
      const minDegree = Math.min(Sdegree, Tdegree);
      return minDegree === 1 ? nodeSize * 4 : Math.min(minDegree * nodeSize * 1.5, 200);
    },
    getId: function getId(d: any) {
      return d.id;
    },
    getHeight: function getHeight() {
      return 16;
    },
    getWidth: function getWidth() {
      return 16;
    },
    getVGap: function getVGap() {
      return 80;
    },
    getHGap: function getHGap() {
      return 50;
    },
  },
  {
    type: 'grid',
    begin: [0, 0], // 可选，
    preventOverlap: true, // 可选，必须配合 nodeSize
    preventOverlapPdding: 20, // 可选
    nodeSize: 30, // 可选
    condense: false, // 可选
    rows: 5, // 可选
    cols: 5, // 可选
    sortBy: 'degree', // 可选
    workerEnabled: false, // 可选，开启 web-worker
  },
  {
    type: 'radial',
    center: [200, 200], // 可选，默认为图的中心
    linkDistance: 80, // 可选，边长
    maxIteration: 1000, // 可选
    sortBy: 'degree', // 可选
    unitRadius: 150, // 可选
    preventOverlap: true, // 可选，必须配合 nodeSize
    nodeSize: 30, // 可选
    strictRadial: false, // 可选
    workerEnabled: false, // 可选，开启 web-worker
  },
  {
    type: 'concentric',
    center: [200, 200], // 可选，
    preventOverlap: true, // 可选，必须配合 nodeSize
    nodeSize: 30, // 可选
    sweep: 10, // 可选
    minNodeSpacing: 5, // 可选
    equidistant: true, // 可选
    startAngle: 0, // 可选
    clockwise: true, // 可选
    maxLevelDiff: 0.5, // 可选
    sortBy: 'degree',
    // TODO: Cannot enable worker when using concentric layout
    workerEnabled: false, // 可选，开启 web-worker
  },
];

export const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const getSelectedNodes = (graph?: Graph) => {
  if (!graph) {
    return [];
  }

  const selectedNodes = graph.getNodes().filter((node: any) => node.hasState('selected'));
  return selectedNodes.map((node: any) => node.getModel() as GraphNode);
};

export const getNodes = (graph?: Graph) => {
  if (!graph) {
    return [];
  }

  const nodes = graph.getNodes();
  return nodes.map((node: any) => node.getModel() as GraphNode);
};

export const prepareGraphData = (
  graph: Graph,
): {
  data: {
    nodes: any[];
    edges: any[];
  };
  layout: any;
  defaultLayout: any;
} => {
  const data = {
    nodes: graph.getNodes().map((node) => {
      const n = node.getModel();
      return {
        ...n,
        style: n._initialStyle,
        _initialStyle: n.style,
      };
    }),
    edges: graph.getEdges().map((edge) => {
      const e = edge.getModel();
      return {
        ...e,
        style: e._initialStyle,
        _initialStyle: e.style,
      };
    }),
  };

  const layout = graph.get('layout');

  return {
    data: data,
    layout: {
      type: 'preset',
    },
    defaultLayout: layout,
  };
};
