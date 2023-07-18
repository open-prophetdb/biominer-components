import { Col, Empty, Row, message } from 'antd';
import PlotlyViewer from '../PlotlyViewer';
import type { Entity2D, SimilarityChartProps } from './index.t';
import type { PlotlyChart } from '../PlotlyViewer/data';
import React, { useEffect, useState } from 'react';
import { genLayout } from './BaseStyle';
import './index.less';

const makeid = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const SimilarityChart: React.FC<SimilarityChartProps> = (props) => {
  const [charts, setCharts] = useState<PlotlyChart[]>([]);
  const [divId, setDivId] = useState<string>(makeid(5));

  useEffect(() => {
    let selectedNodeIds: string[] = props.selectedNodeIds || [];

    if (props.data.length !== 0) {
      let localCharts: PlotlyChart[] = [];
      let plotData: any = [];
      let groupData: { [key: string]: Entity2D[] } = {};
      props.data.forEach((item) => {
        if (groupData[item.entity_type]) {
          groupData[item.entity_type].push(item);
        } else {
          groupData[item.entity_type] = [item];
        }
      });

      Object.keys(groupData).forEach((key) => {
        const localData = groupData[key];

        let x = [0];
        let y = [0];
        if (props.method === 'tsne') {
          x = localData.map((item) => item.tsne_x || 0);
          y = localData.map((item) => item.tsne_y || 0);
        } else if (props.method === 'umap') {
          x = localData.map((item) => item.umap_x || 0);
          y = localData.map((item) => item.umap_y || 0);
        }

        const group = localData.map((item) => item.entity_type);
        let name = [];
        if (selectedNodeIds) {
          name = localData.map((item) => {
            console.log('item.data.id: ', item.entity_id, selectedNodeIds);
            if (selectedNodeIds.includes(item.entity_id)) {
              return item.entity_name;
            } else {
              return '';
            }
          });
        } else {
          name = localData.map((item) => item.entity_name);
        }
        const id = localData.map((item) => item.entity_id);

        plotData.push({
          x: x,
          y: y,
          type: 'scatter',
          mode: 'markers+text',
          textposition: 'bottom center',
          text: name,
          customdata: localData,
          name: group[0],
          extra: id,
          marker: {
            color: localData[0].color || 'blue',
            size: 10,
          },
          hovertemplate:
            '<b>%{customdata.entity_name}</b><br>' +
            '%{customdata.entity_id}<br>' +
            '%{yaxis.title.text}: %{y}<br>' +
            '%{xaxis.title.text}: %{x}<br>' +
            '<extra></extra>',
          texttemplate: '%{text}',
        });
      });

      localCharts.push({
        data: plotData,
        layout: genLayout('', 'X', 'Y', false),
      });

      console.log('localCharts: ', localCharts);
      setCharts(localCharts);
    }
  }, [props.data, props.selectedNodeIds]);

  const onPlotlyClick = (data: any) => {
    if (data.points.length === 1) {
      const node = data.points[0];
      if (node.customdata && props.onClick) {
        props.onClick(node.customdata);
      }
    } else {
      console.log('onPlotlyClick: ', data);
      message.info('Please click one node to focus.');
    }
  };

  return (
    <Row className="complex-chart">
      {props.description ? <span className="notice">{props.description}</span> : null}
      {charts.length === 0 ? (
        <Col span={24}>
          <Empty />
        </Col>
      ) : (
        charts.map((chart, index) => {
          return (
            <Col span={24} key={index} style={{ height: '400px' }}>
              <PlotlyViewer
                mode="Plotly"
                plotlyData={chart}
                divId={`${divId}`}
                onClick={onPlotlyClick}
                forceResize
              />
            </Col>
          );
        })
      )}
    </Row>
  );
};

export default SimilarityChart;
