---
title: MarkdownViewer
group:
  path: /components/utility-components
  title: Utility Components
---

## MarkdownViewer

```tsx
import React from 'react';
import { MarkdownViewer } from 'biominer-components';

const markdown = `
# Header 1
## Header 2
### Header 3
#### Header 4

*italic*
**bold**
***bold italic***

- list item 1
- list item 2
- list item 3

1. list item 1
2. list item 2
3. list item 3

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |

[Link](https://www.google.com)

![Image](https://via.placeholder.com/150)

\`\`\`javascript
const foo = 'bar';
\`\`\`
`;

export default () => <MarkdownViewer markdown={markdown} />;
```

<API></API>
