---
title: GTexTranscriptViewer
group:
  path: /components/viewer
  title: Viewer
  order: 1
---

## GTexTranscriptViewer

### IsoformTransposed Type

```tsx
import React from 'react';
import { GTexTranscriptViewer } from 'biominer-components';

export default () => (
  <GTexTranscriptViewer
    rootId="gtex-transcript-viewer-isoform-transposed"
    title="GTex Transcript Viewer"
    geneId="ENSG00000141510"
    type="isoformTransposed"
  />
);
```

### Isoform Type

```tsx
import React from 'react';
import { GTexTranscriptViewer } from 'biominer-components';

export default () => (
  <GTexTranscriptViewer
    rootId="gtex-transcript-viewer-isoform"
    title="GTex Transcript Viewer"
    geneId="ENSG00000141510"
    type="exon"
  />
);
```

### Junction Type

```tsx
import React from 'react';
import { GTexTranscriptViewer } from 'biominer-components';

export default () => (
  <GTexTranscriptViewer
    rootId="gtex-transcript-viewer-junction"
    title="GTex Transcript Viewer"
    geneId="ENSG00000141510"
    type="junction"
  />
);
```

<API></API>
