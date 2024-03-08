import React, { useEffect } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import MarkdownViewer from '../../MarkdownViewer';
import { LlmResponse } from '../../typings';

const onChange = (key: string) => {
  console.log(key);
};

type ExplanationPanelProps = {
  data: Record<string, LlmResponse & { title: string }>;
};

const ExplanationPanel: React.FC<ExplanationPanelProps> = (props) => {
  const [items, setItems] = React.useState<TabsProps['items']>([]);

  useEffect(() => {
    const keys = Object.keys(props.data);
    const newItems = keys.map((item: string, index) => {
      const title = props.data[item].title;
      return {
        label: title,
        key: index.toString(),
        children: (
          <div>
            {/* TODO: Show the subgraph */}
            <MarkdownViewer markdown={props.data[item].response} rehypePlugins={[]} />
          </div>
        ),
      };
    });

    setItems(newItems);
  }, [props.data]);

  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
};

export default ExplanationPanel;
