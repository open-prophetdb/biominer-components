/* eslint-disable no-undef */
import React, { useContext, useEffect, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { Row, Col, message, Button, Spin, Empty, Tooltip, Modal } from 'antd';
import {
  CloudDownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  SettingOutlined,
  CloudUploadOutlined,
  SettingFilled,
  ExclamationCircleOutlined,
  BuildFilled,
  BuildOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import Toolbar from '../Toolbar';
import { set, uniq, uniqBy } from 'lodash';
import GraphinWrapper from './GraphinWrapper';
import QueryBuilder from './QueryBuilder';
import AdvancedSearch from './AdvancedSearch';
import ExplanationPanel from './Components/ExplanationPanel';
import CanvasStatisticsChart from '../CanvasStatisticsChart';
import StatisticsChart from '../StatisticsChart';
import SimilarityChart from '../SimilarityChart';
import GraphTable from './Components/GraphTable';
import {
  makeDataSources,
  isUUID,
  getNodes,
  getSelectedNodes,
  processEdges,
  formatNodeIdFromEntity2D,
  formatNodeIdFromGraphNode,
  getEntityId,
  getEntityType,
  saveGraphDataToLocalStorage,
  loadGraphDataFromLocalStorage,
  clearGraphDataFromLocalStorage,
  saveLlmResponsesToLocalStorage,
  loadLlmResponsesFromLocalStorage,
  clearLlmResponsesFromLocalStorage,
} from './utils';
import { presetLayout, defaultLayout } from './utils';
import NodeInfoPanel from '../NodeInfoPanel';
import EdgeInfoPanel from '../EdgeInfoPanel';
import GraphStoreTable from '../GraphStoreTable';
import GraphStoreForm from '../GraphStoreForm';
import { GraphinContext, type Graph } from '@antv/graphin';
import type {
  GraphHistoryItem,
  GraphData,
  GraphEdge,
  EntityStat,
  RelationStat,
  GraphNode,
  SearchObjectInterface,
  Entity2D,
  MergeMode,
  Layout,
  LlmResponse,
  PromptItem,
} from '../typings';
import { EdgeInfo, NodeMenuItem, CanvasMenuItem, EdgeMenuItem } from './typings';
import Movable from '../Moveable';
// @ts-ignore
import GraphBackground from './graph-background.png';
import { KnowledgeGraphProps } from './index.t';
import type { StatisticsData } from '../StatisticsDataArea/index.t';
import { stat_total_node_count, stat_total_relation_count } from '../StatisticsChart/utils';
import { LinkedNodesSearchObjectClass } from '../LinkedNodesSearcher/index.t';
import { SimilarityNodesSearchObjectClass } from '../SimilarityNodesSearcher/index.t';
import { SharedNodesSearchObjectClass } from '../SharedNodesSearcher/index.t';
import { PathSearchObjectClass } from '../typings';
// @ts-ignore - It's simple, so we don't need to install a type definition for it.
import SparkMD5 from 'spark-md5';

import './index.less';
import { NodeAttribute } from '../NodeTable/index.t';
import { EdgeAttribute } from '../EdgeTable/index.t';

// Config message globally
message.config({
  duration: 2,
  maxCount: 3,
  getContainer: () => document.getElementById('knowledge-graph-container') || document.body,
});

const style = {
  // @ts-ignore
  backgroundImage: `url(${GraphBackground})`,
};

const genUniqueKey4Graph = (graph: GraphData): string => {
  // How to generate a md5 hash for the graph data?
  let nodeIds = graph.nodes.map((node) => node.id).sort();
  let edgeIds = graph.edges.map((edge) => edge.relid).sort();
  const graphDataString = JSON.stringify({ nodes: nodeIds, edges: edgeIds });
  const hash = SparkMD5.hash(graphDataString).toString();
  return hash;
};

const genUniqueKey4String = (str: string): string => {
  return SparkMD5.hash(str).toString();
};

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = (props) => {
  const [modal, contextHolder] = Modal.useModal();
  const [data, setData] = useState<GraphData>(
    props.data || {
      nodes: [],
      edges: [],
    },
  );

  const [nodeStat, setNodeStat] = useState<EntityStat[]>([]);
  const [edgeStat, setEdgeStat] = useState<RelationStat[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData>({} as StatisticsData);
  const [nodeColorMap, setNodeColorMap] = useState<Record<string, string>>({});

  const [nodeDataSources, setNodeDataSources] = useState<Array<Record<string, any>>>([]);
  const [edgeDataSources, setEdgeDataSources] = useState<Array<Record<string, any>>>([]);

  const [toolbarVisible, setToolbarVisible] = useState<boolean>(false);
  const [layoutSettingPanelVisible, setLayoutSettingPanelVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [nodeInfoPanelVisible, setNodeInfoPanelVisible] = useState<boolean>(false);

  const [clickedNode, setClickedNode] = useState<GraphNode | undefined>(undefined);
  const [edgeInfoPanelVisible, setEdgeInfoPanelVisible] = useState<boolean>(false);
  const [clickedEdge, setClickedEdge] = useState<EdgeInfo | undefined>(undefined);

  const [similarityChartVisible, setSimilarityChartVisible] = useState<boolean>(false);
  const [similarityArray, setSimilarityArray] = useState<Entity2D[]>([]);

  const [selectedNodeKeys, setSelectedNodeKeys] = useState<string[]>([]);
  const [selectedEdgeKeys, setSelectedEdgeKeys] = useState<string[]>([]);

  const [advancedSearchPanelActive, setAdvancedSearchPanelActive] = useState<boolean>(false);
  const [searchObject, setSearchObject] = useState<SearchObjectInterface>();

  // Graph store
  // Why we need a parentGraphUUID and a currentGraphUUID? Because the platform don't support multiple branches for each history chain. So we always use the latest graph as the parent graph, and the current graph is the graph that user is editing.
  const [parentGraphUUID, setParentGraphUUID] = useState<string>('New Graph');
  const [currentGraphUUID, setCurrentGraphUUID] = useState<string>('New Graph');
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [graphHistory, setGraphHistory] = useState<GraphHistoryItem[]>([]);
  const [graphStoreTableVisible, setGraphStoreTableVisible] = useState<boolean>(false);
  const [graphFormVisible, setGraphFormVisible] = useState<boolean>(false);
  const [graphFormPayload, setGraphFormPayload] = useState<Record<string, any>>({});
  const [graphTableVisible, setGraphTableVisible] = useState<boolean>(false);
  // Such as {subgraph: {uuid: {title: 'xxx', ...}, ...}, node: {uuid: {title: 'xxx', ...}, ...}, edge: {uuid: {title: 'xxx', ...}, ...}}
  const [llmResponse, setLlmResponse] = useState<
    Record<string, LlmResponse & { title: string }> | undefined
  >(undefined);
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [explanationPanelVisible, setExplanationPanelVisible] = useState<boolean>(false);
  const [layout, setLayout] = useState<Layout>(defaultLayout);

  // Annotate the relation type with the description
  const annotateEdge = (edge: GraphEdge, stat: RelationStat[]) => {
    let edgeStat = stat.find((item) => item.relation_type === edge.reltype);
    if (edgeStat) {
      edge.description = edgeStat.description || '';
    }

    return edge;
  };

  const checkAndSetData = (data: GraphData) => {
    const nodeIds = new Set(data.nodes.map((node) => node.id));
    const edges = data.edges
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
      .map((edge) => {
        return annotateEdge(edge, edgeStat);
      });

    setIsDirty(true);

    const newNodes = data.nodes;
    const newEdges = processEdges(edges, {});
    setData({
      nodes: newNodes,
      edges: newEdges,
    });
  };

  const onClearGraph = () => {
    setData({
      nodes: [],
      edges: [],
    });
    setNodeDataSources([]);
    setEdgeDataSources([]);
    setSearchObject(undefined);
    setParentGraphUUID('');
    setCurrentGraphUUID('');
    setIsDirty(false);
    clearGraphDataFromLocalStorage();
    clearLlmResponsesFromLocalStorage();
    setLlmResponse(undefined);
  };

  const updateGraphTable = (nodes: GraphNode[], edges: GraphEdge[]): void => {
    setNodeDataSources(makeDataSources(nodes));
    setEdgeDataSources(makeDataSources(edges));
  };

  useEffect(() => {
    updateGraphTable(data.nodes, data.edges);

    setStatistics({
      numNodes: data.nodes.length,
      numEdges: data.edges.length,
      numAllNodes: stat_total_node_count(nodeStat),
      numAllEdges: stat_total_relation_count(edgeStat),
      isDirty: isDirty,
      currentParentUUID: currentGraphUUID,
    });
  }, [data, edgeStat, nodeStat, currentGraphUUID]);

  useEffect(() => {
    if (llmResponse) {
      saveLlmResponsesToLocalStorage(llmResponse);
    }
  }, [llmResponse]);

  const loadGraphs = () => {
    props.apis
      .GetGraphHistoryFn({ page: 1, page_size: 100 })
      .then((response: any) => {
        setGraphHistory(response.records);
      })
      .catch((error: any) => {
        console.log(error);
        message.error('Failed to get graph histories, please check the network connection.');
      });
  };

  const getDimensions = (nodeIds: string[], nodeTypes: string[]): Promise<Entity2D[]> => {
    const makeAndQuery = (entityId: string, entityType: string) => {
      return {
        operator: 'and',
        items: [
          {
            operator: '=',
            field: 'entity_id',
            value: entityId,
          },
          {
            operator: '=',
            field: 'entity_type',
            value: entityType,
          },
        ],
      };
    };

    let query = {
      operator: 'or',
      items: nodeIds.map((nodeId, index) => makeAndQuery(nodeId, nodeTypes[index])),
    };

    return new Promise((resolve, reject) => {
      props.apis
        .GetEntity2DFn({
          query_str: JSON.stringify(query),
          page: 1,
          page_size: nodeIds.length,
        })
        .then((res) => {
          console.log('Get dimensions: ', res);
          const records = res.records.map((record) => {
            return {
              ...record,
              color: nodeColorMap[record.entity_type],
            };
          });
          resolve(records);
        })
        .catch((err) => {
          console.log('Error when getting dimensions: ', err);
          reject([]);
        });
    });
  };

  const loadGraph = (graphHistoryItem: GraphHistoryItem, latestChild: GraphHistoryItem) => {
    const payload = JSON.parse(graphHistoryItem.payload);
    if (payload) {
      setIsDirty(false);
      // Only support one level of graph hierarchy, so the parent graph is always the latest child graph.
      setParentGraphUUID(latestChild.id);
      setCurrentGraphUUID(graphHistoryItem.id);
      checkAndSetData(payload.data);
      setLayout(payload.layout || {});
      setToolbarVisible(payload.toolbarVisible);
      setLayoutSettingPanelVisible(false);
      setGraphStoreTableVisible(false);
    }
  };

  const onLoadGraph = (
    graphHistoryItem: GraphHistoryItem,
    latestChild: GraphHistoryItem,
  ): Promise<GraphHistoryItem> => {
    console.log('Load graph: ', graphHistoryItem, latestChild, isDirty);
    return new Promise((resolve, reject) => {
      if (isDirty) {
        modal.confirm({
          title: 'You have unsaved changes',
          icon: <ExclamationCircleOutlined />,
          content: 'Are you sure to load another graph?',
          okText: 'Load',
          cancelText: 'Cancel',
          onOk() {
            setIsDirty(false);
            loadGraph(graphHistoryItem, latestChild);
            return resolve(graphHistoryItem);
          },
          onCancel() {
            // TODO: anything else?
            return reject(graphHistoryItem);
          },
          getContainer: () => document.getElementById('knowledge-graph-container') || document.body,
        });
      } else {
        loadGraph(graphHistoryItem, latestChild);
        return resolve(graphHistoryItem);
      }
    });
  };

  const onDeleteGraph = (graphHistoryItem: GraphHistoryItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      console.log('Delete graph: ', graphHistoryItem);
      // TODO: add confirm dialog, it will delete the graph cascade.
      props.apis
        .DeleteGraphHistoryFn({ id: graphHistoryItem.id })
        .then((response) => {
          message.success('Graph deleted successfully.');
          loadGraphs();
          return resolve();
        })
        .catch((error) => {
          console.log(error);
          message.error('Failed to delete graph, please check the network connection.');
          return reject();
        });
    });
  };

  const loadNodeColorMap = () => {
    props.apis
      .GetEntityColorMapFn()
      .then((response) => {
        console.log('Entity Color Map: ', response);
        setNodeColorMap(response);
      })
      .catch((error) => {
        console.log(error);
        message.error('Failed to get entity color map, please check the network connection.');
      });
  };

  const loadPresetGraphData = () => {
    let parsedGraphData = loadGraphDataFromLocalStorage();
    console.log('Load Preset Graph Data: ', parsedGraphData, data, presetLayout);
    if (parsedGraphData) {
      // TODO: It seems that the graphin will be updated fully and cause the graph to be re-rendered, so we don't need to use uniqBy here?
      checkAndSetData({
        nodes: uniqBy([...data.nodes, ...parsedGraphData.nodes], 'id'),
        edges: uniqBy([...data.edges, ...parsedGraphData.edges], 'relid'),
      });

      setLayout(parsedGraphData.layout || {});
      setIsDirty(parsedGraphData.isDirty);

      if (parsedGraphData.currentUUID) {
        // TODO: currentUUID might be not a valid UUID, so we need to check it.
        setCurrentGraphUUID(parsedGraphData.currentUUID);
      }
    }
  };

  useEffect(() => {
    props.apis
      .GetStatisticsFn()
      .then((response) => {
        setNodeStat(response.entity_stat);
        setEdgeStat(response.relation_stat);
      })
      .catch((error) => {
        console.log(error);
        message.error('Failed to get statistics, please check the network connection.');
      });

    props.apis.GetPromptsFn &&
      props.apis
        .GetPromptsFn()
        .then((response) => {
          console.log('Get Prompts: ', response);
          setPrompts(response.records);
        })
        .catch((error) => {
          console.log('Get Prompts Error: ', error);
          message.error('Failed to get prompts, please check the network connection.');
        });

    loadGraphs();
    loadNodeColorMap();
    loadPresetGraphData();
    const d = loadLlmResponsesFromLocalStorage();
    if (d) {
      let uniqueKey = genUniqueKey4Graph(data);
      let filtered = Object.keys(d).filter((key) => key.endsWith(uniqueKey));
      let records: Record<string, LlmResponse & { title: string }> = {};
      filtered.forEach((key) => {
        records[key] = d[key];
      });
      // Find all responses related with the current graph
      setLlmResponse(records);
    }
  }, []);

  useEffect(() => {
    // You need to check if the data is empty, otherwise it will update on an unmounted component.
    if (advancedSearchPanelActive === false && searchObject) {
      setLoading(true);
      message.info('Loading data, please wait...');
      console.log('Search Object: ', searchObject);
      searchObject
        .process(props.apis)
        .then((response) => {
          console.log('Query Graph Response: ', response);
          if (searchObject.merge_mode == 'replace') {
            checkAndSetData(response);
          } else if (searchObject.merge_mode == 'append') {
            // TODO: It seems that the graphin will be updated fully and cause the graph to be re-rendered, so we don't need to use uniqBy here?
            checkAndSetData({
              nodes: uniqBy([...data.nodes, ...response.nodes], 'id'),
              edges: uniqBy([...data.edges, ...response.edges], 'relid'),
            });
          } else if (searchObject.merge_mode == 'subtract') {
            const { nodes, edges } = response;
            let nodesToRemove: string[] = nodes.map((node) => node.id);

            nodesToRemove = nodesToRemove.filter((node) => {
              // Remove nodes that have only one relationship and is in the nodesToRemove list
              const prediction = (rel: GraphEdge, node: string, reltypes: string[]) => {
                return (
                  (rel.target == node || rel.source == node) && reltypes.indexOf(rel.reltype) > -1
                );
              };

              // Get all relationships that meet the criteria, maybe it comes from user's input or query result
              const relation_types =
                searchObject.data.relation_types || edges.map((edge) => edge.reltype);
              const found = data.edges.filter((rel) => prediction(rel, node, relation_types));

              console.log('Found: ', found, node, relation_types);
              return found.length < 2;
            });

            // Remove nodes and relationships that meet the removal criteria
            const newNodes = data.nodes.filter((node) => !nodesToRemove.includes(node.id));
            const newRelationships = data.edges.filter(
              (rel) => !nodesToRemove.includes(rel.source) && !nodesToRemove.includes(rel.target),
            );

            const newData = {
              nodes: newNodes,
              edges: newRelationships,
            };

            console.log('New Data: ', newData, data, response, nodesToRemove);
            checkAndSetData(newData);
          } else {
            message.warning('Unknown merge mode, please retry later.');
          }
          message.success(
            `Find ${response.nodes.length} entities and ${response.edges.length} relationships.`,
          );
          setLoading(false);
          setSearchObject(undefined);
        })
        .catch((error) => {
          console.log('getNodes Error: ', error);
          message.warning('Unknown errors or Cannot find any entities & relationships.');
          setLoading(false);
          // We need to reset the search object to undefined, otherwise the search object will be kept in the state and be filled in the next search.
          setSearchObject(undefined);
        });
    } else {
      console.log(
        'Advanced Search Panel is active or search object is invalid: ',
        advancedSearchPanelActive,
        searchObject,
      );
    }
  }, [searchObject]);

  const enableAdvancedSearch = () => {
    setAdvancedSearchPanelActive(true);
  };

  const disableAdvancedSearch = () => {
    setAdvancedSearchPanelActive(false);
  };

  const updateSearchObject = (searchObject: SearchObjectInterface) => {
    console.log('Search Object: ', searchObject);
    disableAdvancedSearch();
    setSearchObject(searchObject);
  };

  const searchLinkedNodes = (
    entityType: string,
    entityId: string | undefined,
    mergeMode?: MergeMode,
    nsteps?: number,
    limit?: number,
  ) => {
    if (entityId) {
      let linkedNodesSearchObject = new LinkedNodesSearchObjectClass(
        {
          entity_type: entityType,
          entity_id: entityId,
          nsteps: nsteps || 1,
          limit: limit || 10,
        },
        mergeMode || 'append',
      );

      setSearchObject(linkedNodesSearchObject);
    }
  };

  const searchSimilarNodes = (
    entityType: string,
    entityId: string | undefined,
    relationType?: string,
    mergeMode?: MergeMode,
    topk?: number,
  ) => {
    if (entityId) {
      let similarNodesSearchObject = new SimilarityNodesSearchObjectClass(
        {
          entity_type: entityType,
          entity_id: entityId,
          relation_type: relationType || '',
          topk: topk || 10,
        },
        mergeMode || 'append',
      );

      setSearchObject(similarNodesSearchObject);
    }
  };

  const searchSharedNodes = (
    start_node: GraphNode,
    nodes: GraphNode[],
    nodeTypes: string[] | undefined,
    mergeMode?: MergeMode,
    topk?: number,
    nhops?: number,
  ) => {
    if (nodes && nodes.length > 1) {
      let sharedNodesSearchObject = new SharedNodesSearchObjectClass(
        {
          start_node_id: start_node.id,
          nodes: nodes,
          node_types: nodeTypes || [],
          topk: topk || 10,
          nhops: nhops || 1,
          nums_shared_by: nodes && nodes.length,
        },
        mergeMode || 'append',
      );

      setSearchObject(sharedNodesSearchObject);
    } else {
      message.warning('Please select at least two nodes to find shared nodes.');
    }
  };

  const fetchNStepsNodes = (
    sourceId: string,
    sourceType: string,
    targetId: string,
    targetType: string,
    nsteps?: number,
  ) => {
    if (sourceId && sourceType && targetId && targetType) {
      let pathSearchObject = new PathSearchObjectClass(
        {
          source_entity_id: sourceId,
          source_entity_type: sourceType,
          target_entity_id: targetId,
          target_entity_type: targetType,
          relation_types: [],
          nsteps: nsteps || 1,
        },
        'append',
      );

      setSearchObject(pathSearchObject);
    } else {
      message.warning('Please select two nodes to expand.');
    }
  };

  const onCanvasMenuClick = (menuItem: CanvasMenuItem, graph: any, apis: any) => {
    if (menuItem.key == 'auto-connect') {
      message.info('Auto connecting nodes, please wait...');
      setLoading(true);
      const nodes = graph.getNodes().map((node: any) => node.getModel() as GraphNode);
      const nodeIds = nodes.map((node: GraphNode) => formatNodeIdFromGraphNode(node));

      if (nodeIds.length == 0) {
        message.warning('Please load some nodes first.');
        setLoading(false);
        return;
      }

      props.apis
        .GetConnectedNodesFn({
          node_ids: nodeIds.join(','),
        })
        .then((response: GraphData) => {
          console.log('Auto Connect Response: ', response);
          // TODO: It seems that the graphin will be updated fully and cause the graph to be re-rendered, so we don't need to use uniqBy here?
          checkAndSetData({
            nodes: uniqBy([...data.nodes, ...response.nodes], 'id'),
            edges: uniqBy([...data.edges, ...response.edges], 'relid'),
          });

          if (response.nodes.length == 0 && response.edges.length == 0) {
            message.warning('No more relationships can be found.');
          } else {
            message.success(
              `Find ${response.nodes.length} entities and ${response.edges.length} relationships.`,
            );
          }
        })
        .catch((error: any) => {
          console.log('Auto Connect Error: ', error);
          message.warning('Something went wrong, please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (menuItem.key == 'clear-node-edge-status') {
      // We must clear the selected nodes and edges, otherwise it will cause the graph to highlight the nodes and edges and hide other nodes and edges.
      setSelectedNodeKeys([]);
      setSelectedEdgeKeys([]);
    }
  };

  const onEdgeMenuClick = (
    menuItem: EdgeMenuItem,
    source: GraphNode,
    target: GraphNode,
    edge: GraphEdge,
    graph: Graph,
    graphin: any,
  ) => {
    if (menuItem.key == 'what-is-the-relationship') {
      if (props.postMessage) {
        props.postMessage(
          `what is the relationship between ${source.data.name} and ${target.data.name}?`,
        );
      }
    } else if (menuItem.key == 'show-edge-details') {
      setEdgeInfoPanelVisible(true);
      setClickedEdge({
        startNode: source,
        endNode: target,
        edge: edge,
      });
      // TODO: Get edge details and show in the info panel
    } else if (menuItem.key == 'hide-current-edge') {
      const currentEdgeKey = edge.relid;
      let newSelectedEdgeKeys = [];
      if (selectedEdgeKeys.length == 0) {
        const allEdgeKeys = graph.getEdges().map((edge: any) => edge.getModel().relid);
        newSelectedEdgeKeys = allEdgeKeys.filter((key) => key != currentEdgeKey);
      } else {
        // Remove the current edge from the selectedEdgeKeys
        newSelectedEdgeKeys = selectedEdgeKeys.filter((key) => key != currentEdgeKey);
      }

      let allNodeKeys = graph.getNodes().map((node: any) => node.getModel().id);

      const uniqEdgeKeys = uniq(newSelectedEdgeKeys);
      const uniqNodeKeys = uniq(allNodeKeys);
      setSelectedEdgeKeys(uniqEdgeKeys);
      setSelectedNodeKeys(uniqNodeKeys);
    } else if (menuItem.key == 'hide-edges-with-same-type') {
      const currentEdgeType = edge.reltype;
      const relatedEdges = graph.getEdges().filter((edge: any) => {
        const model = edge.getModel();
        return model.reltype == currentEdgeType;
      });
      const relatedEdgeKeys = relatedEdges.map((edge: any) => edge.getModel().relid);

      // Remove the related edges from the edges that are not hidden, they might be all edges or some edges which are in selectedEdgeKeys variable.
      let newSelectedEdgeKeys = [];
      if (selectedEdgeKeys.length == 0) {
        const allEdgeKeys = graph.getEdges().map((edge: any) => edge.getModel().relid);
        newSelectedEdgeKeys = allEdgeKeys.filter((key) => !relatedEdgeKeys.includes(key));
      } else {
        newSelectedEdgeKeys = selectedEdgeKeys.filter((key) => !relatedEdgeKeys.includes(key));
      }

      let allNodeKeys = graph.getNodes().map((node: any) => node.getModel().id);

      const uniqEdgeKeys = uniq(newSelectedEdgeKeys);
      const uniqNodeKeys = uniq(allNodeKeys);
      setSelectedEdgeKeys(uniqEdgeKeys);
      setSelectedNodeKeys(uniqNodeKeys);
    } else if (menuItem.key.match(/explain_edge_.*/)) {
      const expandedRelation = {
        source: {
          ...source.data,
          idx: Math.random() * 1000000,
        },
        target: {
          ...target.data,
          idx: Math.random() * 1000000,
        },
        relation: {
          ...edge.data,
          id: Math.random() * 1000000,
        },
      };

      console.log('Explain Edge: ', menuItem, expandedRelation, edge.relid);
      if (props.apis.AskLlmFn) {
        message.info("Explaining the edge, please wait a moment...(Don't leave this page)", 5);
        setLoading(true);
        props.apis
          .AskLlmFn({ prompt_template_id: menuItem.key }, { expanded_relation: expandedRelation })
          .then((response) => {
            console.log('AskLlmFn Response: ', response);
            let record: Record<string, LlmResponse & { title: string }> = {
              [`${edge.relid}`]: {
                ...response,
                title: `Edge - ${edge.relid}`,
              },
            };
            setLlmResponse({
              ...llmResponse,
              ...record,
            });
            setExplanationPanelVisible(true);
            setLoading(false);
          })
          .catch((error) => {
            console.log('AskLlmFn Error: ', error);
            message.warning('The AskLlm function encounter an error, please try again later.', 5);
            setLoading(false);
          });
      }
    }
  };

  const onNodeMenuClick = (menuItem: NodeMenuItem, node: GraphNode, graph: Graph, graphin: any) => {
    console.log(`onNodeMenuClick [${menuItem.key}]: `, menuItem, node);
    if (menuItem.key == 'delete-nodes') {
      const nodes = getSelectedNodes(graph);
      const ids = [...nodes.map((node) => node.id)];
      if (nodes.length == 0) {
        message.info('Please select one or more nodes to delete.');
        return;
      } else {
        message.info(`Deleting ${nodes.length} nodes, please wait...`);
        const newNodes = data.nodes.filter((node) => !ids.includes(node.id));
        const newEdges = data.edges.filter(
          (edge) => !ids.includes(edge.source) && !ids.includes(edge.target),
        );

        nodes.forEach((node) => {
          graph.removeItem(node.id, false);
        });

        checkAndSetData({
          nodes: newNodes,
          edges: newEdges,
        });
        updateGraphTable(newNodes, newEdges);
      }
    } else if (menuItem.key == 'expand-one-step') {
      enableAdvancedSearch();
      searchLinkedNodes(node.data.label, node.data.id, 'append', 1, 10);
    } else if (menuItem.key == 'find-similar-nodes') {
      enableAdvancedSearch();
      searchSimilarNodes(node.data.label, node.data.id, undefined, 'append', 10);
    } else if (menuItem.key == 'find-shared-nodes') {
      const nodes = getSelectedNodes(graph);
      if (nodes && nodes.length >= 1) {
        enableAdvancedSearch();
        searchSharedNodes(node, nodes, undefined, 'append', 10, 1);
      } else {
        message.warning('Please select at least one node to find shared nodes.');
      }
    } else if (
      ['expand-all-paths-1', 'expand-all-paths-2', 'expand-all-paths-3'].includes(menuItem.key)
    ) {
      // TODO: How to connect two nodes within n steps?
      console.log('Expand All Paths: ', menuItem.key);
      const selectedNodes = getSelectedNodes(graph);
      if (selectedNodes.length !== 2) {
        message.info(
          'Please select two nodes to expand, and only two nodes are allowed. If you want to expand more nodes, please use the "Find Shared Nodes" / "Auto Connect" function instead.',
        );
        return;
      } else {
        const sourceType = getEntityType(selectedNodes[0]);
        const sourceId = getEntityId(selectedNodes[0]);
        const targetType = getEntityType(selectedNodes[1]);
        const targetId = getEntityId(selectedNodes[1]);
        const nsteps = Number(menuItem.key.split('-').pop());
        fetchNStepsNodes(sourceId, sourceType, targetId, targetType, nsteps);
      }
    } else if (menuItem.key == 'expand-selected-nodes') {
      // TODO: Do we need to expand all selected nodes?
      // const nodes = getSelectedNodes(graph);
      // // If no nodes are selected, use the right clicked node
      // if (nodes.length == 0 && node) {
      //   nodes.push(node);
      // }
      // enableAdvancedSearch();
      // setSearchObject({
      //   nodes: nodes,
      //   merge_mode: 'append',
      //   mode: 'batchNodes',
      //   node_id: '',
      //   node_type: '',
      // });
    } else if (menuItem.key == 'what-is-the-node') {
      if (props.postMessage) {
        props.postMessage(`what is the ${node.data.name}?`);
      }
    } else if (menuItem.key.match(/explain_node_.*/)) {
      const entity = node.data;
      console.log('Explain Node: ', menuItem, entity, node.data.label, node.data.id);

      if (props.apis.AskLlmFn) {
        message.info("Explaining the node, please wait a moment...(Don't leave this page)", 5);
        setLoading(true);
        props.apis
          .AskLlmFn({ prompt_template_id: menuItem.key }, { entity: entity })
          .then((response) => {
            console.log('AskLlmFn Response: ', response);
            const uniqueKey = genUniqueKey4String(`${entity.name}_${entity.id}`);
            let record: Record<string, LlmResponse & { title: string }> = {
              [`node_${uniqueKey}`]: {
                ...response,
                title: `Node - ${entity.name}`,
              },
            };
            setLlmResponse({
              ...llmResponse,
              ...record,
            });
            setExplanationPanelVisible(true);
            setLoading(false);
          })
          .catch((error) => {
            console.log('AskLlmFn Error: ', error);
            message.warning('The AskLlm function encounter an error, please try again later.', 5);
            setLoading(false);
          });
      }
    } else if (menuItem.key.match(/explain_subgraph_.*$/)) {
      // explain-subgraph menu
      const cleanData = (data: GraphData) => {
        return {
          nodes: data.nodes.map((node) => {
            return {
              id: node.id,
              name: node.data.name,
              label: node.data.label,
              description: node.data.description,
              xrefs: node.data.xrefs || '',
              synonyms: node.data.synonyms || '',
            };
          }),
          edges: data.edges.map((edge) => {
            return {
              source: edge.source,
              target: edge.target,
              reltype: edge.reltype,
              reltype_desc: edge.description || '',
              key_sentence: edge.data.key_sentence || '',
              score: edge.data.score || 0,
              resource: edge.data.resource || '',
            };
          }),
        };
      };
      const nodeLabel = node.data.label;
      if (nodeLabel === 'Disease') {
        const diseaseName = node.data.name;
        const subgraph = JSON.stringify(cleanData(data));
        console.log('Explain Subgraph: ', diseaseName, subgraph, menuItem.key);

        if (props.apis.AskLlmFn) {
          message.info(
            "Explaining the subgraph, please wait a moment...(Don't leave this page)",
            5,
          );
          setLoading(true);
          props.apis
            .AskLlmFn(
              { prompt_template_id: menuItem.key },
              {
                subgraph_with_disease_ctx: {
                  disease_name: diseaseName,
                  subgraph: subgraph,
                },
              },
            )
            .then((response) => {
              console.log('AskLlmFn Response: ', response);
              // Get the unique key for the current graph
              let uniqueKey = genUniqueKey4Graph(data);
              let record: Record<string, LlmResponse & { title: string }> = {
                [`subgraph_${uniqueKey}`]: {
                  ...response,
                  title: `Subgraph - ${diseaseName}`,
                },
              };
              setLlmResponse({
                ...llmResponse,
                ...record,
              });
              setExplanationPanelVisible(true);
              setLoading(false);
            })
            .catch((error) => {
              console.log('AskLlmFn Error: ', error);
              message.warning('The AskLlm function encounter an error, please try again later.', 5);
              setLoading(false);
            });
        } else {
          message.warning('The admin has not enabled the AskLlm function.', 5);
        }
      } else {
        message.warning(
          'Only the disease are supported to choose as a context node for explaining the subgraph now.',
        );
      }
    } else if (menuItem.key == 'predict-relationships') {
      // TODO: How to predict relationship between two nodes?
      // const sourceId = `${node.data.label}::${node.data.id}`;
      // const selectedNodes = getSelectedNodes(graph);
      // let targetIds = selectedNodes.map((node) => `${node.data.label}::${node.data.id}`);
      // targetIds = targetIds.filter((id) => id != sourceId);
      // console.log('Predict Relationships: ', menuItem, sourceId, targetIds, selectedNodes);
      // predictRelationships(sourceId, targetIds)
      //   .then((response: GraphData) => {
      //     console.log('Predict Relationships Response: ', response);
      //     if (response.nodes.length == 0 && response.edges.length == 0) {
      //       message.warning('No more relationships can be found.');
      //     } else {
      //       checkAndSetData({
      //         nodes: uniqBy([...data.nodes, ...response.nodes], 'id'),
      //         edges: uniqBy([...data.edges, ...response.edges], 'relid'),
      //       });
      //     }
      //   })
      //   .catch((error: any) => {
      //     console.log('Predict Relationships Error: ', error);
      //     message.warning('Something went wrong, please try again later.');
      //   });
    } else if (menuItem.key == 'visulize-similarities') {
      const nodes = getNodes(graph);
      const nodeIds = nodes.map((node) => node.data.id);
      const nodeTypes = nodes.map((node) => node.data.label);
      setLoading(true);
      getDimensions(nodeIds, nodeTypes)
        .then((response: Entity2D[]) => {
          console.log('Get Dimensions Response: ', response, nodeIds, nodeTypes);
          setSimilarityArray(response);
          setSimilarityChartVisible(true);
          setLoading(false);
        })
        .catch((error: any) => {
          console.log('Get Dimensions Error: ', error);
          setSimilarityArray([]);
          setSimilarityChartVisible(false);
          message.error('Failed to get similarities, please check the network connection.');
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (menuItem.key == 'show-node-details') {
      setNodeInfoPanelVisible(true);
      setClickedNode(node);
      // TODO: Get node details and show in the info panel
    } else if (menuItem.key == 'hide-selected-nodes') {
      let relatedNodes = getSelectedNodes(graph);
      // The current node might not be selected, so we need to add it to the selectedNodes list
      relatedNodes.push(node);
      const relatedNodeKeys = relatedNodes.map((node) => node.id);
      const relatedEdges = graph.getEdges().filter((edge: any) => {
        const model = edge.getModel();
        const nodeIds = relatedNodes.map((node) => node.id);
        return nodeIds.includes(model.source) || nodeIds.includes(model.target);
      });
      const relatedEdgeKeys = relatedEdges.map((edge: any) => edge.getModel().relid);

      // The relatedEdges and relatedNodes are going to be hidden, so we need to remove them from the selectedNodeKeys and selectedEdgeKeys
      // Remove the related edges from the edges that are not hidden, they might be all edges or some edges which are in selectedEdgeKeys variable.
      let newSelectedEdgeKeys = [];
      if (selectedEdgeKeys.length == 0) {
        const allEdgeKeys = graph.getEdges().map((edge: any) => edge.getModel().relid);
        newSelectedEdgeKeys = allEdgeKeys.filter((key) => !relatedEdgeKeys.includes(key));
      } else {
        newSelectedEdgeKeys = selectedEdgeKeys.filter((key) => !relatedEdgeKeys.includes(key));
      }

      // Remove the related nodes from the nodes that are not hidden, they might be all nodes or some nodes which are in selectedNodeKeys variable.
      let newSelectedNodeKeys = [];
      if (selectedNodeKeys.length == 0) {
        const allNodeKeys = graph.getNodes().map((node: any) => node.getModel().id);
        newSelectedNodeKeys = allNodeKeys.filter((key) => !relatedNodeKeys.includes(key));
      } else {
        newSelectedNodeKeys = selectedNodeKeys.filter((key) => !relatedNodeKeys.includes(key));
      }

      const uniqNodeKeys = uniq(newSelectedNodeKeys);
      const uniqEdgeKeys = uniq(newSelectedEdgeKeys);
      setSelectedNodeKeys(uniqNodeKeys);
      setSelectedEdgeKeys(uniqEdgeKeys);
    }
  };

  const saveGraphData = () => {
    setGraphFormVisible(true);
    // TODO: Can we save the position of all nodes and edges and more configurations?
    setGraphFormPayload({
      data: data,
      toolbarVisible: toolbarVisible,
      isDirty: isDirty,
      currentUUID: currentGraphUUID,
    });
  };

  const onChangeToolbarVisible = () => {
    setToolbarVisible(!toolbarVisible);
  };

  const onChangeLayoutSettingsPanelVisible = () => {
    setLayoutSettingPanelVisible(!layoutSettingPanelVisible);
  };

  const onClickNode = (nodeId: string, node: GraphNode): void => {
    // TODO: Get node details and pass to InfoPanel
    console.log('Node Clicked: ', nodeId, data, node);
    if (node) {
      setNodeInfoPanelVisible(true);
      setClickedNode(node);
    }
  };

  const onClickEdge = (
    edgeId: string,
    startNode: GraphNode,
    endNode: GraphNode,
    edge: GraphEdge,
  ): void => {
    console.log('Edge Clicked: ', edgeId);
    if (edgeId) {
      setEdgeInfoPanelVisible(true);
      setClickedEdge({
        edge: edge,
        startNode: startNode,
        endNode: endNode,
      });
    }
  };

  const onCloseInfoPanel = () => {
    setEdgeInfoPanelVisible(false);
    setNodeInfoPanelVisible(false);
  };

  const enterFullScreenHandler = useFullScreenHandle();

  const onSubmitGraph = (data: GraphHistoryItem): Promise<GraphHistoryItem> => {
    return new Promise((resolve, reject) => {
      if (parentGraphUUID && isUUID(parentGraphUUID)) {
        data = { ...data, parent: parentGraphUUID };
      }

      // TODO: Remove the id field, because it will cause the backend to throw an error.
      // @ts-ignore
      delete data.id;

      props.apis
        .PostGraphHistoryFn(data)
        .then((response) => {
          message.success('Graph data saved.');
          loadGraphs();
          return resolve(response);
        })
        .catch((error) => {
          console.log('Post Graphs Error: ', error);
          message.error('Graph save failed.');
          return reject(error);
        });
    });
  };

  return (
    <FullScreen handle={enterFullScreenHandler}>
      <Row className="knowledge-graph-container" id="knowledge-graph-container">
        <Spin spinning={loading}>
          <Row className="left-toolbar">
            <Tooltip
              getTooltipContainer={(triggerNode) => {
                return triggerNode;
              }}
              title={graphTableVisible ? 'Hide Graph Table' : 'Show Graph Table'}
              placement="right"
            >
              <Button
                className="graph-table-button"
                onClick={() => {
                  setGraphTableVisible(!graphTableVisible);
                }}
                shape="circle"
                icon={graphTableVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
              />
            </Tooltip>
            <Tooltip
              getTooltipContainer={(triggerNode) => {
                return triggerNode;
              }}
              title={enterFullScreenHandler.active ? 'Exit Full Screen' : 'Enter Full Screen'}
              placement="right"
            >
              <Button
                className="full-screen-button"
                onClick={
                  enterFullScreenHandler.active
                    ? enterFullScreenHandler.exit
                    : enterFullScreenHandler.enter
                }
                shape="circle"
                icon={
                  enterFullScreenHandler.active ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )
                }
              />
            </Tooltip>
            <Tooltip
              title={toolbarVisible ? 'Hide Toolbar' : 'Show Toolbar'}
              getTooltipContainer={(triggerNode) => {
                return triggerNode;
              }}
              placement="right"
            >
              <Button
                className="toolbar-button"
                onClick={onChangeToolbarVisible}
                shape="circle"
                icon={toolbarVisible ? <SettingOutlined /> : <SettingFilled />}
              />
            </Tooltip>
            <Tooltip
              title={layoutSettingPanelVisible ? 'Hide Layout Settings' : 'Show Layout Settings'}
              getTooltipContainer={(triggerNode) => {
                return triggerNode;
              }}
              placement="right"
            >
              <Button
                className="layout-button"
                onClick={onChangeLayoutSettingsPanelVisible}
                shape="circle"
                icon={layoutSettingPanelVisible ? <BuildOutlined /> : <BuildFilled />}
              />
            </Tooltip>
            <Tooltip
              title="Save Graph Data"
              placement="right"
              getTooltipContainer={(triggerNode) => {
                return triggerNode;
              }}
            >
              <Button
                className="save-button"
                onClick={saveGraphData}
                shape="circle"
                icon={<CloudUploadOutlined />}
              />
            </Tooltip>
            <Tooltip
              title="Load Graph Data"
              placement="right"
              getTooltipContainer={(triggerNode) => {
                return triggerNode;
              }}
            >
              <Button
                className="clear-button"
                onClick={() => {
                  setGraphStoreTableVisible(true);
                }}
                shape="circle"
                icon={<CloudDownloadOutlined />}
              />
            </Tooltip>
            <Tooltip>
              <Button
                className="explain-button"
                onClick={() => {
                  if (explanationPanelVisible === false) {
                    if (llmResponse && Object.keys(llmResponse).length > 0) {
                      setExplanationPanelVisible(true);
                    } else {
                      message.warning(
                        'No explanation data available. If you want to generate an explanation, please right click on a disease node and select "Explain Subgraph" first, then click this button again.',
                        5,
                      );
                      setExplanationPanelVisible(false);
                    }
                  } else {
                    setEdgeInfoPanelVisible(false);
                  }
                }}
                shape="circle"
                icon={<InfoCircleOutlined />}
              />
            </Tooltip>
          </Row>
          <Row className="top-toolbar">
            <QueryBuilder
              onChange={searchLinkedNodes}
              onAdvancedSearch={enableAdvancedSearch}
              entityTypes={nodeStat.map((stat) => stat.entity_type)}
              getEntities={props.apis.GetEntitiesFn}
            ></QueryBuilder>
            <AdvancedSearch
              onOk={updateSearchObject}
              visible={advancedSearchPanelActive}
              onCancel={disableAdvancedSearch}
              entityTypes={nodeStat.map((stat) => stat.entity_type)}
              searchObject={searchObject}
              relationStat={edgeStat}
              key={searchObject?.get_current_node_id() || 'default'}
              parent={document.getElementById('knowledge-graph-container') as HTMLElement}
              apis={props.apis}
            ></AdvancedSearch>
          </Row>
          <Col className="graphin" style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GraphinWrapper
              layout={layout}
              prompts={prompts}
              onDataChanged={(graphData: GraphData, width: number, height: number, matrix: any) => {
                if (graphData) {
                  // Reset the initial data, otherwise the data will have not chance to be updated.
                  setData(graphData);
                }
              }}
              selectedNodes={selectedNodeKeys}
              selectedEdges={selectedEdgeKeys}
              changeSelectedEdges={(edges) => {
                setSelectedEdgeKeys(edges);
              }}
              changeSelectedNodes={(nodes) => {
                setSelectedNodeKeys(uniq(nodes));
              }}
              data={data}
              style={style}
              hideWhichPanel={(panelKey) => {
                if (panelKey == 'toolbar') {
                  setToolbarVisible(false);
                } else if (panelKey == 'layoutSettingPanel') {
                  setLayoutSettingPanelVisible(false);
                }
              }}
              queriedId={searchObject?.get_current_node_id() || ''}
              statistics={statistics}
              toolbarVisible={toolbarVisible}
              layoutSettingPanelVisible={layoutSettingPanelVisible}
              onClearGraph={onClearGraph}
              onEdgeMenuClick={onEdgeMenuClick}
              chatbotVisible={props.postMessage ? true : false}
              onClickNode={onClickNode}
              onClickEdge={onClickEdge}
              onCanvasMenuClick={onCanvasMenuClick}
              onNodeMenuClick={onNodeMenuClick}
            >
              <Toolbar
                position="top"
                width="300px"
                height="100%"
                closable={true}
                title="Statistics"
              >
                <StatisticsChart nodeStat={nodeStat} edgeStat={edgeStat}></StatisticsChart>
              </Toolbar>
              <Toolbar
                position="bottom"
                width="300px"
                height="60vh"
                title="Charts"
                closable={false}
              >
                <CanvasStatisticsChart data={data}></CanvasStatisticsChart>
              </Toolbar>
              <Toolbar
                position="right"
                width={'80%'}
                closable={false}
                maskVisible
                visible={nodeInfoPanelVisible}
                onClose={onCloseInfoPanel}
              >
                {clickedNode && props.getGeneInfo && props.getItems4GenePanel ? (
                  <NodeInfoPanel
                    node={clickedNode}
                    getGeneInfo={props.getGeneInfo}
                    getItems4GenePanel={props.getItems4GenePanel}
                  ></NodeInfoPanel>
                ) : (
                  <Empty description="No node selected" />
                )}
              </Toolbar>
              <Toolbar
                position="right"
                width={'80%'}
                closable={false}
                maskVisible
                visible={edgeInfoPanelVisible}
                onClose={onCloseInfoPanel}
              >
                {clickedEdge ? (
                  <EdgeInfoPanel edgeInfo={clickedEdge}></EdgeInfoPanel>
                ) : (
                  <Empty description="No edge selected" />
                )}
              </Toolbar>
              {graphTableVisible ? (
                <Movable
                  onClose={() => {
                    setGraphTableVisible(false);
                  }}
                  minWidth="600px"
                  minHeight="400px"
                  width="800px"
                  height="600px"
                  maxWidth="80vw"
                  title="Graph Table"
                >
                  <GraphTable
                    style={{ width: '100%', height: '100%' }}
                    nodeDataSources={nodeDataSources as NodeAttribute[]}
                    edgeDataSources={edgeDataSources as EdgeAttribute[]}
                    selectedNodeKeys={selectedNodeKeys}
                    selectedEdgeKeys={selectedEdgeKeys}
                    onSelectedNodes={(nodes) => {
                      return new Promise((resolve, reject) => {
                        const nodeKeys = nodes.map((node) => node.id);
                        setSelectedNodeKeys(uniq(nodeKeys));
                        resolve();
                      });
                    }}
                    onSelectedEdges={(edges) => {
                      return new Promise((resolve, reject) => {
                        const edgeKeys = edges.map((edge) => edge.relid);
                        setSelectedEdgeKeys(edgeKeys);

                        const nodeKeys = edges
                          .map((edge) => edge.source)
                          .concat(edges.map((edge) => edge.target));
                        setSelectedNodeKeys(uniq(nodeKeys));
                        resolve();
                      });
                    }}
                    onDeletedEdges={(
                      edges: EdgeAttribute[],
                      nodes: { id: string; label: string }[],
                    ): Promise<void> => {
                      const getComposedId = (node: { id: string; label: string }) => {
                        return `${node.label}::${node.id}`;
                      };

                      return new Promise((resolve, reject) => {
                        const edgeKeys = edges.map((edge) => edge.relid);
                        const remaningEdges = data.edges.filter(
                          (edge) => !edgeKeys.includes(edge.relid),
                        );
                        if (nodes.length == 0) {
                          setData({
                            nodes: data.nodes,
                            edges: remaningEdges,
                          });
                          updateGraphTable(data.nodes, remaningEdges);
                          // Clear the selected nodes and edges
                          setSelectedNodeKeys([]);
                          setSelectedEdgeKeys([]);
                          return resolve();
                        } else {
                          const nodeKeys = nodes.map((node) => getComposedId(node));
                          const deletingNodeKeys = nodeKeys.filter((nodeKey) => {
                            const found = remaningEdges.find(
                              (edge) => edge.source == nodeKey || edge.target == nodeKey,
                            );
                            return found ? false : true;
                          });
                          const remaningNodes = data.nodes.filter(
                            (node) =>
                              !deletingNodeKeys.includes(
                                getComposedId({
                                  id: node.data.id,
                                  label: node.data.label,
                                }),
                              ),
                          );
                          console.log(
                            'Deleting Node Keys: ',
                            deletingNodeKeys,
                            nodeKeys,
                            remaningEdges,
                            remaningNodes,
                          );

                          setData({
                            nodes: remaningNodes,
                            edges: remaningEdges,
                          });
                          updateGraphTable(remaningNodes, remaningEdges);
                          // Clear the selected nodes and edges
                          setSelectedNodeKeys([]);
                          setSelectedEdgeKeys([]);
                          return resolve();
                        }
                      });
                    }}
                    edgeStat={edgeStat}
                  />
                </Movable>
              ) : null}
              {similarityChartVisible ? (
                <Movable
                  onClose={() => {
                    setSimilarityChartVisible(false);
                  }}
                  width="600px"
                  title="Node Similarity [t-SNE]"
                >
                  <SimilarityChart
                    data={similarityArray}
                    method="tsne"
                    description='If you expect to highlight nodes on the chart, you need to enable the "Focus" and "Select" mode.'
                    onClick={(entity2D: Entity2D) => {
                      setSelectedNodeKeys([formatNodeIdFromEntity2D(entity2D)]);
                    }}
                  ></SimilarityChart>
                </Movable>
              ) : null}
              {explanationPanelVisible && llmResponse ? (
                <Movable
                  onClose={() => {
                    setExplanationPanelVisible(false);
                  }}
                  width="600px"
                  minWidth="600px"
                  minHeight="500px"
                  height="600px"
                  maxWidth="80vw"
                  title="Explanation Panel"
                >
                  <ExplanationPanel data={llmResponse}></ExplanationPanel>
                </Movable>
              ) : null}
              <GraphStoreTable
                visible={graphStoreTableVisible}
                graphs={graphHistory}
                onLoad={onLoadGraph}
                onDelete={onDeleteGraph}
                treeFormat
                parent={document.getElementById('knowledge-graph-container') as HTMLElement}
                onClose={() => {
                  setGraphStoreTableVisible(false);
                }}
                onUpload={(graphHistory: GraphHistoryItem) => {
                  return onSubmitGraph(graphHistory);
                }}
                selectedGraphId={currentGraphUUID}
              ></GraphStoreTable>
              <GraphStoreForm
                visible={graphFormVisible}
                payload={graphFormPayload}
                parent={document.getElementById('knowledge-graph-container') as HTMLElement}
                onClose={() => {
                  return new Promise((resolve, reject) => {
                    setGraphFormVisible(false);
                    resolve();
                  });
                }}
                onSubmit={(data: GraphHistoryItem) => {
                  return onSubmitGraph(data)
                    .then((response) => {
                      const id = response.id;
                      // Keep the current canvas as the parent graph, so we can create a new graph based on the current canvas.
                      setCurrentGraphUUID(id);
                    })
                    .finally(() => {
                      setGraphFormVisible(false);
                    });
                }}
              ></GraphStoreForm>
            </GraphinWrapper>
            {contextHolder}
          </Col>
        </Spin>
      </Row>
    </FullScreen>
  );
};

export default KnowledgeGraph;
