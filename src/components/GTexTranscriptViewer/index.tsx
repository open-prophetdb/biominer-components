import React, { useRef, useEffect } from 'react';
import $ from 'jquery';
import { render as transcriptBrowerRender } from 'gtex-d3/src/TranscriptBrowser';

import './index.less';

type TranscriptViewerProps = {
  rootId: string;
  geneId: string; // Only support Hugo gene symbol or Ensembl gene ID. e.g. "TP53" or "ENSG00000141510"
  title?: string;
  transcriptType: 'exon' | 'junction' | 'isoformTransposed';
};

const GTexTranscriptViewer: React.FC<TranscriptViewerProps> = (props) => {
  const ref = useRef(null);

  const { rootId, transcriptType, geneId, title } = props;

  const removeChildren = (tag: HTMLElement) => {
    if (tag.children) {
      tag.innerHTML = '';
    }
  };

  const update = () => {
    // Remove existing children from the container element
    if (ref.current) {
      removeChildren(ref.current as HTMLElement);
    }

    // Set the jQuery variable to the same as the one used by the GTex library
    window.$ = $;

    // (Re)render the plot
    transcriptBrowerRender(transcriptType, geneId, rootId);
  };

  useEffect(() => {
    if (ref.current) {
      update();
    }
  }, [rootId, transcriptType, geneId]);

  return (
    <div className="gtex-transcript-viewer">
      {title && <h3>{title}</h3>}
      <div id={rootId} style={{ width: '100%' }} ref={ref} />
    </div>
  );
};

export default GTexTranscriptViewer;
