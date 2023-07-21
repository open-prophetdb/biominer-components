import React, { memo, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
// How to load library dynamically
import { createElement } from 'react';
import remarkGfm from 'remark-gfm';
import type { MarkdownProps } from './index.t';

import './index.less';

const plugins = {
  enableToc: ['rehype-toc', 'rehype-autolink-headings', 'remark-toc'],
  enableVideo: ['rehype-video'],
  enableRaw: ['rehype-raw'],
  enableSlug: ['rehype-slug'],
};

const MarkdownViewer: React.FC<MarkdownProps> = (props) => {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [key, setKey] = useState<string>('');

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
      return;
    }

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
  }, [props.url, props.markdown]);

  console.log('MarkdownViewer: updated');

  let rehypePlugins: any = [];
  let remarkPlugins: any = [remarkGfm];
  if (props.enableToc) {
    const rehypeToc = createElement(plugins['enableToc'][0]);
    const rehypeAutolinkHeadings = createElement(plugins['enableToc'][1]);
    rehypePlugins.concat([rehypeToc, rehypeAutolinkHeadings]);

    const remarkToc = createElement(plugins['enableToc'][2]);
    remarkPlugins.concat([remarkToc]);
  }

  if (props.enableVideo) {
    const rehypeVideo = createElement(plugins['enableVideo'][0]);
    rehypePlugins.concat([rehypeVideo]);
  }

  if (props.enableRaw) {
    const rehypeRaw = createElement(plugins['enableRaw'][0]);
    rehypePlugins.concat([rehypeRaw]);
  }

  if (props.enableSlug) {
    const rehypeSlug = createElement(plugins['enableSlug'][0]);
    rehypePlugins.concat([rehypeSlug]);
  }

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
    <div className="empty-container" />
  );
};

export default memo(MarkdownViewer);
