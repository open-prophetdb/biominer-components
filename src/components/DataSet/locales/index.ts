import { DataSetLocale } from './index.t'

const en_US: DataSetLocale = {
    message: 'Faster and stronger heavy-duty components will come soon.'
}

const zh_CN: DataSetLocale = {
    message: '稍后完成'
}

const getLocale = function (locale: string): DataSetLocale {
    if (locale === 'zh_CN') {
        return zh_CN
    } else {
        return en_US
    }
}

export default getLocale;