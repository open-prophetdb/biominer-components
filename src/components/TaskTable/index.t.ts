export interface TaskTableProps {
    /**
     * @description        en_US or zh_CN
     * @default            en_US
     */
    locale?: string; // en_US, zh_CN
    /**
     * @description        CSS style
     * @default            undefined
     */
    style?: React.CSSProperties;
    onClickItem?: (item: TaskListItem) => void;
    getTasks: (item: any) => any;
}

export type TaskListItem = {
    id: string;
    name: string;
    plugin_name: string;
    plugin_type: string;
    percentage: number;
    status: string;
    started_time: string;
    plugin_version: string;
    owner?: string;
    payload?: object;
    finished_time: string;
    description: string;
    response: object;
};

export type TaskList = {
    total?: number;
    current?: number;
    pageSize?: number;
    data?: TaskListItem;
};

export type PageParams = {
    current?: number;
    pageSize?: number;
};
