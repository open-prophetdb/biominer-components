import React, { memo, useEffect, useState } from 'react';
import { Empty } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { MarkdownProps } from './index.t';

import './index.less';

const MarkdownViewer: React.FC<MarkdownProps> = (props) => {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [key, setKey] = useState<string>('');
  const [rehypePlugins, setRehypePlugins] = useState<any>([...(props.rehypePlugins || [])]);
  const [remarkPlugins, setRemarkPlugins] = useState<any>([
    remarkGfm,
    ...(props.remarkPlugins || []),
  ]);

  const fetchMarkdown = function (url: string): Promise<string> {
    if (url.match(/^(minio|file):\/\//)) {
      if (props.getFile) {
        return props
          .getFile({
            filelink: url,
          })
          .then((response: any) => {
            return response;
          })
          .catch((error: any) => {
            return error.data.msg ? error.data.msg : error.data;
          });
      } else {
        return new Promise((resolve, reject) => {
          resolve('Please specify getFile function.');
        });
      }
    } else {
      try {
        return fetch(url).then((response) => {
          if (response.status !== 200) {
            return 'No Content.';
          }
          return response.text();
        });
      } catch (error) {
        console.log(`Cannot fetch ${url}, the reason is ${error}`);
        return new Promise((resolve, reject) => {
          reject('No Content.');
        });
      }
    }
  };

  useEffect(() => {
    if (!props.url && !props.markdown) {
      console.log('MarkdownViewer: no url or markdown');
    } else {
      if (props.url) {
        fetchMarkdown(props.url).then((response) => setMarkdown(response || null));
        // How to convert the url to key
        setKey(props.url);
      }

      if (props.markdown) {
        setMarkdown(props.markdown);
        // TODO: how to convert the markdown string to a key
        setKey(props.markdown);
      }
    }
  }, [props.url, props.markdown]);

  return markdown ? (
    <ReactMarkdown
      key={key}
      rehypePlugins={rehypePlugins}
      className="markdown-viewer"
      remarkPlugins={remarkPlugins}
    >
      {markdown}
    </ReactMarkdown>
  ) : (
    <Empty />
  );
};

export default memo(MarkdownViewer);
