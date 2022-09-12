import { PathologyViewerLocale } from './index.t'

const en_US: PathologyViewerLocale = {
    message: 'Faster and stronger heavy-duty components will come soon.'
}

const zh_CN: PathologyViewerLocale = {
    message: '稍后完成'
}

const getLocale = function (locale: string): PathologyViewerLocale {
    if (locale === 'zh_CN') {
        return zh_CN
    } else {
        return en_US
    }
}

export default getLocale;