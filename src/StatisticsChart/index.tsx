import { Col, Empty, Row } from 'antd';
import PlotlyViewer from '../PlotlyViewer';
import type { StatisticsChartProps } from './index.t';
import type { EntityStat, RelationStat } from '../typings';
import { stat_total_node_count, stat_total_relation_count } from './utils';
import type { PlotlyChart } from '../PlotlyViewer/data';
import React, { useEffect, useState } from 'react';
import { genLayout } from './BaseStyle';
import voca from 'voca';
import { Collapse } from 'antd';

import './index.less';

const groupBy = (array: any[], key: string) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
};

const mergeTwoFields = (array: any[], key1: string, key2: string, newkey: string) => {
  array.forEach(function (item) {
    item[newkey] = item[key1] + '_' + item[key2];
  });
  return array;
};

const groupByTwoFields = (
  array: any[],
  key1: string,
  key2: string,
  countKey: string,
): {
  [key1: string]: string | number;
}[] => {
  const groupedCounts = array.reduce((acc, item) => {
    const groupKey = `${item[key1]}-${item[key2]}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        [key1]: item[key1],
        [key2]: item[key2],
        [countKey]: 0,
      };
    }

    acc[groupKey][countKey] += item[countKey];
    return acc;
  }, {});

  return Object.values(groupedCounts);
};

const makeWideFormat = (array: any[], key1: string, key2: string, vkey: string) => {
  var wideData = Object.values(
    array.reduce(function (result, current) {
      const formated_key1 = voca.snakeCase(current[key1]);
      if (!result[formated_key1]) {
        let obj: any = {};
        obj[key1] = current[key1];
        result[formated_key1] = obj;
      }
      const formated_key2 = voca.snakeCase(current[key2]);
      result[formated_key1][formated_key2] = current[vkey];
      return result;
    }, {}),
  );

  return wideData;
};

const transposedArray = (array: any[]) => {
  return array.reduce(function (prev, curr) {
    return curr.map(function (value: any, index: any) {
      return (prev[index] || []).concat(curr[index]);
    });
  }, []);
};

const StatisticsChart: React.FC<StatisticsChartProps> = (props) => {
  const { nodeStat, edgeStat } = props;

  const [charts, setCharts] = useState<PlotlyChart[]>([]);
  const [tables, setTables] = useState<PlotlyChart[]>([]);

  useEffect(() => {
    if (nodeStat.length !== 0 && edgeStat.length !== 0) {
      let localCharts: PlotlyChart[] = [];

      // Chart 1
      let nodeCount = stat_total_node_count(nodeStat);
      let edgeCount = stat_total_relation_count(edgeStat);
      console.log('Node Count: ', nodeCount, 'Edge Count: ', edgeCount);
      localCharts.push({
        data: [
          {
            labels: ['Node Count', 'Edge Count'],
            values: [nodeCount, edgeCount],
            type: 'pie',
            textinfo: 'value',
          },
        ],
        layout: { ...genLayout('Total Count', 'Type', 'Count', true) },
      });

      // Chart 2
      let nodeData = groupBy(nodeStat, 'resource');
      let chartData = Object.keys(nodeData).map((key) => {
        return {
          x: nodeData[key].map((item: EntityStat) => item.entity_type),
          y: nodeData[key].map((item: EntityStat) => item.entity_count),
          type: 'bar',
          name: key,
        };
      });

      localCharts.push({
        data: chartData,
        layout: { ...genLayout('Node Count', 'Node Type', 'Count', true), barmode: 'stack' },
      });

      // Chart 3
      nodeData = groupBy(nodeStat, 'entity_type');
      chartData = Object.keys(nodeData).map((key) => {
        return {
          x: nodeData[key].map((item: EntityStat) => item.resource),
          y: nodeData[key].map((item: EntityStat) => item.entity_count),
          type: 'bar',
          name: key,
        };
      });

      localCharts.push({
        data: chartData,
        layout: { ...genLayout('Node Count', 'Source', 'Count', true), barmode: 'stack' },
      });

      // Chart 4
      let edgeData = groupBy(
        mergeTwoFields(edgeStat, 'start_entity_type', 'end_entity_type', 'rel'),
        'rel',
      );
      let edgeChartData = Object.keys(edgeData).map((key) => {
        return {
          x: edgeData[key].map((item: RelationStat) => item.resource),
          y: edgeData[key].map((item: RelationStat) => item.relation_count),
          type: 'bar',
          name: key,
        };
      });

      localCharts.push({
        data: edgeChartData,
        layout: { ...genLayout('Relation Count', 'Source', 'Count', true), barmode: 'stack' },
      });

      // Chart 5
      edgeData = groupBy(
        mergeTwoFields(edgeStat, 'start_entity_type', 'end_entity_type', 'rel'),
        'resource',
      );
      edgeChartData = Object.keys(edgeData).map((key) => {
        return {
          x: edgeData[key].map((item: RelationStat & { rel: string }) => item.rel),
          y: edgeData[key].map((item: RelationStat) => item.relation_count),
          type: 'bar',
          name: key,
        };
      });

      localCharts.push({
        data: edgeChartData,
        layout: {
          ...genLayout('Relation Count', 'Relationship Type', 'Count', true),
          barmode: 'stack',
        },
      });

      setCharts(localCharts);

      // Table 1
      const headerColor = 'grey';
      const rowEvenColor = 'lightgrey';
      const rowOddColor = 'white';

      const localTables = [];
      let data = makeWideFormat(nodeStat, 'entity_type', 'resource', 'entity_count');
      let columns = Array.from(new Set(nodeStat.map((item) => item.resource)));
      let cellValues = transposedArray(
        data.map(function (item: any) {
          let row = [item['entity_type']];
          return row.concat(
            columns.map(function (column) {
              let key = voca.snakeCase(column);
              return item[key] === undefined ? 0 : item[key];
            }),
          );
        }),
      );

      let rowNum = cellValues[0].length;
      let colors = Array.from({ length: rowNum }, function (_, index) {
        return index % 2 === 0 ? rowEvenColor : rowOddColor;
      });

      let table = {
        type: 'table',
        header: {
          values: ['Node Type'].concat(columns),
          align: ['center', 'center'],
          line: { width: 1, color: 'black' },
          fill: { color: headerColor },
          font: { family: 'Arial', size: 12, color: 'white' },
        },
        cells: {
          values: cellValues,
          align: ['center', 'center'],
          line: { color: 'black', width: 1 },
          fill: {
            color: [colors],
          },
          font: { family: 'Arial', size: 11, color: ['black'] },
          height: 30,
          format: [
            [undefined, undefined],
            [undefined, ',d'],
          ],
        },
      };

      console.log('Table: ', table, data, columns, cellValues);
      localTables.push({
        data: [table],
        layout: { title: 'Node Count' },
      });

      // Table 2
      const groupedEdgeStat = groupByTwoFields(
        edgeStat,
        'resource',
        'relation_type',
        'relation_count',
      );
      data = makeWideFormat(groupedEdgeStat, 'relation_type', 'resource', 'relation_count');
      columns = Array.from(new Set(edgeStat.map((item) => item.resource)));
      cellValues = transposedArray(
        data.map(function (item: any) {
          let row = [item['relation_type']];
          return row.concat(
            columns.map(function (column) {
              let key = voca.snakeCase(column);
              return item[key] === undefined ? 0 : item[key];
            }),
          );
        }),
      );

      rowNum = cellValues[0].length;
      colors = Array.from({ length: rowNum }, function (_, index) {
        return index % 2 === 0 ? rowEvenColor : rowOddColor;
      });

      let table2 = {
        type: 'table',
        header: {
          values: ['Relationship Type'].concat(columns),
          align: ['center', 'center'],
          line: { width: 1, color: 'black' },
          fill: { color: headerColor },
          font: { family: 'Arial', size: 12, color: 'white' },
        },
        cells: {
          values: cellValues,
          align: ['center', 'center'],
          line: { color: 'black', width: 1 },
          fill: {
            color: [colors],
          },
          font: { family: 'Arial', size: 11, color: ['black'] },
          height: 30,
          format: [
            [undefined, undefined],
            [undefined, ',d'],
          ],
        },
        columnwidth: Array.from({ length: columns.length }, function (_, idx) {
          return idx == 0 ? 150 : 50;
        }),
      };

      console.log('Table: ', table2, data, columns, cellValues);
      localTables.push({
        data: [table2],
        layout: { title: 'Relationship Count' },
      });

      setTables(localTables);
    }
  }, [nodeStat, edgeStat]);

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

  return (
    <Collapse defaultActiveKey={['charts', 'tables']}>
      <Collapse.Panel header="Charts" key="charts">
        <Row className="complex-chart">
          {charts.length === 0 ? (
            <Col span={24}>
              <Empty />
            </Col>
          ) : (
            charts.map((chart, index) => {
              return (
                <Col span={12} key={index} style={{ height: '350px', marginBottom: '10px' }}>
                  <PlotlyViewer
                    mode="Plotly"
                    plotlyData={chart}
                    divId={`${makeid(5)}`}
                    forceResize
                  />
                </Col>
              );
            })
          )}
        </Row>
      </Collapse.Panel>
      <Collapse.Panel header="Tables" key="tables">
        <Row className="complex-chart">
          {tables.length === 0 ? (
            <Col span={24}>
              <Empty />
            </Col>
          ) : (
            tables.map((table, index) => {
              return (
                <Col span={24} key={index} style={{ height: '350px', marginBottom: '10px' }}>
                  <PlotlyViewer
                    mode="Plotly"
                    plotlyData={table}
                    divId={`${makeid(5)}`}
                    forceResize
                  />
                </Col>
              );
            })
          )}
        </Row>
      </Collapse.Panel>
    </Collapse>
  );
};

export default StatisticsChart;
