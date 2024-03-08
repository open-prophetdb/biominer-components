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
} from '@ant-design/icons';

type NodeSearcherProps = {
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
              if (undoStack.length === 0) {
                message.info('No more undo');
              };

              console.log('NodeSearcherPanel- undoStack: ', undoStack);
              const undoData = undoStack.pop();
              graph.changeData(undoData, false);
            }}
          />
        </Tooltip>
        <Tooltip title="Auto Zoom">
          <Button
            shape="circle"
            icon={<DragOutlined />}
            onClick={() => {
              apis && apis.handleAutoZoom();
            }}
          />
        </Tooltip>
        <Tooltip title="Zoom In">
          <Button
            shape="circle"
            icon={<ZoomInOutlined />}
            onClick={() => {
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
              apis && apis.handleZoomIn();
            }}
          />
        </Tooltip>
        <Tooltip title="Fit Center">
          <Button
            shape="circle"
            icon={<ColumnWidthOutlined />}
            onClick={() => {
              graph && graph.fitCenter(true);
            }}
          />
        </Tooltip>
        <Tooltip title="Only Clear Canvas">
          <Button
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => {
              graph && graph.clear();
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
        showArrow={true}
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
