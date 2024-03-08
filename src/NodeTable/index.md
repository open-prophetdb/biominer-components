---
title: NodeTable
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## NodeTable

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../request';
import { Row, Tag } from 'antd';
import { NodeTable } from 'biominer-components';
import nodes from './nodes';

const formattedNodes = nodes.map((node: any) => {
  const data = node.data;

  // Remove all other properties which its value is an object
  Object.keys(node).forEach((key) => {
    if (typeof node[key] === 'object') {
      delete node[key];
    }
  });

  return {
    ...data,
    ...node,
  };
});

console.log('formattedNodes', formattedNodes);

const onSelectedRows = (selectedRows: any) => {
  console.log(selectedRows);
};

export default () => {
  return (
    <Row style={{ position: 'relative', height: '500px' }}>
      <NodeTable nodes={formattedNodes} onSelectedRows={onSelectedRows} />
    </Row>
  );
};
```

<API></API>
