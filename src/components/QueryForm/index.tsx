import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import React, { useState, useEffect } from 'react';
import type { QueryFormProps } from './index.t';
import LinkedNodesSearcher from '../LinkedNodesSearcher';
import SimilarityNodesSearcher from '../SimilarityNodesSearcher';

import './index.less';

const onChange = (key: string) => {
  console.log(key);
};

const QueryForm: React.FC<QueryFormProps> = (props) => {
  const items: TabsProps['items'] = [
    {
      key: 'linked-nodes-search-object',
      label: `Linked Nodes`,
      children: <LinkedNodesSearcher {...props} />,
    },
    {
      key: 'similarity-nodes-search-object',
      label: `Similar Nodes`,
      children: <SimilarityNodesSearcher {...props} />,
    },
    {
      key: 'batch-nodes-search-object',
      label: `Batch Nodes`,
      children: `Content of Tab Pane 3`,
    },
  ];

  return (
    <Tabs
      className="query-form"
      defaultActiveKey={props.tabKey || 'linked-nodes-search-object'}
      items={items}
      onChange={onChange}
    />
  );
};

export default QueryForm;
