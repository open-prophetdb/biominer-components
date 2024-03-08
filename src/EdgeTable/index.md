---
title: EdgeTable
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## EdgeTable

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../request';
import { Row, Tag } from 'antd';
import { EdgeTable } from 'biominer-components';
import edges from './edges';

const formattedEdges = edges.map((edge: any) => {
  const data = JSON.parse(JSON.stringify(edge.data));

  // Remove all other properties which its value is an object
  Object.keys(edge).forEach((key) => {
    if (typeof edge[key] === 'object') {
      delete edge[key];
    }
  });

  return {
    ...data,
    ...edge,
  };
});

console.log('formattedEdges', formattedEdges);

const onSelectedRows = (selectedRows: any) => {
  console.log(selectedRows);
};

export default () => {
  return (
    <Row style={{ position: 'relative', height: '500px' }}>
      <EdgeTable edges={formattedEdges} onSelectedRows={onSelectedRows} />
    </Row>
  );
};
```

<API></API>
