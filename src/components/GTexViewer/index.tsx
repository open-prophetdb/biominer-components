import React, { useEffect, useState } from 'react';
import GTexGeneBoxplotViewer from '../GTexGeneBoxplotViewer';
import GTexTranscriptViewer from '../GTexTranscriptViewer';
import GTexGeneViolinViewer from '../GTexGeneViolinViewer';
import { GTexViewerProps } from './index.t';

import './index.less';

const GTexViewer: React.FC<GTexViewerProps> = (props) => {
  const [rootId, setRootId] = useState<string>('');
  const [summary, setSummary] = useState<string>(props.summary || '');

  useEffect(() => {
    if (!props.rootId) {
      setRootId('gtex-viewer');
    } else {
      setRootId(props.rootId);
    }
  }, []);

  return (
    <div className="gtex-viewer">
      <div className="summary">
        <h3 className="summary-title">{props.summaryTitle || `Summary [Summarized by AI]`}</h3>
        <p className="summary-content">{summary}</p>
      </div>
      {props.type == 'transcript' ? (
        <div className="transcript-figures">
          <GTexTranscriptViewer
            rootId={rootId + '-isoform-transposed'}
            type="isoformTransposed"
            title={props.title || 'Isoform Transposed'}
            geneId={props.officialGeneSymbol}
          />
          <GTexTranscriptViewer
            rootId={rootId + '-exon'}
            title={props.title || 'Exon'}
            type="exon"
            geneId={props.officialGeneSymbol}
          />
          <GTexTranscriptViewer
            rootId={rootId + '-junction'}
            title={props.title || 'Junction'}
            type="junction"
            geneId={props.officialGeneSymbol}
          />
        </div>
      ) : null}
      {props.type == 'gene' ? (
        <div className="gene-figures">
          <GTexGeneBoxplotViewer
            rootId={rootId + 'boxplot'}
            title={props.title || 'Boxplot'}
            geneId={props.officialGeneSymbol}
          />
          <GTexGeneViolinViewer
            rootId={rootId + 'violin'}
            title={props.title || 'Violin Plot'}
            geneId={props.officialGeneSymbol}
          />
        </div>
      ) : null}
    </div>
  );
};

export default GTexViewer;
