---
title: TransferTable
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## TransferTable

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../../request';
import { Row, Button } from 'antd';
import { NodeUploader, TransferTable } from 'biominer-components';

export default () => {
  const [dataSource, setDataSource] = useState([]);

  const getEntities = async (queryParams) => {
    const response = await request.get('http://localhost:8000/api/v1/entities', {
      params: {
        query_str: queryParams.query_str,
        page: queryParams.page,
        page_size: queryParams.page_size,
      },
    });
    return response.data;
  };

  const downloadExampleFile = () => {
    const exampleData = [
      {
        node_id: 'MESH:D002289',
        node_type: 'Disease',
      },
      {
        node_id: 'MESH:D015673',
        node_type: 'Disease',
      },
    ];

    const header = 'node_id,node_type';
    const data = exampleData.map((item) => {
      return `${item.node_id},${item.node_type}`;
    });
    data.unshift(header);
    const csvContent = 'data:text/csv;charset=utf-8,' + data.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'example.csv');
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Row>
      <Row style={{ marginBottom: '10px' }}>
        <NodeUploader
          getEntities={getEntities}
          onUpload={(data) => {
            console.log(data);
            setDataSource(data);
          }}
        />
        <Button onClick={downloadExampleFile} style={{ marginLeft: '5px' }}>
          Download Example
        </Button>
      </Row>
      <TransferTable
        dataSource={dataSource}
        onCancel={() => {}}
        onOk={(data) => {
          console.log(data);
        }}
      />
    </Row>
  );
};
```

<API></API>
