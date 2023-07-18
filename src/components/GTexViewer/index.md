---
title: GTexViewer
group:
  path: /components/visualization-components
  title: Visualization
---

## GTexViewer

### Transcripts Type

```tsx
import React from 'react';
import { GTexViewer } from 'biominer-components';

const defaultSummary =
  "Overall, this table provides insights into the tissue-specific expression pattern of the PRG4 gene in human tissues, as well as the specific transcript variants that are expressed in each tissue. The median expression levels suggest that PRG4 is highly expressed in some tissues, such as Adipose_Visceral_Omentum and Artery_Tibial, but not expressed or expressed at very low levels in other tissues, such as Bladder and Brain_Amygdala. The information in this table can be used to gain a better understanding of the role of PRG4 in different tissues and may be useful in designing future studies investigating the gene's function in health and disease.";

export default () => (
  <GTexViewer
    rootId="gtex-transcript-viewer"
    type="transcript"
    title="GTex Transcript Viewer"
    officialGeneSymbol="PRG4"
    summary={defaultSummary}
  />
);
```

### Gene Type

```tsx
import React from 'react';
import { GTexViewer } from 'biominer-components';

const defaultSummary =
  "Overall, this table provides insights into the tissue-specific expression pattern of the PRG4 gene in human tissues, as well as the specific transcript variants that are expressed in each tissue. The median expression levels suggest that PRG4 is highly expressed in some tissues, such as Adipose_Visceral_Omentum and Artery_Tibial, but not expressed or expressed at very low levels in other tissues, such as Bladder and Brain_Amygdala. The information in this table can be used to gain a better understanding of the role of PRG4 in different tissues and may be useful in designing future studies investigating the gene's function in health and disease.";

export default () => (
  <GTexViewer
    rootId="gtex-gene-viewer"
    type="gene"
    title="GTex Gene Viewer"
    officialGeneSymbol="PRG4"
    summary={defaultSummary}
  />
);
```

<API></API>
