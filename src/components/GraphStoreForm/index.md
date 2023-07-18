---
title: GraphStoreForm
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## GraphStoreForm

```tsx
import React, { useState, useEffect } from 'react';
import { Button, Row } from 'antd';
import { GraphStoreForm } from 'biominer-components';

export default () => {
  const [visible, setVisible] = useState(false);

  return (
    <Row>
      <Button
        onClick={() => {
          setVisible(true);
        }}
      >
        Show Form
      </Button>
      <GraphStoreForm
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
        onSubmit={() => {
          message.success('Form submitted');
          setVisible(false);
        }}
      />
    </Row>
  );
};
```

<API></API>
