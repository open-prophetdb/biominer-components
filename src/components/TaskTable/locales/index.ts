import { TaskTableLocale } from './index.t'

const en_US: TaskTableLocale = {
    id: 'Task ID',
    title: 'Task History',
    taskName: 'Task Name',
    taskNameTip: 'The task id is the unique key',
    pluginName: 'Plugin Name',
    pluginVersion: 'Version',
    percentage: 'Percentage',
    status: 'Status',
    started: 'Started',
    finished: 'Finished',
    failed: 'Failed',
    startedAt: 'Started At',
    finishedAt: 'Finished At',
    payload: 'Payload',
}

const zh_CN: TaskTableLocale = {
    id: '任务ID',
    title: '任务历史',
    taskName: '任务名称',
    taskNameTip: '任务索引ID',
    pluginName: '插件名称',
    pluginVersion: '插件版本',
    percentage: '任务进度',
    status: '状态',
    started: '已开始',
    finished: '已完成',
    failed: '已失败',
    startedAt: '开始时间',
    finishedAt: '完成时间',
    payload: '数据',
}

const getLocale = function (locale: string): TaskTableLocale {
    if (locale === 'zh_CN') {
        return zh_CN
    } else {
        return en_US
    }
}

export default getLocale;