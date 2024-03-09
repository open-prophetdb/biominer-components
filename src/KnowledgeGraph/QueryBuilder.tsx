import React, { useState, useEffect } from 'react';
import { Row, Empty, Select, Button, Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { APIs, OptionType } from '../typings';
import { fetchNodes } from '../utils';
import './QueryBuilder.less';
import { uniq } from 'lodash';
import MarkdownViewer from '../MarkdownViewer';

const helpDoc = `
- **Explain Subgraph with ChatGPT**: Right-click on a disease node to see more actions, such as "Explain Subgraph in Context (Experimental)". This will use ChatGPT to explain the subgraph in the context of the selected disease. It might take a little bit longer to get the response.
- **Drag**: Hold the left mouse button and drag to move the graph.
- **Zoom**: Use the mouse wheel to zoom in or out or use the buttons on the bottom right corner.
- **Select**: Click on a node to select it. Hold the Shift key and click on another node to select multiple nodes. Click on the background to deselect all nodes.
- **Multi-Select**: Hold the Shift key and drag the mouse to select multiple nodes.
- **Search**: Use the search box to search for nodes by their names/ids.
- **Advanced Search**: Use the "Upload / Query" button to perform more complex queries. If you have your own data, such as DEGs, you can use "Batch Query" to upload your data and search for them in the graph.
- **Layout**: Use the buttons on the left to change the layout of the graph.
- **Toolbar**: Use the buttons on the left to change many other settings about the graph. such as Hide/Show Labels, Hide/Show Tooltips, Highlight Connections, etc.
- **Save/Load**: Use the buttons on the left to save or load your graph. You can also save the graph as an image or a JSON file. You can also load a graph from a JSON file which you have saved before or get from others.
- **Actions on Nodes**: Right-click on a node to see more actions, such as "Expand Node", "Find Shared Nodes", "Find Shortest Path", etc.
- **Actions on Edges**: Right-click on an edge to see more actions, such as "Hide/Show Edge" etc.
`;

type QueryBuilderProps = {
  onChange?: (label: string, value: string | undefined) => void;
  onAdvancedSearch?: () => void;
  entityTypes: string[];
  getEntities: APIs['GetEntitiesFn'];
};

const QueryBuilder: React.FC<QueryBuilderProps> = (props) => {
  const [entityTypeOptions, setEntityTypeOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [placeholder, setPlaceholder] = useState<string>('Search Disease & Related Entities ...');
  const [entityOptions, setEntityOptions] = useState<OptionType[] | undefined>(undefined);
  const [entityType, setEntityType] = useState<string>('Disease');
  const [helpPanelVisible, setHelpPanelVisible] = useState<boolean>(false);

  const handleSelectEntityType = function (value: string) {
    setEntityType(value);
    setEntityOptions(undefined);
    setPlaceholder(`Search ${value} & Related Entities ...`);
  };

  const handleSearch = function (value: string) {
    if (value) {
      setLoading(true);
      fetchNodes(props.getEntities, entityType, value, (options) => {
        setEntityOptions(options);
        setLoading(false);
      });
    } else {
      setEntityOptions(undefined);
    }
  };

  const handleChange = function (value: string) {
    console.log('Handle Change: ', value);
    if (value) {
      props.onChange?.(entityType, value);
    } else {
      props.onChange?.(entityType, undefined);
    }
  };

  useEffect(() => {
    if (props.entityTypes) {
      let o: OptionType[] = [];
      uniq(props.entityTypes)
        .sort()
        .forEach((element: string) => {
          o.push({
            order: 0,
            label: element,
            value: element,
          });
        });

      setEntityTypeOptions(o);
    }
  }, [props.entityTypes]);

  return (
    <Row className="query-builder">
      <Select
        className="entity-type-select"
        value={entityType}
        getPopupContainer={(triggerNode) => {
          return triggerNode.parentNode;
        }}
        options={entityTypeOptions}
        onSelect={handleSelectEntityType}
      />
      <Select
        className="entity-select"
        showSearch
        allowClear
        loading={loading}
        getPopupContainer={(triggerNode) => {
          return triggerNode.parentNode;
        }}
        defaultActiveFirstOption={false}
        placeholder={placeholder}
        onSearch={handleSearch}
        onChange={handleChange}
        options={entityOptions}
        filterOption={false}
        notFoundContent={
          <Empty
            description={
              loading
                ? 'Searching...'
                : entityOptions !== undefined
                  ? 'Not Found or Too Short Input'
                  : entityType === undefined
                    ? `Please select a node type ...`
                    : `Enter your interested ${entityType} ...`
            }
          />
        }
      ></Select>
      <Button onClick={props.onAdvancedSearch} className="advanced-search-button" type="primary">
        Upload / Query
      </Button>
      <Button
        icon={<QuestionCircleOutlined />}
        className="help-button"
        danger
        type="primary"
        onClick={() => {
          setHelpPanelVisible(true);
        }}
      />
      <span className="note">Hold Shift and Drag Mouse to Multi-Select Nodes</span>

      <Modal
        title="Help - Common Operations"
        width={'50%'}
        getContainer={() => document.getElementById('knowledge-graph-container') || document.body}
        open={helpPanelVisible}
        onCancel={() => {
          setHelpPanelVisible(false);
        }}
        footer={null}
      >
        <MarkdownViewer markdown={helpDoc} />
      </Modal>
    </Row>
  );
};

export default QueryBuilder;
