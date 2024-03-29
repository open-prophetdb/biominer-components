import React, { useContext, useState, memo, useEffect } from 'react';
import { GraphinContext } from '@antv/graphin';
import { NodeConfig } from '@antv/g6';
import type { GraphNode, GraphEdge } from '../../typings';
import { Button, Row, Select, Empty, Tooltip, message } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  DragOutlined,
  FileJpgOutlined,
  ColumnWidthOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  StepBackwardOutlined,
  UndoOutlined,
  SaveOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { getMatrix, restoreMatrix, saveToLocalStorage } from '../utils';

type NodeSearcherProps = {
  saveGraphDataFn?: (graphData: { nodes: GraphNode[]; edges: GraphEdge[] }, width: number, height: number, matrix: any) => void;
  changeSelectedNodes?: (selectedNodes: string[]) => void;
  changeSelectedEdges?: (selectedEdges: string[]) => void;
};

const NodeSearcher: React.FC<NodeSearcherProps> = (props) => {
  const { graph, apis } = useContext(GraphinContext);

  const [searchLoading, setSearchLoading] = useState(false);
  const [nodeOptions, setNodeOptions] = useState<any[]>([]);

  const handleNodeSelectorChange = (value: string) => {
    console.log('handleNodeSelectorChange: ', value);
    if (value) {
      apis.focusNodeById(value);
    }
  };

  const handleNodeSearch = (value: string) => {
    console.log('handleNodeSearch: ', value);
    setSearchLoading(true);
    if (value) {
      const nodeOptions: any[] = [];
      graph.getNodes().forEach((node) => {
        const model = node.getModel() as NodeConfig & GraphNode;
        console.log('handleNodeSearch: ', model);
        if (
          (model.label && model.label.toLowerCase().includes(value.toLowerCase())) ||
          (model.data.name && model.data.name.toLowerCase().includes(value.toLowerCase()))
        ) {
          nodeOptions.push({
            label: `${model.id} | ${model.data.name}`,
            value: model.id,
          });
        }
      });
      setNodeOptions(nodeOptions);
      setSearchLoading(false);
    } else {
      setNodeOptions([]);
      setSearchLoading(false);
    }
  };

  return (
    <Row className="node-searcher">
      <ButtonGroup>
        <Tooltip title="Undo">
          <Button
            shape="circle"
            icon={<UndoOutlined />}
            onClick={() => {
              // @ts-ignore
              const undoStack = graph.getCustomUndoStack();
              const undoData = undoStack.pop();
              console.log('NodeSearcherPanel- undoStack: ', undoStack, undoData);
              let data = undoData?.data;
              let matrix = undoData?.matrix;

              if (data) {
                restoreMatrix(graph, matrix);
                // We must set the layout type to preset before updating the graph data, otherwise it will layout twice.
                graph.updateLayout({
                  type: 'preset',
                });
                graph.changeData(data, false);
              }

              if (undoStack.length === 0) {
                message.info('No more undo');
                // We must update the graph data into the KnowledgeGraph component when the graph data are empty, otherwise it will mess up some operations in the future.
                props.saveGraphDataFn && props.saveGraphDataFn({ nodes: [], edges: [] }, graph.getWidth(), graph.getHeight(), getMatrix(graph));
              }
            }}
          />
        </Tooltip>
        <Tooltip title="Save to Local Storage">
          <Button
            shape="circle"
            icon={<SaveOutlined />}
            onClick={() => {
              // @ts-ignore
              saveToLocalStorage(graph.save(), graph.getWidth(), graph.getHeight(), getMatrix(graph));
              message.success(<span>Your graph data has been saved to the local storage temporarily.</span>, 5);
            }}
          />
        </Tooltip>
        <Tooltip title="Auto Zoom">
          <Button
            shape="circle"
            icon={<DragOutlined />}
            onClick={() => {
              // @ts-ignore
              graph && graph.pushCustomStack();
              apis && apis.handleAutoZoom();
            }}
          />
        </Tooltip>
        <Tooltip title="Zoom In">
          <Button
            shape="circle"
            icon={<ZoomInOutlined />}
            onClick={() => {
              // @ts-ignore
              graph && graph.pushCustomStack();
              // TODO: Why is this not consistent with the icon?
              apis && apis.handleZoomOut();
            }}
          />
        </Tooltip>
        <Tooltip title="Zoom Out">
          <Button
            shape="circle"
            icon={<ZoomOutOutlined />}
            onClick={() => {
              // @ts-ignore
              graph && graph.pushCustomStack();
              apis && apis.handleZoomIn();
            }}
          />
        </Tooltip>
        <Tooltip title="Fit Center">
          <Button
            shape="circle"
            icon={<ColumnWidthOutlined />}
            onClick={() => {
              // @ts-ignore
              graph && graph.pushCustomStack();
              graph && graph.fitCenter(true);
            }}
          />
        </Tooltip>
        <Tooltip title="Download Graph As Image">
          <Button
            shape="circle"
            icon={<FileJpgOutlined />}
            onClick={() => {
              const dateName = new Date().toISOString().replace(/:/g, '-');
              graph &&
                graph.downloadFullImage(`knowledge-graph-${dateName}`, 'image/png', {
                  backgroundColor: '#fff',
                  padding: 20,
                });
            }}
          />
        </Tooltip>
      </ButtonGroup>
      <Select
        showSearch
        allowClear
        loading={searchLoading}
        defaultActiveFirstOption={false}
        placement={'topRight'}
        placeholder={'Search nodes'}
        getPopupContainer={(triggerNode) => {
          return triggerNode.parentNode;
        }}
        onSearch={handleNodeSearch}
        onChange={handleNodeSelectorChange}
        options={nodeOptions}
        filterOption={false}
        notFoundContent={
          <Empty
            description={
              searchLoading
                ? 'Searching...'
                : nodeOptions !== undefined
                  ? 'Not Found or Too Short Input'
                  : `Enter your interested node ...`
            }
          />
        }
      ></Select>
    </Row>
  );
};

export default memo(NodeSearcher);
