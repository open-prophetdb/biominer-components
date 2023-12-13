---
title: LinkedNodesSearcher
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## LinkedNodesSearcher

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../../request';
import { Row, Tag } from 'antd';
import { LinkedNodesSearcher } from 'biominer-components';

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
  const [relationStat, setRelationStat] = useState([]);

  useEffect(() => {
    getStatistics().then((data) => {
      setEntityTypes(data.entity_stat.map((item) => item.entity_type));
      setRelationStat(data.relation_stat);
    });
  }, []);

  return (
    <Row style={{ position: 'relative', height: '500px', width: '800px' }}>
      <LinkedNodesSearcher
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
        getRelationCounts={(params) => {
          return new Promise((resolve, reject) => {
            request
              .get('/api/v1/relation-counts', {
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
        relationStat={relationStat}
      ></LinkedNodesSearcher>
    </Row>
  );
};
```

<API></API>
