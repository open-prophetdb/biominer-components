## Toolbar

```tsx
import React, { useState, useEffect } from 'react';
import { Row } from 'antd';
import { request } from '../request';
import { StatisticsChart, Toolbar } from 'biominer-components';

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
  const [nodeStat, setNodeStat] = useState([]);
  const [edgeStat, setEdgeStat] = useState([]);

  useEffect(() => {
    getStatistics().then((data) => {
      setNodeStat(data.entity_stat);
      setEdgeStat(data.relation_stat);
    });
  }, []);

  return (
    <Row
      id="toolbar-container"
      style={{
        position: 'relative',
        border: '1px solid #d6d6d6',
        borderRadius: '5px',
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>Please click the button to open the toolbar.</p>
      <Toolbar position="top" title="Statistics Charts" closable maskVisible height="400px">
        <StatisticsChart nodeStat={nodeStat} edgeStat={edgeStat} />;
      </Toolbar>
    </Row>
  );
};
```

<API></API>
