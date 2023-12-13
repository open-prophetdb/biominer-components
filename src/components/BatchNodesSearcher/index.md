---
title: BatchNodesSearcher
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## BatchNodesSearcher

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../../request';
import { Row, Tag } from 'antd';
import { BatchNodesSearcher } from 'biominer-components';

const getStatistics = () => {
  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/statistics')
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default () => {
  const [entityTypes, setEntityTypes] = useState([]);

  useEffect(() => {
    getStatistics().then((data) => {
      setEntityTypes(data.entity_stat.map((item) => item.entity_type));
    });
  }, []);

  return (
    <Row style={{ position: 'relative', height: '500px', width: '800px' }}>
      <BatchNodesSearcher
        getEntities={(params) => {
          return new Promise((resolve, reject) => {
            request
              .get('/api/v1/entities', {
                params: params,
              })
              .then((response) => {
                resolve(response.data);
              })
              .catch((error) => {
                reject(error);
              });
          });
        }}
        entityTypes={entityTypes}
      ></BatchNodesSearcher>
    </Row>
  );
};
```

<API></API>
