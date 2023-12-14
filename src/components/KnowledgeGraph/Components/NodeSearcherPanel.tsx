import React, { useContext, useState, memo } from 'react';
import { GraphinContext } from '@antv/graphin';
import { NodeConfig } from '@antv/g6';
import type { GraphNode, GraphEdge } from '../../typings';
import { Button, Row, Select, Empty } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import UndoRedo from './UndoRedo';

type NodeSearcherProps = {
  changeSelectedNodes?: (selectedNodes: string[]) => void;
  changeSelectedEdges?: (selectedEdges: string[]) => void;
};

const NodeSearcher: React.FC<NodeSearcherProps> = (props) => {
  const { graph, apis } = useContext(GraphinContext);
  const { undo, getUndoStack, redo, getRedoStack } = UndoRedo();

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
        <Button
          shape="default"
          icon={<UndoOutlined />}
          onClick={() => {
            undo(
              (nodes) => {
                props.changeSelectedNodes && props.changeSelectedNodes(nodes);
              },
              (edges) => {
                props.changeSelectedEdges && props.changeSelectedEdges(edges);
              },
            );
          }}
          // The first item in the stack is the initial layout, so we don't need to undo it.
          disabled={getUndoStack().length <= 1}
        >
          Back [{getUndoStack().length - 1}]
        </Button>
        <Button
          shape="default"
          icon={<RedoOutlined />}
          onClick={() => {
            redo(
              (nodes) => {
                props.changeSelectedNodes && props.changeSelectedNodes(nodes);
              },
              (edges) => {
                props.changeSelectedEdges && props.changeSelectedEdges(edges);
              },
            );
          }}
          disabled={getRedoStack().length < 1}
        >
          Forward
        </Button>
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
