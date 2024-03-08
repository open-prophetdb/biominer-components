import React, { useRef, useEffect, useState } from 'react';
import './index.less';

const defaultUrl = 'https://biosolver.cn/#/grna-query-details?entrezId=';

type GuideScoperViewerProps = {
  /**
   * @description The id of the GuideScoper, if you want to use multiple GuideScoper in one page, you should set different id for them.
   * @default guide-scoper-viewer
   * @example guide-scoper-viewer
   */
  id?: string;
  /**
   * @description Only support Hugo gene symbol or Ensembl gene ID. e.g. "TP53" or "ENSG00000141510"
   */
  geneId: string;
  /**
   * @description Taxonomy ID. Only support human (9606) and mouse (10090)
   */
  taxid?: 9606 | 10090;
  /**
   * @description The url of the GuideScoper
   * @default https://biosolver.cn/#/grna-query-details?entrezId=
   */
  url?: string;
  width?: string | number;
  height?: string | number;
};

const genLink = (url: string, geneId: string, taxid?: number) => {
  if (taxid == 9606 || taxid == 10090) {
    return `${url}${geneId}&taxid=${taxid}&isEmbeded=true`;
  } else {
    return `${url}${geneId}&isEmbeded=true`;
  }
};

const GuideScoperViewer: React.FC<GuideScoperViewerProps> = (props) => {
  const ref = useRef(null);
  const { geneId, taxid, url, id } = props;
  const [src, setSrc] = useState<string>(genLink(defaultUrl, geneId, taxid));
  const [rootId, setRootId] = useState<string>(id || 'guide-scoper-viewer');

  useEffect(() => {
    if (url && url !== defaultUrl) {
      const newSrc = genLink(url, geneId, taxid);
      setSrc(newSrc);

      window.addEventListener('message', (event) => {
        const defaultBaseUrl = new URL(src).origin;
        if (event.origin === defaultBaseUrl) {
          if (event.data && event.data.type === 'resizeIframe') {
            const iframe = document.getElementById(rootId);
            if (iframe) {
              if (!props.height) {
                iframe.style.height = `${event.data.height}px`;
              }
              if (!props.width) {
                iframe.style.width = `${event.data.width}px`;
              }
            }
          }
        }
      });
    }
  }, [url]);

  useEffect(() => {
    if (id) {
      setRootId(id);
    }
  }, [id]);

  return (
    <iframe
      id={rootId}
      className="guide-scoper-viewer"
      src={src}
      ref={ref}
      width={props.width || '100%'}
      height={props.height || '100%'}
      scrolling="auto"
    />
  );
};

export default GuideScoperViewer;
