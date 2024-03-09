## MarkdownViewer

```tsx
import React from 'react';
import { MarkdownViewer } from 'biominer-components';
import RehypeToc from 'rehype-toc';
import RehypeRaw from 'rehype-raw';

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

<img src="https://via.placeholder.com/150" alt="Image" width="150" />

<a href="https://www.google.com" target="_blank">Link</a>

\`\`\`javascript
const foo = 'bar';
\`\`\`
`;

export default () => <MarkdownViewer markdown={markdown} />;
```

<API></API>
