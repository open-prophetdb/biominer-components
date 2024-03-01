import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import React, { useState, useEffect } from 'react';
import type { QueryFormProps } from './index.t';
import LinkedNodesSearcher from '../LinkedNodesSearcher';
import SimilarityNodesSearcher from '../SimilarityNodesSearcher';
import BatchNodesSearcher from '../BatchNodesSearcher';
import SharedNodesSearcher from '../SharedNodesSearcher';

import './index.less';

const QueryForm: React.FC<QueryFormProps> = (props) => {
  const [tabKey, setTabKey] = useState<string | undefined>('linked-nodes-search-object');

  const onChange = (key: string) => {
    console.log('QueryForm onChange:', key);
    setTabKey(key);
  };

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
      children: <BatchNodesSearcher {...props} />,
    },
    {
      key: 'shared-nodes-search-object',
      label: `Shared Nodes`,
      children: <SharedNodesSearcher {...props} />,
      disabled: props.searchObject?.data.nodes.length > 0 ? false : true,
    },
  ];

  useEffect(() => {
    if (props.searchObject) {
      setTabKey(props.searchObject.get_instance_id());
    }
  }, [props.searchObject]);

  return (
    <Tabs
      className="query-form"
      activeKey={tabKey}
      items={items}
      onChange={onChange}
      defaultActiveKey="linked-nodes-search-object"
    />
  );
};

export default QueryForm;
