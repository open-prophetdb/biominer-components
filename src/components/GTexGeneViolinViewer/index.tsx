import React, { useRef, useEffect } from 'react';
import { GeneExpressionViolinplot } from 'gtex-d3';
import jquery from 'jquery';
import { parseGenes, getGtexUrls } from 'gtex-d3/src/modules/gtexDataParser';
import './index.less';

type GeneViewerProps = {
  /**
   * @description If you want to launch multiple plots in the same page, you need to specify different rootId for each plot.
   */
  rootId: string;
  /**
   * @description Only support Hugo gene symbol or Ensembl gene ID. e.g. "TP53" or "ENSG00000141510"
   */
  geneId: string;
  /**
   * @description Title of the plot.
   */
  title?: string;
};

const host =
  'https://gtexportal.org/rest/v1/reference/gene?format=json&gencodeVersion=v26&genomeBuild=GRCh38%2Fhg38&geneId=';

const GTexGeneViolinViewer: React.FC<GeneViewerProps> = (props) => {
  const ref = useRef(null);

  const { rootId, geneId, title } = props;

  const removeChildren = (tag: HTMLElement) => {
    if (tag.children) {
      tag.innerHTML = '';
    }
  };

  const fetchGene = async (geneId: string) => {
    const response = await fetch(`${host}${geneId}`);
    const data = await response.json();
    return data;
  };

  const update = () => {
    // Remove existing children from the container element
    if (ref.current) {
      const element = ref.current as HTMLElement;
      removeChildren(element);

      fetchGene(geneId)
        .then((data) => {
          const gene = parseGenes(data, true, geneId);
          const gencodeId = gene.gencodeId;

          window.$ = jquery;

          const width = element.clientWidth - 100;
          // (Re)render the plot
          GeneExpressionViolinplot.launch(
            rootId,
            rootId + 'tooltip',
            gencodeId,
            '', // title
            getGtexUrls(), // urls
            {
              top: 50,
              right: 75,
              bottom: 150,
              left: 60,
            }, // margins
            {
              w: width,
              h: 250,
            }, // dimensions
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    if (ref.current) {
      update();
    }
  }, [rootId, geneId]);

  return (
    <div className="gtex-gene-violin-viewer">
      {title && <h3>{title}</h3>}
      <div id={rootId} style={{ width: '100%' }} ref={ref} />
    </div>
  );
};

export default GTexGeneViolinViewer;
