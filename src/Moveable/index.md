## Movable

```tsx
import React, { useState, useEffect } from 'react';
import { request } from '../request';
import { message, Row } from 'antd';
import { SimilarityChart, Movable } from 'biominer-components';

const makeQuery = (entityType, entityId) => {
  return {
    operator: 'and',
    items: [
      {
        operator: '=',
        field: 'entity_id',
        value: entityId,
      },
      {
        operator: '=',
        field: 'entity_type',
        value: entityType,
      },
    ],
  };
};

const entityIds = [
  'DrugBank:DB00911',
  'UMLS:C0231528',
  'ENTREZ:740',
  'ENTREZ:6183',
  'UBERON:0002369',
  'ENTREZ:85403',
  'UBERON:0002367',
  'ENTREZ:56342',
  'DrugBank:DB00898',
  'ENTREZ:56632',
  'DrugBank:DB00508',
];

const entityTypes = [
  'Compound',
  'SideEffect',
  'Gene',
  'Gene',
  'Anatomy',
  'Gene',
  'Anatomy',
  'Gene',
  'Compound',
  'Gene',
  'Compound',
];

const getEntity2D = () => {
  const query = {
    operator: 'or',
    items: entityIds.map((entityId, index) => {
      return makeQuery(entityTypes[index], entityId);
    }),
  };

  return new Promise((resolve, reject) => {
    request
      .get('/api/v1/entity2d', {
        params: {
          query_str: JSON.stringify(query),
        },
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const colorMap = {
  Compound: '#ff0000',
  SideEffect: '#00ff00',
  Gene: '#0000ff',
  Anatomy: '#ffff00',
};

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getEntity2D().then((data) => {
      setData(
        data.records.map((record) => {
          return {
            ...record,
            color: colorMap[record.entity_type],
          };
        }),
      );
    });
  }, []);

  return (
    <Row style={{ height: '500px' }}>
      <Movable
        onClose={() => {}}
        width="650px"
        style={{ padding: '10px' }}
        title="Node Similarity [t-SNE]"
      >
        <SimilarityChart
          data={data}
          method={'tsne'}
          description="Show the similarity of all selected nodes."
          onClick={(node) => {
            message.info(`You clicked ${node.entity_id}`);
          }}
        />
      </Movable>
    </Row>
  );
};
```

<API></API>
