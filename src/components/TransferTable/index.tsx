import React, { useState } from 'react';
import { Table, Tag, Transfer, Button, Row, message, Tooltip } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table/interface';
import type { TransferProps } from 'antd/es/transfer';
import difference from 'lodash/difference';
import filter from 'lodash/filter';
import { QuestionCircleOutlined } from '@ant-design/icons';
import enUslocale from 'antd/es/locale/en_US';
import { NodesSearchObjectClass, type DataType, type TransferTableProps } from './index.t';

import './index.less';

const helpMsg = (
  <span>
    <span>
      The example CSV file contains two columns: node_id and node_type, representing the node's ID
      and type, respectively. Entries are comma-separated.
    </span>
    <br />
    <br />
    <span>
      node_id: Unique identifier for the node, prefixed to indicate its database source(e.g., MESH,
      ENTREZ).
    </span>
    <br />
    <span>
      node_type: Category of the node, such as Disease, Gene, Compound, Symptom, Cellular Process,
      Molecular Function, Biological Process, Pathway, or Anatomy.
    </span>
    <br />
    <br />
    <span>Prefix and Node Type Association:</span>
    <ul>
      <li>
        Disease: Prefixed by MESH or MONDO, such as MESH:D002289, MESH:D015673, MONDO:0007256.
      </li>
      <li>Gene: Prefixed by ENTREZ, such as ENTREZ:1, ENTREZ:2.</li>
      <li>
        Pathway: Prefixed by KEGG, Reactome, or WikiPathways, such as KEGG:hsa04110,
        Reactome:R-HSA-109581, WikiPathways:WP254.
      </li>
      <li>Symptom: Prefixed by MESH or SYMP, such as MESH:D001523, SYMP:0000001.</li>
      <li>
        MolecularFunction, BiologicalProcess, CellularProcess: Prefixed by GO, such as GO:0003700,
        GO:0008150, GO:0009987.
      </li>
      <li>Compound: Prefixed by DrugBank or MESH, such as DrugBank:DB00001, MESH:C0006142.</li>
    </ul>
    <span>
      Each node_id must have a prefix that matches its node_type for clear categorization.
    </span>
  </span>
);

const exampleData = [
  {
    node_id: 'MESH:D002289',
    node_type: 'Disease',
  },
  {
    node_id: 'MESH:D015673',
    node_type: 'Disease',
  },
  {
    node_id: 'ENTREZ:1',
    node_type: 'Gene',
  },
  {
    node_id: 'DrugBank:DB00001',
    node_type: 'Compound',
  },
  {
    node_id: 'MESH:C0006142',
    node_type: 'Compound',
  },
  {
    node_id: 'KEGG:hsa04110',
    node_type: 'Pathway',
  },
];

const downloadExampleFile = () => {
  const header = 'node_id,node_type';
  const data = exampleData.map((item) => {
    return `${item.node_id},${item.node_type}`;
  });
  data.unshift(header);
  const csvContent = 'data:text/csv;charset=utf-8,' + data.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'example.csv');
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
};

interface TableTransferProps extends TransferProps<DataType> {
  dataSource: DataType[];
  leftColumns: ColumnsType<DataType>;
  rightColumns: ColumnsType<DataType>;
}

const leftTableColumns: ColumnsType<DataType> = [
  {
    dataIndex: 'node_id',
    title: 'ID',
    align: 'center',
  },
  {
    dataIndex: 'node_type',
    title: 'Type',
    align: 'center',
  },
  {
    dataIndex: 'matched_id',
    title: 'Matched ID',
    align: 'center',
  },
  {
    dataIndex: 'matched_name',
    title: 'Matched Name',
    align: 'center',
  },
  {
    dataIndex: 'disabled',
    title: 'Status',
    align: 'center',
    render: (disabled) => <Tag>{disabled ? 'Not Matched' : 'Matched'}</Tag>,
  },
];

const rightTableColumns: ColumnsType<DataType> = [
  {
    dataIndex: 'node_id',
    title: 'Raw ID',
    align: 'center',
  },
  {
    dataIndex: 'matched_id',
    title: 'Matched ID',
    align: 'center',
  },
];

// Customize Table Transfer
const TableTransfer = ({ leftColumns, rightColumns, ...restProps }: TableTransferProps) => (
  <Transfer {...restProps}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;

      const rowSelection: TableRowSelection<DataType> = {
        getCheckboxProps: (item) => ({ disabled: listDisabled || item.disabled }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys as string[], selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key as string, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      return (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          size="small"
          locale={enUslocale.Table}
          style={{ pointerEvents: listDisabled ? 'none' : undefined }}
          onRow={({ key, disabled: itemDisabled }) => ({
            onClick: () => {
              if (itemDisabled || listDisabled) return;
              onItemSelect(key as string, !listSelectedKeys.includes(key as string));
            },
          })}
        />
      );
    }}
  </Transfer>
);

const TransferTable: React.FC<TransferTableProps> = (props) => {
  const [targetKeys, setTargetKeys] = useState<string[]>([]);

  const submitData = () => {
    if (targetKeys.length === 0) {
      message.warning('Please select at least one node from the left table.');
      return;
    } else {
      // Get the matched entity types and the order of them are same as the targetKeys.
      const matchedEntityTypes = targetKeys.map((key) => {
        const matchedEntity = filter(props.dataSource, (item) => item.node_id === key);
        return matchedEntity[0].node_type;
      });

      const search_object = new NodesSearchObjectClass(
        {
          entity_ids: targetKeys,
          entity_types: matchedEntityTypes,
          enableAutoConnection: false,
        },
        'append',
      );

      props.onOk?.(search_object);
    }
  };

  const onChange = (nextTargetKeys: string[]) => {
    setTargetKeys(nextTargetKeys);
    console.log('targetKeys: ', nextTargetKeys);
  };

  return (
    <Row className="transfer-table">
      <span
        style={{
          background: '#d9d9d9',
          padding: '5px',
          border: '1px solid #d9d9d9',
          borderRadius: '5px',
          marginBottom: '5px',
        }}
      >
        NOTE: Please follow the example file and help message to upload your data. You might get
        them from DEGs, Publications, or other sources.
        <Tooltip
          title={helpMsg}
          overlayClassName="transfer-table-help"
          getPopupContainer={(triggerNode) => {
            return triggerNode.parentElement || document.body;
          }}
        >
          <a>
            <QuestionCircleOutlined style={{ marginLeft: '5px' }} /> Help
          </a>
        </Tooltip>
      </span>
      <TableTransfer
        dataSource={props.dataSource}
        targetKeys={targetKeys}
        showSearch={true}
        onChange={onChange}
        filterOption={(inputValue, item) =>
          item.node_id!.indexOf(inputValue) !== -1 || item.node_type.indexOf(inputValue) !== -1
        }
        leftColumns={leftTableColumns}
        rightColumns={rightTableColumns}
      />
      <Row className="button-group">
        <Button
          type="link"
          onClick={() => {
            downloadExampleFile();
          }}
        >
          Download Example File
        </Button>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button type="primary" onClick={submitData}>
          Search
        </Button>
      </Row>
    </Row>
  );
};

export default TransferTable;
