---
title: GraphStoreTable
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## GraphStoreTable

```tsx
import React, { useState, useEffect } from 'react';
import { Row, Button } from 'antd';
import { GraphStoreTable } from 'biominer-components';

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <Row>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        Show Table
      </Button>
      <GraphStoreTable
        visible={visible}
        graphs={[]}
        treeFormat
        onClose={() => {
          setVisible(false);
        }}
      />
    </Row>
  );
};
```

<API></API>
