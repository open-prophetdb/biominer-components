import { GraphinContext } from '@antv/graphin';
import React, { useContext, useEffect, useState } from 'react';
import type { GraphNode, GraphEdge, GraphData, APIs, LlmResponse } from '../../typings';
import type { AdjacencyList } from '../typings';
import { message, Button, Table, Row, Space, notification, Input } from 'antd';
import Movable from '../../Moveable';
import type { InputRef } from 'antd';
import type { FilterConfirmProps } from 'antd/es/table/interface';
// @ts-ignore
import Highlighter from 'react-highlight-words';
import { ClearOutlined, TableOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import { sortBy, uniqBy } from 'lodash';
import MarkdownViewer from '../../MarkdownViewer';
import { cleanGraphData } from '../utils';

import './ShowPaths.less';

type ShowPathProps = {
  selectedNodes: GraphNode[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  algorithm: 'bfs' | 'dfs'; // algorithm to use for finding paths, either bfs or dfs. Recommended bfs if there are many paths, such as in a graph which is more than 150 edges.
  adjacencyList: AdjacencyList; // adjacency list
  onClosePathsFinder: () => void;
  explainPath?: APIs["AskLlmFn"];
};

type PathItem = {
  key: string;
  index: number;
  nsteps: number;
  path: string;
  description?: string;
};

function findAllPathsBFS(
  startNodeId: string,
  endNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  adjacencyList: AdjacencyList,
) {
  const allPaths: {
    nodes: string[];
    edges: string[];
  }[] = [];

  // queue of nodes to visit
  const queue: {
    nodeId: string;
    path: string[];
  }[] = [{ nodeId: startNodeId, path: [startNodeId] }];

  // set of visited nodes
  const visited = new Set([startNodeId]);

  // keep track of all paths explored so far
  const exploredPaths = new Set();

  while (queue.length > 0) {
    const { nodeId, path } = queue.shift()!;

    if (nodeId === endNodeId) {
      // found a path
      const nodesInPath = path.map((nodeId) => {
        const node = nodes.find((node) => node.id === nodeId);
        if (node) {
          return node.id;
        } else {
          return nodes[0].id;
        }
      });
      const edgesInPath = [];
      for (let i = 1; i < path.length; i++) {
        const startNode = nodes.find((node) => node.id === path[i - 1]);
        const endNode = nodes.find((node) => node.id === path[i]);
        if (startNode && endNode) {
          const edge = edges.find(
            (edge) =>
              (edge.source === startNode.id && edge.target === endNode.id) ||
              (edge.source === endNode.id && edge.target === startNode.id),
          );
          if (edge) {
            edgesInPath.push(edge.relid);
          } else {
            edgesInPath.push('');
          }
        }
      }
      const pathKey = nodesInPath.join(',') + ':' + edgesInPath.join(',');
      if (!exploredPaths.has(pathKey)) {
        allPaths.push({ nodes: nodesInPath, edges: edgesInPath });
        exploredPaths.add(pathKey);
      }
    } else {
      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push({ nodeId: neighborId, path: [...path, neighborId] });
        }
      }
    }
  }

  return allPaths;
}

// function to find all paths between a given set of nodes
function findAllPathsDFS(
  startNodeId: string,
  endNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  adjacencyList: AdjacencyList,
) {
  // array to hold the current path
  const currentPath: string[] = [];

  // array to hold all paths
  const allPaths: {
    nodes: string[];
    edges: string[];
  }[] = [];

  // function to perform depth-first search
  function dfs(currentNodeId: string) {
    currentPath.push(currentNodeId);
    if (currentNodeId === endNodeId) {
      allPaths.push({
        nodes: currentPath.map((nodeId) => {
          const node = nodes.find((node) => node.id === nodeId);
          if (node) {
            return node.id;
          } else {
            // Never happens
            return nodes[0].id;
          }
        }),
        edges: currentPath.slice(1).map((nodeId, index) => {
          const startNode = nodes.find((node) => node.id === currentPath[index]);
          const endNode = nodes.find((node) => node.id === nodeId);
          if (startNode && endNode) {
            const edge = edges.find(
              (edge) =>
                (edge.source === startNode.id && edge.target === endNode.id) ||
                (edge.source === endNode.id && edge.target === startNode.id),
            );
            if (edge) {
              return edge.relid;
            } else {
              return '';
            }
          } else {
            // Never happens
            return '';
          }
        }),
      });
    } else {
      const n = adjacencyList.get(currentNodeId) || [];
      for (const neighborId of n) {
        // TODO: hard coded to 3 steps for now, if more than 3 steps, don't add to path
        if (!currentPath.includes(neighborId) && currentPath.length <= 3) {
          dfs(neighborId);
        }
      }
    }
    currentPath.pop();
  }

  dfs(startNodeId);
  // TODO: how to add current node to path? if no path found, show current node
  return allPaths;
}

type Path = { nodes: string[]; edges: string[] };

const ShowPaths = (props: ShowPathProps) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = React.useRef<InputRef>(null);

  const pathTableRef = React.useRef<HTMLDivElement>(null);
  const { graph } = useContext(GraphinContext);
  const [paths, setPaths] = useState<Record<string, Path[]>>({});
  const [algorithm, setAlgorithm] = useState<Record<string, 'bfs' | 'dfs'>>({});

  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [pathTableVisible, setPathTableVisible] = useState<boolean>(false);
  const [pathTableData, setPathTableData] = useState<PathItem[]>([]);
  const [pathExplainingData, setPathExplainingData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const savePathExplainingDataToLS = (path: string, description: string) => {
    const data = { ...pathExplainingData };
    data[path] = description;
    setPathExplainingData(data);
    localStorage.setItem('pathExplainingData', JSON.stringify(data));
  }

  const loadPathExplainingDataFromLS = () => {
    const data = localStorage.getItem('pathExplainingData');
    if (data) {
      try {
        setPathExplainingData(JSON.parse(data));
      } catch (e) {
        setPathExplainingData({});
        console.error('Failed to parse path explaining data from local storage', e);
      }
    }
  }

  useEffect(() => {
    loadPathExplainingDataFromLS();
  }, []);

  useEffect(() => {
    if (props.selectedNodes.length <= 1) {
      return;
    }

    let path_str = props.selectedNodes[0].id;
    for (const item of props.selectedNodes) {
      const ids_key = path_str + '_' + item.id;
      if (!paths[ids_key]) {
        // Use BFS if graph is large, DFS otherwise
        // TODO: faster way to find paths?
        const findAllPaths = props.algorithm == 'bfs' ? findAllPathsBFS : findAllPathsDFS;
        // const findAllPaths = props.edges.length < 100 ? findAllPathsDFS : findAllPathsBFS;

        const npaths = findAllPaths(
          props.selectedNodes[0].id,
          item.id,
          props.nodes,
          props.edges,
          props.adjacencyList,
        );

        setPaths((prev) => {
          return {
            ...prev,
            [ids_key]: npaths,
          };
        });

        setAlgorithm((prev) => {
          return {
            ...prev,
            [ids_key]: props.algorithm,
          };
        });
      }
    }
  }, [props.selectedNodes]);

  useEffect(() => {
    const data: PathItem[] = [];
    for (const pathKey of Object.keys(paths)) {
      for (let i = 0; i < paths[pathKey].length; i++) {
        data.push({
          key: pathKey,
          index: i,
          path: paths[pathKey][i].nodes
            .map((nodeId) => {
              const node = props.nodes.find((node) => node.id === nodeId);
              if (node) {
                return node.data.name;
              } else {
                // Never happens
                return 'Unknown';
              }
            })
            .join(' -> '),
          nsteps: paths[pathKey][i].edges.length,
        });
      }
    }

    setPathTableData(uniqBy(sortBy(data, ['nsteps']), 'path'));
  }, [paths]);

  const getNodesEdges = (path: Path): GraphData => {
    const nodes = props.nodes.filter((node) => path.nodes.includes(node.id));
    const edges = props.edges.filter((edge) => path.edges.includes(edge.relid));
    return { nodes, edges };
  }

  const handleShowPath = (paths: Path[]) => {
    clearStatus();

    const anyPaths = paths.some((path) => path.nodes.length > 0);
    if (paths.length === 0 || !anyPaths) {
      message.warning('No path found');
    }

    const allNodes = [...new Set(paths.flatMap((path) => path.nodes))];
    const allEdges = [...new Set(paths.flatMap((path) => path.edges))];

    const nodes = graph.getNodes();
    nodes.forEach((node) => {
      const model = node.getModel() as GraphNode;
      if (model.id && !allNodes.includes(model.id)) {
        graph.setItemState(node, 'inactive', true);
      } else {
        graph.setItemState(node, 'active', true);
      }
    });

    const edges = graph.getEdges();
    edges.forEach((edge) => {
      const model = edge.getModel() as GraphEdge;
      if (model.relid && !allEdges.includes(model.relid)) {
        graph.setItemState(edge, 'inactive', true);
      } else {
        graph.setItemState(edge, 'active', true);
      }
    });
  }

  const clearStatus = () => {
    const nodes = graph.getNodes();
    nodes.forEach((node) => {
      graph.setItemState(node, 'inactive', false);
    });

    const edges = graph.getEdges();
    edges.forEach((edge) => {
      graph.setItemState(edge, 'inactive', false);
    });
  }

  const handleClear = (paths: Path[]) => {
    const allNodes = [...new Set(paths.flatMap((path) => path.nodes))];
    const allEdges = [...new Set(paths.flatMap((path) => path.edges))];

    const nodes = graph.getNodes();
    nodes.forEach((node) => {
      const model = node.getModel();
      if (model.id && !allNodes.includes(model.id)) {
        graph.setItemState(node, 'inactive', false);
      } else {
        graph.setItemState(node, 'active', false);
      }
    });

    const edges = graph.getEdges();
    edges.forEach((edge) => {
      const model = edge.getModel() as GraphEdge;
      if (model.relid && !allEdges.includes(model.relid)) {
        graph.setItemState(edge, 'inactive', false);
      } else {
        graph.setItemState(edge, 'active', false);
      }
    });
  }

  const onClosePathsFinder = () => {
    setPaths({});
    props.onClosePathsFinder();
  };

  const onShowPathsInTable = (currentStatus: boolean) => {
    setPathTableVisible(!currentStatus);
  };

  const ItemList = () => {
    if (props.selectedNodes.length <= 1) {
      return null;
    }

    let path_str = props.selectedNodes[0].id;
    return props.selectedNodes.map((node) => {
      const ids_key = path_str + '_' + node.id;
      return (
        // eslint-disable-next-line react/no-array-index-key
        <li
          key={ids_key}
          className={algorithm[ids_key]}
          onMouseEnter={() => {
            handleShowPath(paths[ids_key]);
          }}
          onMouseLeave={() => {
            handleClear(paths[ids_key]);
          }}
        >
          <span>{node.data.name}</span>
          &nbsp;
          <span>{algorithm[ids_key] === 'bfs' ? 'BFS' : 'DFS'}</span>
        </li>
      );
    });
  };

  type DataIndex = keyof PathItem;

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<PathItem> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      if (record && record[dataIndex]) {
        // @ts-ignore
        return record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase());
      } else {
        return false;
      }
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<PathItem> = [
    {
      title: 'Path',
      key: 'path',
      align: 'center',
      dataIndex: 'path',
      width: 300,
      ...getColumnSearchProps('path'),
    },
    {
      title: 'Num of Steps',
      dataIndex: 'nsteps',
      key: 'nsteps',
      align: 'center',
      width: 150,
      sorter: (a, b) => a.nsteps - b.nsteps,
      sortDirections: ['descend', 'ascend'],
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 150,
      render: (_, record, index) => (
        <Space>
          <Button
            size="small"
            type="link"
            disabled={record.path === currentPath}
            onClick={(e) => {
              const pathKey = record.key;
              const pathIndex = record.index;
              // Which path to show, maybe multiple paths in paths variable for each key
              const path = [paths[pathKey][pathIndex]];
              // TODO: more efficient way to handle this?
              handleShowPath(path);
              setCurrentPath(record.path);
            }}
          >
            Show
          </Button>
          <Button
            size="small"
            type="link"
            onClick={(e) => {
              const pathKey = record.key;
              const pathIndex = record.index;
              const subgraph = getNodesEdges(paths[pathKey][pathIndex]);

              if (props.explainPath) {
                const description = pathExplainingData[record.path];
                if (description) {
                  const data = [...pathTableData];
                  data[index].description = description;
                  setPathTableData(data);
                } else {
                  setLoading(true);
                  // TODO: Temporary usecase, do we need to use more specific api or not?
                  console.log('Explain the path', record.path, subgraph);
                  props.explainPath({
                    prompt_template_id: 'explain_path_within_subgraph',
                  }, {
                    subgraph_with_ctx: {
                      context_str: record.path,
                      subgraph: JSON.stringify(cleanGraphData(subgraph)),
                    }
                  }).then((llmresponse: LlmResponse) => {
                    const data = [...pathTableData];
                    data[index].description = llmresponse.response;
                    setPathTableData(data);
                    savePathExplainingDataToLS(record.path, description);
                    setLoading(false);
                    message.success('Explain the path successfully, you can click the `+` button before the path to see the explanation.', 3);
                  }).catch((e) => {
                    console.error('Failed to explain the path', e);
                    message.error('Failed to explain the path, please try again later.');
                    setLoading(false);
                  })
                }
              } else {
                notification.open({
                  type: 'info',
                  message: 'Explain the Current Path',
                  description:
                    'Not opened yet (This function is using a LLM with knowledge graph to explain why the path would be believable)',
                  duration: 10,
                });
              }
            }}
          >
            Explain
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="show-paths-panel">
      <div className="title">
        <h3>Paths Finder</h3>
        <span>
          <TableOutlined onClick={() => onShowPathsInTable(pathTableVisible)} />
          <ClearOutlined onClick={onClosePathsFinder} />
        </span>
      </div>
      <ul className="status-ul body">{ItemList()}</ul>
      {pathTableVisible ? (
        <Movable
          title="Path Table"
          onClose={() => {
            setCurrentPath(null);
            setPathTableVisible(false);
          }}
          width="600px"
        >
          <Table
            loading={loading}
            className="path-table"
            rowKey={(item) => {
              return `${item.index}-${item.path}`;
            }}
            columns={columns}
            dataSource={pathTableData}
            // @ts-ignore - TODO: fix this
            ref={pathTableRef}
            scroll={{ y: 200 }}
            size="small"
            pagination={{
              simple: true,
              defaultPageSize: 1000,
              position: ['topLeft'],
              showTotal: (total) => {
                return `Total ${total} items`;
              },
            }}
            expandable={{
              expandedRowRender: (record) => <MarkdownViewer markdown={
                record.description || 'Please click the `Explain` button to generate an explainable description for this path.'
              } />,
              rowExpandable: (record) => record.description !== undefined,
              expandedRowKeys: pathTableData.filter((item) => {
                return item.description !== undefined;
              }).map((item) => {
                return `${item.index}-${item.path}`
              })
            }}
          />
        </Movable>
      ) : null}
    </div>
  );
};

export default ShowPaths;
