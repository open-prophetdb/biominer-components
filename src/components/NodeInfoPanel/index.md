---
title: NodeInfoPanel
group:
  path: /components/knowledge-graph-components
  title: Knowledge Graph
---

## NodeInfoPanel

```tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { NodeInfoPanel, GTexViewer } from 'biominer-components';
import type { GeneInfo } from './index.t';
import { getGeneInfo } from './utils';
import { filter } from 'lodash';

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

const nodeIds = entityIds.map((id, index) => {
  return `${entityTypes[index]}::${id}`;
});

const getNodes = () => {
  return new Promise((resolve, reject) => {
    axios
      .get('http://localhost:8000/api/v1/nodes', {
        params: {
          node_ids: nodeIds.join(','),
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

export default () => {
  const [data, setData] = useState({
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    getNodes().then((data) => {
      console.log('Get nodes data: ', data);
      setData(filter(data.nodes, (item: any) => item.nlabel === 'Gene'));
    });
  }, []);

  const getItems4GenePanel = (geneInfo: GeneInfoType, hiddenItems: string[] = []) => {
    const ensemblId = geneInfo.ensembl?.gene;
    const geneSymbol = geneInfo.symbol;
    const entrezId = geneInfo.entrezgene;

    const items = [
      {
        label: 'Gene',
        key: 'gene',
        children: <GTexViewer officialGeneSymbol={ensemblId} type="gene" />,
      },
      {
        label: 'Transcript',
        key: 'transcript',
        children: <GTexViewer officialGeneSymbol={ensemblId} type="transcript" />,
      },
    ];

    return items.filter((item) => !hiddenItems.includes(item.key));
  };

  return (
    <NodeInfoPanel
      node={data[0]}
      getGeneInfo={getGeneInfo}
      getItems4GenePanel={getItems4GenePanel}
    />
  );
};
```

<API></API>
