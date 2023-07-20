import { Modal, Tabs } from 'antd';
import React, { useState } from 'react';
import TransferTable from '../TransferTable';
import type { DataType } from '../TransferTable/index.t';
import NodeUploader from '../NodeUploader';
import QueryForm from '../QueryForm';
import AskQuestion from './Components/AskQuestion';
import type { APIs, SearchObjectInterface, RelationStat } from '../typings';

import './AdvancedSearch.less';

type AdvancedSearchProps = {
  visible: boolean;
  onOk?: (searchObj: SearchObjectInterface) => void;
  onCancel?: () => void;
  searchObject?: SearchObjectInterface;
  entityTypes: string[];
  relationStat: RelationStat[];
  parent?: HTMLElement;
  apis: APIs;
};

const AdvancedSearch: React.FC<AdvancedSearchProps> = (props) => {
  const [activeKey, setActiveKey] = useState<string>('single');

  // Batch Tab
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  const items = [
    {
      label: 'Single Query',
      key: 'single',
      children: (
        <QueryForm
          entityTypes={props.entityTypes}
          relationStat={props.relationStat}
          onCancel={props.onCancel}
          onOk={props.onOk}
          searchObject={props.searchObject}
          getEntities={props.apis.GetEntitiesFn}
          getRelationCounts={props.apis.GetRelationCountsFn}
        />
      ),
    },
    {
      label: 'Batch Query',
      key: 'batch',
      children: (
        <TransferTable dataSource={dataSource} onOk={props.onOk} onCancel={props.onCancel} />
      ),
    },
    {
      label: 'Ask Question',
      key: 'question',
      children: <AskQuestion onCancel={props.onCancel} onOk={props.onOk} />,
    },
  ];

  return (
    <Modal
      className="advanced-search"
      title="Advanced Search"
      onCancel={props.onCancel}
      open={props.visible}
      destroyOnClose={true}
      footer={null}
      getContainer={props.parent ? props.parent : document.body}
    >
      <Tabs
        defaultActiveKey="single"
        activeKey={activeKey}
        tabPosition="left"
        items={items}
        destroyInactiveTabPane={true}
        onChange={(key) => {
          setActiveKey(key);
        }}
        tabBarExtraContent={
          // TODO: add upload function
          activeKey === 'batch' ? (
            <NodeUploader
              onUpload={(dataSource) => {
                setDataSource(dataSource);
              }}
              getEntities={props.apis.GetEntitiesFn}
            />
          ) : null
        }
      />
    </Modal>
  );
};

export default AdvancedSearch;
