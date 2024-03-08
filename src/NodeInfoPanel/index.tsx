import React from 'react';
import { Empty, Row } from 'antd';
import DiseasePanel from './DiseasePanel';
import DrugPanel from './DrugPanel';
import GenePanel from './GenePanel';
import type { NodeInfoPanelProps } from './index.t';
import type { GraphNode } from '../typings';

import './index.less';

const NodeInfoPanel: React.FC<NodeInfoPanelProps> = (props) => {
  const { node } = props;

  // You should add your own logic here to map the node label to the panel type
  const mapNode2Type = (node: GraphNode | undefined) => {
    if (node && node.data.label) {
      const label = node.data.label.toLocaleLowerCase();

      if (['gene', 'protein'].includes(label)) {
        return (
          <GenePanel
            node={node}
            getGeneInfo={props.getGeneInfo}
            getItems4GenePanel={props.getItems4GenePanel}
          ></GenePanel>
        );
      }

      if (['drug', 'chemical', 'compound'].includes(label)) {
        return <DrugPanel node={node} />;
      }

      if (['disease'].includes(label)) {
        return <DiseasePanel node={node} />;
      }
    }

    return <Empty />;
  };

  return <Row className="node-info-panel">{mapNode2Type(node)}</Row>;
};

export default NodeInfoPanel;
