import React, { useEffect, useState, useContext } from 'react';
import Graphin, {
  Components,
  Behaviors,
  GraphinContext,
  IG6GraphEvent,
  GraphinData,
  GraphEvent,
} from '@antv/graphin';
import { Collapse } from 'antd';
import { CustomGraphinContext } from '../Context/CustomGraphinContext';
import { INode, NodeConfig, IEdge } from '@antv/g6';
import { ContextMenu, FishEye, Toolbar } from '@antv/graphin-components';
import LayoutSelector from './Components/LayoutSelector';
import type { Layout, GraphData } from '../typings';
import LayoutNetwork from './Components/LayoutNetworks';
import {
  BoxPlotOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  DotChartOutlined,
  DeleteFilled,
  ExpandAltOutlined,
  QuestionCircleOutlined,
  CloudDownloadOutlined,
  EyeOutlined,
  BranchesOutlined,
  AimOutlined,
  InfoCircleFilled,
  ForkOutlined,
  FullscreenOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  RedditOutlined,
  ShareAltOutlined,
  DownloadOutlined,
  CloudServerOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  PlusCircleOutlined,
  AntCloudOutlined,
} from '@ant-design/icons';
import { Stack } from '@antv/algorithm';
import type { TooltipValue, LegendChildrenProps, LegendOptionType } from '@antv/graphin';
import StatisticsDataArea from '../StatisticsDataArea';
import { PromptItem } from './index.t';
import Moveable from '../Moveable';
import { message, Descriptions, Switch, Button, Select, Menu as AntdMenu } from 'antd';
import { makeDataSource, defaultLayout, presetLayout, getMatrix, restoreMatrix, saveToLocalStorage } from './utils';
import { prepareGraphData, guessLink, guessSpecies } from '../utils';
import type {
  OnNodeMenuClickFn,
  OnEdgeMenuClickFn,
  OnClickEdgeFn,
  OnClickNodeFn,
  OnCanvasMenuClickFn,
  AdjacencyList,
  NodeMenuItem,
  EdgeMenuItem,
  CanvasMenuItem,
  EdgeInfo,
} from './typings';
import type { GraphNode, GraphEdge, SearchObjectInterface, APIs } from '../typings';
import ShowPaths from './Components/ShowPaths';
import NodeSearcherPanel from './Components/NodeSearcherPanel';
import HighlightNodeEdge from './Components/HighlightNodeEdge';
import voca from 'voca';

import './GraphinWrapper.less';
import { sortBy, debounce, cloneDeep, isEqual, set } from 'lodash';

const { MiniMap, SnapLine, Tooltip, Legend } = Components;
const { Panel } = Collapse;

const {
  ZoomCanvas,
  ActivateRelations,
  ClickSelect,
  Hoverable,
  FitView,
  DragNodeWithForce,
  DragNode,
  LassoSelect,
  BrushSelect,
} = Behaviors;

const { Menu } = ContextMenu;

const snapLineOptions = {
  line: {
    stroke: 'lightgreen',
    lineWidth: 1,
  },
};

type EdgeMenuProps = {
  onChange?: OnEdgeMenuClickFn;
  chatbotVisible?: boolean;
  onExplainRelationship?: OnEdgeMenuClickFn;
  item?: IG6GraphEvent['item'];
  prompts?: PromptItem[];
};

const EdgeMenu = (props: EdgeMenuProps) => {
  const { graph, apis } = useContext(GraphinContext);
  const { item, chatbotVisible, onExplainRelationship } = props;

  const [visible, setVisible] = useState<boolean>(false);
  const [sourceNode, setSourceNode] = useState<GraphNode | undefined>(undefined);
  const [targetNode, setTargetNode] = useState<GraphNode | undefined>(undefined);
  const [edge, setEdge] = useState<GraphEdge | undefined>(undefined);

  useEffect(() => {
    if (item) {
      const edge = item.getModel() as GraphEdge;
      const source = graph.findById(edge.source).getModel() as GraphNode;
      const target = graph.findById(edge.target).getModel() as GraphNode;

      if (source && target && edge) {
        setSourceNode(source);
        setTargetNode(target);
        setEdge(edge);
        setVisible(true);
      }
    } else {
      setVisible(false);
      setSourceNode(undefined);
      setTargetNode(undefined);
      setEdge(undefined);
    }
  }, []);

  const options: EdgeMenuItem[] = [
    {
      key: 'show-edge-details',
      icon: <InfoCircleFilled />,
      // disabled: true,
      title:
        'Show the details of the edge in different data sources. such as clinical data, omics data, and literatures. It will help us to understand the relationship between the two nodes.',
      label: 'Show Edge Details',
    },
    {
      key: 'hide-edges',
      icon: <EyeInvisibleOutlined />,
      label: 'Hide Edge(s)',
      children: [
        {
          key: 'hide-current-edge',
          icon: <EyeInvisibleOutlined />,
          title: 'Hide the edge you selected.',
          label: 'Hide Current Edge',
        },
        {
          key: 'hide-edges-with-same-type',
          icon: <EyeInvisibleOutlined />,
          title:
            'Hide the edges which have the same type with the edge you selected. It will help us to focus on the specific type of the edges.',
          label: 'Hide Edges with the Same Type',
        },
      ],
    },
    {
      key: 'explain-relationship',
      icon: <RedditOutlined />,
      title: 'Using ChatGPT & Literatures to explain the relationship between the two nodes.',
      disabled: props.prompts?.length == 0,
      label: 'Explain Relationship (Experimental)',
      children: props.prompts?.map((item) => {
        return {
          key: item.key,
          icon: <RedditOutlined />,
          label: item.label,
        };
      }),
    },
    {
      key: 'analyze-with-clinical-data',
      icon: <BarChartOutlined />,
      disabled: true,
      label: 'Analyze with Clinical Data',
      title:
        'Analyze the relationship between the two nodes with clinical data. It will help us to understand the relationship between the two nodes in the context of clinical data.',
    },
    {
      key: 'analyze-with-omics-data',
      icon: <AimOutlined />,
      disabled: true,
      label: 'Analyze with Omics Data',
      title:
        'Analyze the relationship between the two nodes with omics data. It will help us to understand the relationship between the two nodes in the context of omics data.',
    },
  ];

  if (chatbotVisible) {
    options.push({
      key: 'ask-question',
      icon: <QuestionCircleOutlined />,
      label: 'Ask Chatbot',
      hidden: false,
      children: [
        {
          key: 'what-is-the-relationship',
          icon: <BranchesOutlined />,
          label: `What is the relationship between the two nodes?`,
        },
      ],
    });
  }

  const onChange = function (menuKey: string) {
    const childOptions = options
      .filter((item) => {
        return item.children;
      })
      .map((item) => {
        return item.children;
      })
      .flat();

    const allOptions = options.filter((item) => {
      return !item.children;
    });

    const menuItem =
      allOptions.find((item) => {
        return item.key === menuKey;
      }) ||
      childOptions.find((item) => {
        if (item) {
          return item.key === menuKey;
        } else {
          return false;
        }
      });

    console.log('EdgeMenu: ', menuKey, menuItem);

    if (menuItem) {
      if (menuItem.handler && edge) {
        menuItem.handler(edge);
      } else if (props.onChange && sourceNode && targetNode && edge && graph && apis) {
        if (['hide-current-edge', 'hide-edges-with-same-type'].includes(menuKey)) {
          // @ts-ignore
          graph.pushCustomStack();
        }
        props.onChange(menuItem, sourceNode, targetNode, edge, graph, apis);
      }
    } else {
      message.warning('Cannot catch the changes.');
    }
  };

  return visible ? (
    <div>
      <AntdMenu
        items={options.filter((item) => {
          return !item.hidden;
        })}
        onClick={(menuInfo) => {
          onChange(menuInfo.key);
          setVisible(false);
        }}
        getPopupContainer={(triggerNode) => {
          return (triggerNode.parentNode as HTMLElement) || document.body;
        }}
      />
    </div>
  ) : null;
};

type NodeMenuProps = {
  onChange?: OnNodeMenuClickFn;
  chatbotVisible?: boolean;
  item?: IG6GraphEvent['item'];
  nodePrompts?: PromptItem[];
  subgraphPrompts?: PromptItem[];
};

// Add menu items for the node. If you want to some functions executed when a node is clicked, you can add the function here.
// Some functions are related with graph styles, so we only need to add handler functions in this component, otherwises we need to add the handler functions in the parent component.
const NodeMenu = (props: NodeMenuProps) => {
  const { graph, apis } = useContext(GraphinContext);
  const { item, chatbotVisible } = props;

  const [visible, setVisible] = useState<boolean>(false);

  console.log('NodeMenu', props.item);

  const [node, setNode] = useState<GraphNode | undefined>(undefined);

  const howManyNodesSelected = () => {
    return graph.getNodes().filter((node) => {
      return node.hasState('selected');
    }).length;
  }

  useEffect(() => {
    if (item && item._cfg) {
      const nodeModel = item.getModel() as GraphNode;

      // Don't worry about the type of nodeModel.
      setNode(nodeModel);
      setVisible(true);
    } else {
      setVisible(false);
      setNode(undefined);
    }
  }, []);

  const options: NodeMenuItem[] = [
    {
      key: 'show-node-details',
      icon: <InfoCircleFilled />,
      label: 'Show Node Details',
      title:
        'Show the node in different data sources. such as clinical data, omics data, and literature.',
      // disabled: true,
    },
    {
      key: 'find-related-nodes',
      icon: <CheckCircleOutlined />,
      label: 'Find Key Nodes',
      children: [
        {
          // Users can use the prediction modules instead of.
          key: 'find-similar-nodes',
          icon: <AimOutlined />,
          hidden: true,
          label: 'Find Similar Nodes',
        },
        {
          key: 'expand-selected-nodes',
          hidden: true,
          icon: <FullscreenOutlined />,
          label: 'Expand Selected Nodes',
        },
        {
          // Users can use the prediction modules instead of.
          key: 'predict-relationships',
          hidden: true,
          icon: <CloudServerOutlined />,
          label: 'Predict Relationships',
        },
        {
          key: 'expand-one-step',
          icon: <ExpandAltOutlined />,
          label: 'Expand One Step',
          disabled: howManyNodesSelected() !== 1 && !visible
        },
        {
          key: 'find-shared-nodes',
          icon: <BranchesOutlined />,
          label: 'Find Shared Nodes',
          disabled: howManyNodesSelected() <= 1,
        },
        {
          key: 'expand-all-paths',
          hidden: false,
          icon: <ShareAltOutlined />,
          disabled: howManyNodesSelected() !== 2,
          label: 'Find Paths (Within 2 Steps)',
          children: [
            {
              key: 'expand-all-paths-1',
              icon: <ShareAltOutlined />,
              label: 'Within 1 Step',
            },
            {
              key: 'expand-all-paths-2',
              icon: <ShareAltOutlined />,
              label: 'Within 2 Steps',
            },
            // {
            //   key: 'expand-all-paths-3',
            //   hidden: true,
            //   icon: <ShareAltOutlined />,
            //   label: 'Within 3 Step',
            // },
          ],
        },
      ],
    },
    {
      key: 'select-nodes',
      icon: <PlusCircleOutlined />,
      label: '(Un)Select / Delete Node(s)',
      title: 'Select, Reverse Select, or delete the node(s) in the graph.',
      children: [
        {
          key: 'hide-selected-nodes',
          icon: <EyeInvisibleOutlined />,
          label: 'Hide Selected Node(s)',
        },
        {
          key: 'reverse-selected-nodes',
          icon: <CloseCircleOutlined />,
          label: 'Reverse Selected Nodes',
          handler: (node: GraphNode) => {
            graph.getNodes().forEach((node) => {
              if (node.hasState('selected')) {
                graph.setItemState(node, 'selected', false);
              } else {
                graph.setItemState(node, 'selected', true);
              }
            });

            if (node) {
              // Reset the status of the current node to unselected, even if it is not selected.
              graph.setItemState(node.id, 'selected', false);
            }

            setVisible(false);
          },
        },
        {
          key: 'delete-nodes',
          icon: <DeleteFilled />,
          label: 'Delete Selected Node(s)',
          danger: true,
        },
      ],
    },
    {
      key: 'visulize-similarities',
      icon: <DotChartOutlined />,
      title:
        'Visualize the similarities between the nodes. It will help us to understand the importance of the nodes for a given node.',
      disabled: true,
      label: 'Visualize Similarities',
    },
    {
      key: 'explain-node',
      icon: <AntCloudOutlined />,
      title: 'Using ChatGPT to explain the node.',
      disabled: props.nodePrompts?.length == 0,
      label: 'Explain Node (Experimental)',
      children: props.nodePrompts?.map((item) => {
        return {
          key: item.key,
          icon: <AntCloudOutlined />,
          label: item.label,
        };
      }),
    },
    {
      key: 'explain-subgraph',
      icon: <RedditOutlined />,
      title: 'Using ChatGPT to explain the subgraph in the context of the selected node.',
      label: 'Explain Subgraph (Experimental)',
      disabled: props.subgraphPrompts?.length == 0,
      children: props.subgraphPrompts?.map((item) => {
        return {
          key: item.key,
          icon: <RedditOutlined />,
          label: item.label,
        };
      }),
    },
  ];

  if (chatbotVisible) {
    options.push({
      key: 'ask-question',
      icon: <QuestionCircleOutlined />,
      label: 'Ask Chatbot',
      children: [
        {
          key: 'what-is-the-node',
          icon: <InfoCircleFilled />,
          label: `What is the node?`,
        },
      ],
    });
  }

  const onChange = function (menuKey: string) {
    const childOptions = options
      .filter((item) => {
        return item.children;
      })
      .map((item) => {
        return item.children;
      })
      .flat();

    const grandChildOptions = childOptions
      .filter((item) => {
        return item.children;
      })
      .map((item) => {
        return item.children;
      })
      .flat();

    const allOptions = options.filter((item) => {
      return !item.children;
    });

    console.log('NodeMenu: ', childOptions, grandChildOptions, allOptions);

    const menuItem =
      allOptions.find((item) => {
        return item.key === menuKey;
      }) ||
      childOptions.find((item) => {
        if (item) {
          return item.key === menuKey;
        } else {
          return false;
        }
      }) ||
      grandChildOptions.find((item) => {
        if (item) {
          return item.key === menuKey;
        } else {
          return false;
        }
      });

    console.log('NodeMenu: ', menuKey, menuItem);

    if (menuItem) {
      // Only need to change the status of the nodes, so no need to call the onChange function.
      if (menuItem.handler && node) {
        menuItem.handler(node);
      } else {
        if (props.onChange && node && graph && apis) {
          props.onChange(menuItem, node, graph, apis);
        } else {
          message.warning('Cannot catch the changes.');
        }
      }
    } else {
      console.log('Cannot find the menu item: ', menuKey, options);
      // TODO: It doesn't happen.
      message.warning('Cannot catch the changes.');
    }
  };

  // Filter the children of the menu item and remove the hidden children.
  const filteredOptions = options.map((item) => {
    if (item.children) {
      let i = {
        ...item,
        children: item.children.filter((child) => {
          return !child.hidden;
        }),
      };

      if (i.children.length == 0) {
        return { ...i, hidden: true };
      } else {
        return i;
      }
    } else {
      return item.hidden ? { ...item, hidden: true } : item;
    }
  });

  return visible ? (
    <AntdMenu
      items={filteredOptions.filter((item) => {
        return !item.hidden;
      })}
      onClick={(menuInfo) => {
        console.log('NodeMenu onClick: ', menuInfo, node);
        onChange(menuInfo.key);
        setVisible(false);
      }}
      getPopupContainer={(triggerNode) => {
        return (triggerNode.parentNode as HTMLElement) || document.body;
      }}
    />
  ) : null;
};

type CanvasMenuProps = {
  onCanvasClick?: OnCanvasMenuClickFn;
  handleOpenFishEye?: () => void;
  onClearGraph?: () => void;
};

const CanvasMenu = (props: CanvasMenuProps) => {
  const { graph, contextmenu, apis } = useContext(GraphinContext);
  const context = contextmenu.canvas;
  const handleDownloadCanvas = (item: CanvasMenuItem) => {
    if (graph.getNodes().length == 0) {
      message.warning('No data to download');
      return;
    }

    graph.downloadFullImage('canvas', 'image/png', {
      backgroundColor: '#fff',
      padding: 10,
    });
  };

  const handleDownloadData = (item: CanvasMenuItem) => {
    const payload = prepareGraphData(graph);

    if (payload.data.nodes.length == 0) {
      message.warning('No data to download');
      return;
    }

    // @ts-ignore
    const json: GraphItem = {
      payload: payload,
      name: 'shared-graph',
      description: 'Shared graph',
    };
    // Download data as json file
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'graph.json';
    link.click();
  };

  const handleAutoConnect = (item: CanvasMenuItem) => {
    if (props.onCanvasClick) {
      props.onCanvasClick(item, graph, apis);
    }
  };

  const handleClear = (item: CanvasMenuItem) => {
    graph.clear();
    if (props.onClearGraph) {
      props.onClearGraph();
      message.info(`Clear canvas successfully`);
    } else {
      message.warning(`Cannot clear canvas`);
    }
  };

  const handleStopAnimate = (item: CanvasMenuItem) => {
    message.info(`Stop animatition successfully`);
    graph.stopAnimate();

    const allEdges = graph.getEdges();
    allEdges.forEach((edge) => {
      graph.updateItem(edge, {
        style: {
          ...edge.getModel()?.style,
          animate: false,
        }
      }, false);
    });
  };

  const handleOpenFishEye = (item: CanvasMenuItem) => {
    if (props.handleOpenFishEye) {
      props.handleOpenFishEye();
    }
  };

  const handleClearNodeEdgeStatus = (item: CanvasMenuItem) => {
    const nodes = graph.getNodes();
    nodes.forEach((node) => {
      graph.setItemState(node, 'inactive', false);
      graph.setItemState(node, 'active', false);

      // Some nodes are hidden, so we need to show them.
      graph.showItem(node, true);
    });

    const edges = graph.getEdges();
    edges.forEach((edge) => {
      graph.setItemState(edge, 'inactive', false);
      graph.setItemState(edge, 'active', false);

      // Some edges are hidden, so we need to show them.
      graph.showItem(edge, true);
    });

    message.success(`Clear node/edge status successfully`);

    if (props.onCanvasClick) {
      props.onCanvasClick(item, graph, apis);
    }
  };

  const options: CanvasMenuItem[] = [
    {
      key: 'auto-connect',
      icon: <ForkOutlined />,
      label: 'Auto Connect Graph',
      title:
        'Auto connect the graph based on the current graph data. It will help us to find the potential relationships between the nodes. [NOTE] It may mess up the current graph layout.',
      handler: handleAutoConnect,
    },
    {
      key: 'stop-animate',
      icon: <ForkOutlined />,
      label: 'Stop & Clear Animatition',
      title: 'Stop and clear the animation of the graph.',
      handler: handleStopAnimate,
    },
    {
      key: 'refresh-graph',
      icon: <ReloadOutlined />,
      label: 'Refresh Graph',
      handler: (item: CanvasMenuItem) => {
        // TODO: which function is better?
        graph.layout();
        graph.refreshPositions();
        handleClearNodeEdgeStatus(item);
        message.success(`Refresh graph successfully`);
      },
    },
    {
      key: 'enable-fish-eye',
      icon: <EyeOutlined />,
      label: 'Enable FishEye',
      handler: handleOpenFishEye,
    },
    {
      key: 'download-data',
      icon: <DownloadOutlined />,
      label: 'Download Graph Data',
      title:
        'Download the graph data as a JSON file. It will help us to share the graph data with others.',
      handler: handleDownloadData,
    },
    {
      key: 'download-canvas',
      icon: <CloudDownloadOutlined />,
      label: 'Save As Image',
      handler: handleDownloadCanvas,
    },
    {
      key: 'clear-node-edge-status',
      icon: <DeleteOutlined />,
      danger: true,
      title:
        'Clear the status of the nodes and edges. It will help us to reset the status of the nodes and edges. If you found some nodes or edges are not shown, you can try this function.',
      label: 'Clear Node/Edge Status',
      handler: handleClearNodeEdgeStatus,
    },
    {
      key: 'clear-canvas',
      icon: <DeleteOutlined />,
      label: 'Clear Current Subgraph',
      danger: true,
      handler: handleClear,
    },
  ];

  const onChange = function (menuKey: string) {
    const menuItem = options.find((item) => {
      return item.key === menuKey;
    });

    if (menuItem) {
      // Only need to change the status of the nodes, so no need to call the onChange function.
      if (menuItem.handler) {
        menuItem.handler(menuItem);
      } else {
        console.log('Cannot find the handler function for the menu item: ', menuItem);
      }
    } else {
      console.log('Cannot find the menu item: ', menuKey, options);
      // TODO: It doesn't happen.
      message.warning('Cannot catch the changes.');
    }
  };

  return (
    <AntdMenu
      items={options.filter((item) => {
        return !item.hidden;
      })}
      onClick={(menuInfo) => {
        onChange(menuInfo.key);
        context.handleClose();
      }}
      getPopupContainer={(triggerNode) => {
        return (triggerNode.parentNode as HTMLElement) || document.body;
      }}
    />
  );
};

const CustomHoverable = (props: { bindType?: 'node' | 'edge'; disabled?: boolean }) => {
  const { bindType, disabled } = props;
  const { graph } = useContext(GraphinContext);
  const [enableHoverable, setEnableHoverable] = useState<boolean>(false);

  // TODO: How to disable hoverable when there are multiple nodes selected?
  // useEffect(() => {
  //     const selectedNodes = graph.getNodes().filter(node => {
  //         return node.getStates().includes('selected')
  //     })
  //     setEnableHoverable(selectedNodes.length > 1)
  // }, [])

  return <Hoverable bindType={bindType} disabled={enableHoverable || disabled} />;
};

const NodeLabelVisible = (props: { visible: boolean }) => {
  const { visible } = props;

  const graph = useContext(GraphinContext).graph;

  useEffect(() => {
    graph.getNodes().forEach((node) => {
      graph.updateItem(
        node,
        {
          style: {
            // @ts-ignore
            label: {
              ...node.getModel()?.style?.label,
              visible: visible,
            },
          },
        },
        false,
      );
    });
  }, [visible]);
  return null;
};

const EdgeLabelVisible = (props: { visible: boolean }) => {
  const { visible } = props;
  const graph = useContext(GraphinContext).graph;

  useEffect(() => {
    // TODO: Cannot restore the edge label status after the edge label is hidden.
    graph.getEdges().forEach((edge) => {
      graph.update(
        edge,
        {
          style: {
            // @ts-ignore
            label: {
              ...edge.getModel()?.style?.label,
              opacity: visible ? 1 : 0,
              visible: visible,
            },
          },
        },
        false,
      );
    });
  }, [visible]);

  return null;
};

const FocusBehavior = (props: {
  queriedId?: string;
  onClickNode?: (nodes: GraphNode) => void;
  mode?: 'select' | 'focus';
}) => {
  const { graph, apis } = useContext(GraphinContext);

  useEffect(() => {
    // 初始化聚焦到查询节点
    if (props.queriedId && props.mode == 'focus') {
      apis.focusNodeById(props.queriedId);
    }

    const handleClick = (evt: IG6GraphEvent) => {
      const node = evt.item as INode;
      const model = node.getModel() as NodeConfig;

      if (props.mode == 'focus') {
        apis.focusNodeById(model.id);
      }

      if (props.onClickNode) {
        props.onClickNode(node.getModel() as GraphNode);
      }
    };

    // 每次点击聚焦到点击节点上
    graph.on('node:click', handleClick);

    return () => {
      graph.off('node:click', handleClick);
    };
  }, []);

  return null;
};

const NodeClickBehavior = (props: { onClick?: OnClickNodeFn }) => {
  const { graph, apis } = useContext(GraphinContext);

  useEffect(() => {
    const handleClick = (evt: IG6GraphEvent) => {
      if (props.onClick) {
        const node = evt.item as INode;
        const model = node.getModel() as GraphNode;
        props.onClick(model.id, model);
      }
    };

    graph.on('node:click', handleClick);
    return () => {
      graph.off('node:click', handleClick);
    };
  }, []);
  return null;
};

const EdgeClickBehavior = (props: { onClick?: OnClickEdgeFn }) => {
  const { graph, apis } = useContext(GraphinContext);

  useEffect(() => {
    const handleClick = (evt: IG6GraphEvent) => {
      if (props.onClick) {
        const edge = evt.item as IEdge;
        const model = edge.getModel() as GraphEdge;
        const startNode = graph.findById(model.source).getModel() as GraphNode;
        const endNode = graph.findById(model.target).getModel() as GraphNode;
        props.onClick(model.relid, startNode, endNode, model);
      }
    };

    graph.on('edge:click', handleClick);
    return () => {
      graph.off('edge:click', handleClick);
    };
  }, []);
  return null;
};

export type GraphinProps = {
  selectedNodes?: string[];
  changeSelectedNodes?: (selectedNodes: string[]) => void;
  selectedEdges?: string[];
  changeSelectedEdges?: (selectedEdges: string[]) => void;
  data: GraphData;
  style: React.CSSProperties;
  containerId?: string;
  onNodeMenuClick?: OnNodeMenuClickFn;
  onEdgeMenuClick?: OnEdgeMenuClickFn;
  onCanvasMenuClick?: OnCanvasMenuClickFn;
  queriedId?: string;
  statistics: any;
  chatbotVisible?: boolean;
  onClickNode?: OnClickNodeFn;
  onClickEdge?: OnClickEdgeFn;
  onClearGraph?: () => void;
  className?: string;
  settings: GraphinSettings;
  children?: React.ReactNode;
  onDataChanged?: (graph: GraphData, width: number, height: number, matrix: any) => void;
  prompts?: PromptItem[];
  layout?: Layout;
  askLlmFn?: APIs["AskLlmFn"],
};

export type GraphinSettings = {
  autoPin: boolean;
  nodeLabelVisible: boolean;
  edgeLabelVisible: boolean;
  nodeTooltipEnabled: boolean;
  edgeTooltipEnabled: boolean;
  selectionMode: string;
  interactiveMode: 'show-details' | 'show-paths' | 'select-nodes';
  miniMapEnabled: boolean;
  snapLineEnabled: boolean;
  infoPanelEnabled: boolean;
};

export const defaultSettings: GraphinSettings = {
  autoPin: false,
  nodeLabelVisible: true,
  edgeLabelVisible: true,
  nodeTooltipEnabled: true,
  edgeTooltipEnabled: false,
  interactiveMode: 'select-nodes',
  selectionMode: 'brush-select',
  miniMapEnabled: true,
  snapLineEnabled: true,
  infoPanelEnabled: true,
};

const GraphinWrapper: React.FC<GraphinProps> = (props) => {
  const {
    data,
    style,
    onNodeMenuClick,
    onEdgeMenuClick,
    selectedNodes,
    onCanvasMenuClick,
    selectedEdges,
    settings,
  } = props;
  const [fishEyeVisible, setFishEyeVisible] = useState(false);
  const [explanationPanelVisible, setExplanationPanelVisible] = useState(false);
  const [layout, setLayout] = React.useState<Layout>(presetLayout);

  const [currentEdge, setCurrentEdge] = useState<any>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [focusedNodes, setFocusedNodes] = useState<GraphNode[]>([]);
  const [adjacencyList, setAdjacencyList] = useState<AdjacencyList>({} as AdjacencyList); // Adjacency list for the current graph

  const [nodePrompts, setNodePrompts] = useState<PromptItem[]>([]);
  const [edgePrompts, setEdgePrompts] = useState<PromptItem[]>([]);
  const [subgraphPrompts, setSubgraphPrompts] = useState<PromptItem[]>([]);
  const [undoStack, setUndoStack] = useState<Stack>(new Stack(50));
  const [matrix, setMatrix] = useState<any>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [graphData, setGraphData] = useState<GraphData>(data);

  const ref = React.useRef(null);

  const isObject = (object: any) => {
    return object != null && typeof object === 'object';
  };

  const deepEqual = (object1: any, object2: any) => {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      console.log('The data are different: ', keys1, keys2);
      return false;
    }

    for (const key of keys1) {
      let val1 = object1[key];
      let val2 = object2[key];
      if (key === 'x' || key === 'y') {
        if (Math.abs(val1 - val2) > 2) {
          console.log('The data are different: ', keys1, keys2, val1, val2);
          return false;
        }
      } else {
        const areObjects = isObject(val1) && isObject(val2);
        if ((areObjects && !deepEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
          console.log('The data are different: ', keys1, keys2, key, val1, val2);
          return false;
        }
      }
    }

    return true;
  };

  const findUpdatedData = (
    oldData: GraphData,
    newData: GraphData,
  ): {
    data: GraphData;
    addedData: GraphData;
    subtractedData: GraphData;
  } => {
    const oldNodesMap = new Map(oldData.nodes.map((node) => [node.id, node]));
    const oldEdgesMap = new Map(oldData.edges.map((edge) => [edge.relid, edge]));
    const newNodeIds = new Set(newData.nodes.map((node) => node.id));
    const newEdgeIds = new Set(newData.edges.map((edge) => edge.relid));

    const addedNodes = newData.nodes.filter((node) => !oldNodesMap.has(node.id));
    const addedEdges = newData.edges.filter((edge) => !oldEdgesMap.has(edge.relid));

    const subtractedNodes = oldData.nodes.filter((node) => !newNodeIds.has(node.id));
    const subtractedEdges = oldData.edges.filter((edge) => !newEdgeIds.has(edge.relid));

    // 创建最终的节点和边数组，排除subtractedData，添加addedData
    const finalNodes = oldData.nodes
      .filter((node) => !subtractedNodes.some((subNode) => subNode.id === node.id))
      .concat(addedNodes);
    const finalEdges = oldData.edges
      .filter((edge) => !subtractedEdges.some((subEdge) => subEdge.relid === edge.relid))
      .concat(addedEdges);

    return {
      data: {
        nodes: finalNodes,
        edges: finalEdges,
      },
      addedData: {
        nodes: addedNodes,
        edges: addedEdges,
      },
      subtractedData: {
        nodes: subtractedNodes,
        edges: subtractedEdges,
      },
    };
  };

  const refreshDragedNodePosition = (e: any) => {
    const model = e.item.get('model');
    model.fx = e.x;
    model.fy = e.y;
  };

  const refreshDragedCanvas = (e: any) => {

  };

  const recordMatrix = (e: any) => {
    // @ts-ignore
    const graph = ref.current?.graph;
    if (graph) {
      setMatrix(getMatrix(graph));
    }
  };

  const pushUndoStackWithinEvent = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.delegateTarget) {
      pushUndoStack(e);
    }
  }

  const handleSaveShortcut = (event: any) => {
    // Check if the user is pressing the "Ctrl" key and "s" key
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault(); // 阻止默认行为
      message.success("Your graph data has been saved successfully.");

      saveGraphData();
    }
  };

  const initEvents = () => {
    // @ts-ignore
    if (ref && ref.current && ref.current.graph) {
      // @ts-ignore
      const graph = ref.current.graph;
      const setEdge = (e: any) => {
        setCurrentEdge(e.item);
      };

      const setNode = (e: any) => {
        setCurrentNode(e.item);
      };

      graph.on('edge:contextmenu', setEdge);
      graph.on('node:contextmenu', setNode);
      // More details: https://g6.antv.vision/api/graph-func/layout#graphlayout
      // https://g6.antv.antgroup.com/zh/examples/net/forceDirected/#basicForceDirectedDragFix
      graph.on('node:drag', refreshDragedNodePosition);
      graph.on('canvas:drag', (e: any) => refreshDragedCanvas);
      graph.on('canvas:dragend', recordMatrix);
      graph.on('node:dragstart', pushUndoStackWithinEvent);
      graph.on('canvas:dragstart', pushUndoStackWithinEvent);

      if (typeof window !== 'undefined') {
        // @ts-ignore
        const container = ref?.current?.graphDOM;
        window.onresize = () => {
          if (!graph || graph.get('destroyed')) return;
          if (!container || !container.scrollWidth || !container.scrollHeight) return;
          console.log('window.onresize: ', container.scrollWidth, container.scrollHeight);
          debounce(() => {
            graph.changeSize(container.scrollWidth, container.scrollHeight);
          }, 500);
        };
      }

      const handleBeforeUnload = (e: any) => {
        e.preventDefault();
        e.returnValue = ''; // 显示默认的离开确认对话框

        console.log('handleBeforeUnload: ', e);
        saveGraphData();
      };

      // window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('keydown', handleSaveShortcut);

      return () => {
        // Clear the events.
        graph.off('edge:contextmenu', setEdge);
        graph.off('node:contextmenu', setNode);
        graph.off('node:drag', refreshDragedNodePosition);
        graph.off('canvas:drag', () => {
          // console.log('canvas:drag', e);
        });
        graph.off('canvas:dragend', recordMatrix);
        graph.off('node:dragstart', pushUndoStackWithinEvent);
        graph.off('canvas:dragstart', pushUndoStackWithinEvent);

        // window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('keydown', handleSaveShortcut);
        window.onresize = null;
      };
    }
  };

  const hasPositions = (data: GraphData) => {
    const n = data.nodes.filter((node) => {
      return node.x && node.y;
    });

    return n.length / data.nodes.length > 0.8;
  };

  const debouncedSaveGraphData = debounce(() => {
    // We must save the graph data after the layout is changed, elsewise the graph data will not contains the position of the nodes and edges.
    console.log("Save the graph data to the local storage: ", new Date());
    saveGraphData();
    // TODO: what value is better?
  }, 2000);

  const saveGraphData = () => {
    console.log('saveGraphData: ', props.onDataChanged);
    if (props.onDataChanged) {
      // @ts-ignore
      props.onDataChanged(ref.current?.graph.save(), ref.current?.graphDOM.clientWidth, ref.current?.graphDOM.clientHeight, ref.current?.graph.cfg.group.getMatrix());
    }
  }

  const getMostFrequentNode = (edges: GraphEdge[]): string | undefined => {
    const nodes = edges.map((edge) => {
      return [edge.source, edge.target];
    });

    const nodesFlat = nodes.flat();
    const counts: Record<string, number> = nodesFlat.reduce(
      (acc: Record<string, number>, node: string) => {
        acc[node] = (acc[node] || 0) + 1;
        return acc;
      },
      {},
    );

    const maxCount = Math.max(...Object.values(counts));
    const mostFrequentNode = Object.keys(counts).find((key) => counts[key] === maxCount);

    return mostFrequentNode;
  };

  const refreshAddedNodePosition = (addedData: GraphData, fullData: GraphData) => {
    // @ts-ignore
    const graph = ref.current?.graph;
    const nodeMap: Record<string, GraphNode> = {};
    // Fix the position of the old nodes and update the position of the new nodes.
    fullData.nodes.forEach((node) => {
      nodeMap[node.id] = node;
    });

    let x = 0;
    let y = 0;
    // Get the center position of the graph.
    const mostFrequentNode = getMostFrequentNode(addedData.edges);
    if (mostFrequentNode) {
      const node = nodeMap[mostFrequentNode];
      console.log(
        'refreshAddedNodePosition: find the most frequent node: ',
        node,
        mostFrequentNode,
        addedData,
      );

      if (node) {
        x = node.x || 0;
        y = node.y || 0;
      }
    }

    if (!x || !y) {
      const center = graph?.getGraphCenterPoint();

      // TODO: Do we have a better way to layout the new nodes?
      console.log('refreshAddedNodePosition: ', center, addedData.nodes);
      x = center?.x;
      y = center?.y;
    }

    const centralAngle = 180;
    const angleIncrement = centralAngle / (addedData.nodes.length - 1);
    const startAngle = 0;
    const radius = 200;

    if (x && y) {
      // Generate random positions for the new nodes according to the position of the source node.
      addedData.nodes.forEach((node, index) => {
        if (!node.x || !node.y) {
          const angleRadians = (startAngle + angleIncrement * index) * (Math.PI / 180);

          const position = {
            x: x + radius * Math.cos(angleRadians),
            y: y + radius * Math.sin(angleRadians),
          };

          // @ts-ignore
          graph?.updateItem(node.id, {
            x: position.x,
            y: position.y,
          }, false);
        }
      });

      // Label all new edges with a new edge type.
      addedData.edges.forEach((edge) => {
        // @ts-ignore
        graph?.updateItem(edge.id, {
          style: {
            ...style,
            animate: {
              type: 'circle-running',
              color: 'green',
              repeat: true,
              duration: 2000
            }
          }
        }, false);
      });
    }
  };

  const changeGraphSize = () => {
    // @ts-ignore
    if (ref.current && ref.current.graph && ref.current.graphDOM) {
      // @ts-ignore
      const graphDOM = ref.current.graphDOM;
      // @ts-ignore
      const graph = ref.current.graph;
      const width = graphDOM.clientWidth;
      const height = graphDOM.clientHeight;

      console.log('changeGraphSize: ', width, height, graph, graphDOM);
      graph.changeSize(width, height);
    }
  };

  const handleOpenFishEye = () => {
    setFishEyeVisible(true);
  };

  const onCloseFishEye = () => {
    setFishEyeVisible(false);
  };

  const onClickNodeInFocusMode = (node: GraphNode) => {
    setFocusedNodes((prevState) => [...prevState, node]);
  };

  const pushUndoStack = (evt?: any) => {
    // @ts-ignore
    let graph = ref.current?.graph;
    let undoStack = graph?.getCustomUndoStack();
    let d = graph?.save()
    let width = graph?.getWidth();
    let height = graph?.getHeight();
    let matrix = getMatrix(graph);
    let dm = cloneDeep({
      data: d,
      matrix: matrix,
      width: width,
      height: height,
    });
    console.log("pushUndoStack: ", dm, evt, typeof evt);
    if (undoStack && dm.data) {
      undoStack.push(dm);
    }

    // TODO: ISSUE: We cannot get the latest graph data, width, height, and matrix. How to fix it? Enough for now.
    setWidth(width);
    setHeight(height);
    setMatrix(matrix);
    setGraphData(d);
  }

  const onClosePathsFinder = () => {
    setFocusedNodes([]);
  };

  // https://github.com/antvis/Graphin/issues/522
  // Cannot keep the hovering status.
  const HoverText: React.FC<{ data: Record<string, any>; style: Record<string, any> }> = ({
    data,
    style,
  }) => {
    const { graph, apis } = useContext(GraphinContext);
    const mergeStyle = { width: '300px', ...style };

    const [activeKey, setActiveKey] = useState(['0']);
    const [multipleEdges, setMultipleEdges] = useState<any[]>([]);

    // TODO: Do we need to use the activeKey?
    const handleChange = (key: string | string[]) => {
      console.log('HoverText: ', key, activeKey);
      if (typeof key === 'string') {
        key = [key];
      }

      // if (key.length === 0) {
      //   key = ['1'];
      // }
      setActiveKey(key);
    };

    const buildHoverTextComponent = (data: Record<string, any>) => {
      const isLink = (key: string) => {
        return ['source_id', 'target_id', 'id', 'label'].includes(key);
      };

      const formatItem = (key: string, value: string | number) => {
        const externalLink = guessLink(value);
        if (isLink(key) && externalLink) {
          return (
            <a href={externalLink} target="_blank">
              {value}
            </a>
          );
        } else if (key == 'pmids') {
          if (value) {
            const pmids = `${value}`.split('|');
            return pmids.map((pmid: string) => {
              return (
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`} target="_blank">
                  {pmid}
                </a>
              );
            });
          }
        } else if (key == 'taxid') {
          if (value) {
            return guessSpecies(value);
          }
        } else if (key == 'score') {
          if (typeof value == 'number') {
            return value.toFixed(2);
          } else {
            return value;
          }
        } else {
          return value;
        }
      };

      console.log('HoverText: ', data);
      const dataSource = makeDataSource(data, [
        // Blacklist
        // For node
        'comboId',
        'degree',
        'depth',
        'layoutOrder',
        'x',
        'fx',
        'y',
        'fy',
        'type',
        'category',
        'nlabel',
        'identity',
        'mass',
        // It will cause the graph dispearing if we don't remove any complex objects in this component.
        'metadata',

        // For edge
        'multiple',
        'relid',
        'reltype',
        'source',
        'target',
        'id',
      ]);

      const items = Object.keys(dataSource)
        .sort()
        .map((key) => {
          const v = dataSource[key];
          if (v) {
            return (
              <Descriptions.Item
                key={Math.random()}
                label={voca.titleCase(key.replace(/_/g, ' '))}
                style={{ height: '50px', overflowY: 'scroll' }}
              >
                {formatItem(key, v)}
              </Descriptions.Item>
            );
          } else {
            return null;
          }
        });

      return items.length > 0 ? (
        <Descriptions
          size={'small'}
          column={1}
          title={null}
          bordered
          style={mergeStyle}
          key={Math.random()}
        >
          {items}
        </Descriptions>
      ) : (
        <span style={style}>No Properties</span>
      );
    };

    useEffect(() => {
      if (data.multiple) {
        const allEdges = graph.getEdges();
        const currectEdges = allEdges.filter((edge) => {
          return (
            (edge.getModel().source == data.source && edge.getModel().target == data.target) ||
            (edge.getModel().source == data.target && edge.getModel().target == data.source)
          );
        });
        const sortedCurrentEdges = sortBy(currectEdges, (edge) => {
          return edge.getModel().reltype;
        });

        const items = sortedCurrentEdges.map((edge, index) => {
          return {
            key: index.toString(),
            // @ts-ignore
            label: (
              <span>
                {edge.getModel().reltype}
                {/* @ts-ignore */}
                <br />[{edge.getModel().data?.source_id} -&gt; {edge.getModel().data?.target_id}]
              </span>
            ),
            children: buildHoverTextComponent(edge.getModel()),
          };
        });

        setMultipleEdges(items);
      }
    }, [data]);

    if (data.multiple) {
      if (multipleEdges.length > 0) {
        console.log('HoverText - multiple: ', data, multipleEdges);

        return (
          <Collapse
            defaultActiveKey={['0']}
            items={multipleEdges}
            accordion
            onChange={handleChange}
            activeKey={activeKey}
          />
        );
      } else {
        return <span style={style}>No Properties</span>;
      }
    } else {
      return buildHoverTextComponent(data);
    }
  };

  const onChangeLegend = (checkedValue: LegendOptionType, options: LegendOptionType[]) => {
    console.log(checkedValue, options);
  };

  const changeLayout = (newLayout: Layout) => {
    // For updating the layout settings
    setLayout({ ...layout, ...newLayout });

    if (ref.current) {
      // @ts-ignore
      const graph = ref.current.graph;
      graph.updateLayout({ type: newLayout.type, ...newLayout.options, center: [0, 0] });
      console.log('changeLayout: ', newLayout);
      graph.layout();
    }
  };

  // All initializations
  // Save the node or edge when the context menu is clicked.
  useEffect(() => {
    initEvents();

    // @ts-ignore
    const graph = ref.current?.graph;
    if (graph) {
      graph.getCustomUndoStack = () => {
        return undoStack;
      }
      graph.pushCustomStack = pushUndoStack;
      // It will cause the application build failed. why?
      // graph.saveGraphData = saveGraphData;
    }
  }, []);

  useEffect(() => {
    if (props.layout) {
      // setLayout({ ...layout, ...props.layout });
      changeLayout(props.layout);
      pushUndoStack('layoutChanged');
    }
  }, [props.layout]);

  useEffect(() => {
    if (props.prompts) {
      const nodePrompts = props.prompts.filter((item) => {
        return item.type == 'node';
      });

      const edgePrompts = props.prompts.filter((item) => {
        return item.type == 'edge';
      });

      const subgraphPrompts = props.prompts.filter((item) => {
        return item.type == 'subgraph';
      });

      setNodePrompts(nodePrompts);
      setEdgePrompts(edgePrompts);
      setSubgraphPrompts(subgraphPrompts);
    }
  }, [props.prompts]);

  useEffect(() => {
    // We need to clear the focused nodes when the interactive mode is changed.
    // otherwise the focused nodes will be kept and make the focus mode not work.
    setFocusedNodes([]);
  }, [settings.interactiveMode]);

  useEffect(() => {
    if (data.nodes.length > 0) {
      // create a map to hold the adjacency list
      const adjacencyList = new Map();
      for (const node of data.nodes) {
        adjacencyList.set(node.id, []);
      }
      for (const edge of data.edges) {
        adjacencyList.get(edge.source).push(edge.target);
        adjacencyList.get(edge.target).push(edge.source);
      }
      setAdjacencyList(adjacencyList);

      if (ref.current) {
        // @ts-ignore
        const graph = ref.current.graph;
        const oldData = graph.save();

        // If the graph has no positions, we need to change the layout to the default layout.
        console.log(
          'GraphinWrapper: ',
          oldData,
          data,
          hasPositions(oldData),
          hasPositions(data),
          graph.getGraphCenterPoint(),
          graph.getDefaultCfg(),
          graph.getMinZoom(),
          graph.getMaxZoom(),
        );

        const updatedData = findUpdatedData(oldData, data);

        // In this function, we only need to push when the graph has new nodes or edges. Other changes will be pushed in the event listener. such as node:dragstart, canvas:dragend, etc.
        if (updatedData.addedData.nodes.length > 0 || updatedData.subtractedData.edges.length > 0) {
          pushUndoStack('dataChanged');
        }

        // The order is important. We need to change the layout first, then update the graph data. At last, we need to set the matrix for the layout.
        if (!hasPositions(oldData) && !hasPositions(data)) {
          changeLayout(defaultLayout);
        } else {
          // We prefer to use the preset layout when the graph has new nodes and the old graph data has positions.
          // After the graph data are updated, we will update the positions of the new nodes manually.
          console.log('Use the preset layout: ', presetLayout, props.layout, layout);
          changeLayout(presetLayout);
        }

        graph.data(updatedData.data);
        graph.render();

        if (!hasPositions(oldData) && !hasPositions(data)) {
          console.log("This is default layout, so we need to move the graph to the center.");
          graph.refreshPositions();
          graph.fitCenter();
        }

        // We expect to get the matrix only when loading a graph from the local storage.
        if (props.layout?.matrix) {
          console.log('Set the matrix for the layout: ', props.layout.matrix);
          restoreMatrix(graph, props.layout.matrix);
        }

        if (matrix) {
          console.log('Set the internal matrix for the layout: ', matrix);
          restoreMatrix(graph, matrix);
        }

        console.log(
          'GraphinWrapper addData: ',
          updatedData,
          data,
          oldData,
          graph.getNodes(),
          graph.getEdges(),
        );

        // If the oldData has no nodes, it means the graph is empty, so we don't need to refresh the node position.
        // If the updatedData has no added nodes, it means the graph has no new nodes, so we don't need to refresh the node position.
        if (updatedData.addedData.nodes.length > 0 && oldData.nodes.length > 0) {
          refreshAddedNodePosition(updatedData.addedData, data);
        }
      }
    }
  }, [data]);

  return (
    <Graphin
      ref={ref}
      layoutCache={false}
      enabledStack={false}
      animate={true}
      data={{} as GraphinData}
      // We will set the layout manually for more flexibility.
      layout={{} as Layout}
      style={style}
      // You can increase the maxStep if you want to save more history steps.
      maxStep={50}
      willUnmount={() => {
        // We don't need to save the graph data when the graph is empty
        // TODO: Need to test whether it works.
        // @ts-ignore
        if (props.data.nodes.length > 0 || ref.current?.graph?.getNodes().length > 0) {
          console.log("GraphinWrapper will unmount, so we need to save the graph data.");
          saveToLocalStorage(graphData, width, height, matrix);
        }
      }}
    >
      {/* TODO: Cannot work. To expect all linked nodes follow the draged node. */}
      {/* <DragNode /> */}
      <ZoomCanvas />
      {settings.selectionMode == 'lasso-select' ? <LassoSelect /> : null}
      {settings.selectionMode == 'brush-select' ? <BrushSelect /> : null}
      <NodeLabelVisible visible={settings.nodeLabelVisible} />
      {/* BUG: Cannot restore the label of edges */}
      <EdgeLabelVisible visible={settings.edgeLabelVisible} />
      <FishEye options={{}} visible={fishEyeVisible} handleEscListener={onCloseFishEye} />
      <HighlightNodeEdge
        selectedNodes={selectedNodes || []}
        selectedEdges={selectedEdges || []}
      />
      {settings.interactiveMode == 'show-paths' ? <CustomHoverable bindType="node" /> : null}
      {settings.interactiveMode == 'show-paths' ? <CustomHoverable bindType="edge" /> : null}
      {settings.interactiveMode == 'show-paths' ? <ActivateRelations /> : null}
      <ContextMenu style={{ width: '160px' }} bindType="node">
        <NodeMenu
          nodePrompts={nodePrompts}
          subgraphPrompts={subgraphPrompts}
          chatbotVisible={props.chatbotVisible}
          item={currentNode}
          onChange={(menuItem, data, graph, graphin) => {
            // Clear the current node when the context menu is closed, elsewise the node menu cannot be opened again.
            setCurrentNode(null);
            onNodeMenuClick && onNodeMenuClick(menuItem, data, graph, graphin);
          }}
        />
      </ContextMenu>
      <ContextMenu style={{ width: '160px' }} bindType="canvas">
        <CanvasMenu
          handleOpenFishEye={handleOpenFishEye}
          onCanvasClick={(menuItem, graph, graphin) => {
            // Clear the current node & edge when the context menu is closed
            setCurrentNode(null);
            setCurrentEdge(null);
            onCanvasMenuClick && onCanvasMenuClick(menuItem, graph, graphin);
          }}
          onClearGraph={props.onClearGraph}
        />
      </ContextMenu>
      <ContextMenu style={{ width: '160px' }} bindType="edge">
        <EdgeMenu
          prompts={edgePrompts}
          item={currentEdge}
          chatbotVisible={props.chatbotVisible}
          onChange={(menuItem, source, target, edge, graph, apis) => {
            // Clear the current edge when the context menu is closed, elsewise the edge menu cannot be opened again.
            setCurrentEdge(null);

            // TODO: How to generate explanation report for the edge?
            if (menuItem.key == 'explain-relationship') {
              setCurrentEdge(edge);
              setExplanationPanelVisible(true);
            }

            if (onEdgeMenuClick) {
              onEdgeMenuClick(menuItem, source, target, edge, graph, apis);
            }
          }}
        />
      </ContextMenu>
      <Legend bindType="node" sortKey="nlabel">
        {(renderProps: LegendChildrenProps) => {
          console.log('renderProps', renderProps);
          return <Legend.Node {...renderProps} onChange={onChangeLegend} />;
        }}
      </Legend>

      <NodeSearcherPanel
        // Don't use the saveGraphData function here, we would like to save the graph data from the undo stack directly.
        saveGraphDataFn={props.onDataChanged}
        changeSelectedEdges={props.changeSelectedEdges}
        changeSelectedNodes={props.changeSelectedNodes}
      />

      {settings.interactiveMode == 'show-paths' ? (
        <FocusBehavior
          queriedId={props.queriedId}
          onClickNode={onClickNodeInFocusMode}
          mode={'focus'}
        />
      ) : null}

      {settings.interactiveMode == 'select-nodes' ? (
        <FocusBehavior
          queriedId={props.queriedId}
          onClickNode={onClickNodeInFocusMode}
          mode={'select'}
        />
      ) : null}

      {/* Only work at focus mode */}
      {settings.interactiveMode == 'show-paths' ? (
        <>
          <ShowPaths
            selectedNodes={focusedNodes}
            nodes={data.nodes}
            edges={data.edges}
            onClosePathsFinder={onClosePathsFinder}
            adjacencyList={adjacencyList}
            // TODO: hard code here, need to be fixed. If you choose dfs, it will be very slow. But we can get all paths. How to improve the performance or get all paths by using other methods?
            algorithm={data.edges.length > 1000 ? 'bfs' : 'dfs'}
            explainPath={props.askLlmFn}
          />
        </>
      ) : null}
      {
        // TODO: generate explanations for the current edge
        // 1. Get the current edge, the source node and target node
        // 2. Send the source node and target node to the backend and get the prompt (markdown format) which contains the prompt and api codes for retrieving context information
        // 3. Send the markdown to the backend and get the filled markdown
        // 4. Send the filled markdown to LLM and generate explanations by using `rethinking with retrieval` method
        // 5. Show the filled markdown in the explanation panel
        currentEdge && explanationPanelVisible ? (
          <Moveable
            onClose={() => {
              setExplanationPanelVisible(false);
            }}
          >
            <p>
              TODO: generate explanations for the current edge
              <br />
              1. Get the current edge, the source node and target node
              <br />
              2. Send the source node and target node to the backend and get the prompt (markdown
              format) which contains the prompt and api codes for retrieving context information
              <br />
              3. Send the markdown to the backend and get the filled markdown
              <br />
              4. Send the filled markdown to LLM and generate explanations by using `rethinking
              with retrieval` method
              <br />
              5. Show the filled markdown in the explanation panel
              <br />
            </p>
          </Moveable>
        ) : null
      }
      {settings.interactiveMode == 'select-nodes' ? (
        <ClickSelect multiple={true} trigger={'shift'}></ClickSelect>
      ) : null}
      {settings.interactiveMode == 'show-details' ? (
        <NodeClickBehavior onClick={props.onClickNode}></NodeClickBehavior>
      ) : null}
      {settings.interactiveMode == 'show-details' ? (
        <EdgeClickBehavior onClick={props.onClickEdge}></EdgeClickBehavior>
      ) : null}
      {settings.nodeTooltipEnabled ? (
        <Tooltip bindType="node" placement="bottom" style={{ opacity: 0.9 }}>
          {(value: TooltipValue) => {
            if (value.model) {
              const { model } = value;
              return (
                <HoverText
                  data={model}
                  style={{ padding: '10px', width: 'fit-content', maxWidth: '400px' }}
                ></HoverText>
              );
            }
            return null;
          }}
        </Tooltip>
      ) : null}
      {settings.edgeTooltipEnabled ? (
        <Tooltip bindType="edge" placement="bottom" style={{ opacity: 0.9 }}>
          {(value: TooltipValue) => {
            if (value.model) {
              const { model } = value;
              return (
                <HoverText
                  data={model}
                  style={{
                    padding: '10px',
                    width: 'fit-content',
                    maxWidth: '400px',
                    minWidth: 'fit-content',
                  }}
                ></HoverText>
              );
            }
            return null;
          }}
        </Tooltip>
      ) : null}
      {settings.miniMapEnabled ? <MiniMap /> : null}
      {settings.snapLineEnabled ? <SnapLine options={snapLineOptions} visible /> : null}
      {settings.infoPanelEnabled ? (
        <StatisticsDataArea
          data={props.statistics}
          style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            zIndex: 1,
          }}
        ></StatisticsDataArea>
      ) : null}
      <CustomGraphinContext.Provider
        value={{
          // @ts-ignore
          graph: ref.current?.graph,
          // @ts-ignore
          apis: ref.current?.apis,
          selectedNodes: focusedNodes,
        }}
      >
        {props.children ? props.children : null}
      </CustomGraphinContext.Provider>
    </Graphin>
  );
};

export default GraphinWrapper;
