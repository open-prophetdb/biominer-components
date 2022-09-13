import { Drawer, Row } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import React, { useState, useRef } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import getLocale from './locales';
import { TaskListItem, TaskTableProps, PageParams } from './index.t';
import './index.less';


const TableTable: React.FC<TaskTableProps> = (props) => {
    const { onClickItem, locale, getTasks } = props;

    const [showDetail, setShowDetail] = useState<boolean>(false);

    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<TaskListItem>();
    const [selectedRowsState, setSelectedRows] = useState<TaskListItem[]>([]);

    /**
     * @en-US International configuration
     * @zh-CN 国际化配置
     * */
    const localeData = getLocale(locale ? locale : 'en_US')

    const columns: ProColumns<TaskListItem>[] = [
        {
            title: localeData.id,
            dataIndex: 'id',
            hideInTable: true,
            hideInSearch: true,
            hideInForm: true,
        },
        {
            title: localeData.taskName,
            dataIndex: 'name',
            hideInSearch: true,
            hideInForm: true,
            tip: localeData.taskNameTip,
            render: (dom: any, entity: TaskListItem) => {
                return (
                    <a
                        onClick={() => {
                            setCurrentRow(entity);
                            setShowDetail(true);
                        }}
                    >
                        {dom}
                    </a>
                );
            },
        },
        {
            title: localeData.pluginName,
            dataIndex: 'plugin_name',
            valueType: 'text',
            render: (dom: any, entity: TaskListItem) => {
                return (
                    <a
                        onClick={() => { if (onClickItem) onClickItem(entity) }}
                    >
                        <EyeOutlined />
                        {dom}
                    </a>
                );
            },
        },
        {
            title: localeData.pluginVersion,
            dataIndex: 'plugin_version',
            hideInSearch: true,
            hideInForm: true,
            valueType: 'text',
        },
        {
            title: localeData.percentage,
            dataIndex: 'percentage',
            hideInSearch: true,
            hideInForm: true,
            hideInTable: true,
            hideInSetting: true,
            valueType: 'progress',
        },
        {
            title: localeData.status,
            dataIndex: 'status',
            hideInForm: true,
            valueEnum: {
                Started: {
                    text: localeData.started,
                    status: 'Processing',
                },
                Finished: {
                    text: localeData.finished,
                    status: 'Success',
                },
                Failed: {
                    text: localeData.failed,
                    status: 'Error',
                },
            },
        },
        {
            title: localeData.startedAt,
            // sorter: true,
            dataIndex: 'started_time',
            hideInSearch: true,
            valueType: 'dateTime',
            renderFormItem: (item, { defaultRender, ...rest }, form) => {
                return defaultRender(item);
            },
        },
        {
            title: localeData.finishedAt,
            // sorter: true,
            hideInSearch: true,
            dataIndex: 'finished_time',
            valueType: 'dateTime',
            renderFormItem: (item, { defaultRender, ...rest }, form) => {
                return defaultRender(item);
            },
        },
        {
            title: localeData.payload,
            dataIndex: 'payload',
            hideInSearch: true,
            hideInForm: true,
            hideInTable: true,
            hideInSetting: true,
            valueType: 'jsonCode',
            renderText: (text: any, record: any, index: any, action: any) => {
                return JSON.stringify(text);
            },
            colSpan: 2,
        },
    ];

    return (
        <Row className='task-table-container'>
            <ProTable<TaskListItem, PageParams>
                className="task-table"
                headerTitle={localeData.title}
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 120,
                }}
                toolBarRender={() => []}
                request={getTasks}
                columns={columns}
                rowSelection={{
                    onChange: (_: any, selectedRows: any) => {
                        setSelectedRows(selectedRows);
                    },
                }}
            />

            <Drawer
                width={'50%'}
                visible={showDetail}
                className="task-details"
                onClose={() => {
                    setCurrentRow(undefined);
                    setShowDetail(false);
                }}
                closable={false}
            >
                {currentRow?.name && (
                    <ProDescriptions<TaskListItem>
                        column={1}
                        title={currentRow?.name}
                        request={async () => ({
                            data: currentRow || {},
                        })}
                        params={{
                            id: currentRow?.name,
                        }}
                        columns={columns as ProDescriptionsItemProps<TaskListItem>[]}
                    />
                )}
            </Drawer>
        </Row>
    );
};

export default TableTable;
