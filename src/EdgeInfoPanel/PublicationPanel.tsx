import React, { useEffect, useState } from 'react';
import { Button, List, message } from 'antd';
import { FileProtectOutlined } from '@ant-design/icons';
import type { Publication, APIs, PublicationDetail } from '../typings';
import PublicationDesc from './PublicationDesc';

import './index.less';

export type PublicationPanelProps = {
    queryStr: string;
    fetchPublications: APIs['GetPublicationsFn'];
    fetchPublication: APIs['GetPublicationFn'];
};

const PublicationPanel: React.FC<PublicationPanelProps> = (props) => {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(false);
    const [publicationMap, setPublicationMap] = useState<Record<string, PublicationDetail>>({});

    const showAbstract = (doc_id: string): Promise<PublicationDetail> => {
        console.log('Show Abstract: ', doc_id);
        return new Promise((resolve, reject) => {
            props.fetchPublication && props.fetchPublication(doc_id).then((publication) => {
                console.log('Publication: ', publication);
                setPublicationMap({
                    ...publicationMap,
                    [doc_id]: publication
                })
                resolve(publication);
            }).catch((error) => {
                console.error('Error: ', error);
                reject(error);
            });
        });
    };

    useEffect(() => {
        if (!props.queryStr) {
            return;
        }

        setLoading(true);
        props.fetchPublications && props.fetchPublications(props.queryStr, 0, 10).then((publications) => {
            setPublications(publications.records);
            setPage(publications.page);
            setTotal(publications.total);
            setPageSize(publications.page_size);
        }).catch((error) => {
            console.error('Error: ', error);
            message.error('Failed to fetch publications');
        }).finally(() => {
            setLoading(false);
        });
    }, [props.queryStr, page, pageSize]);

    const showPublication = (doc_id: string) => () => {
        console.log('Show Publication: ', doc_id);
        if (publicationMap[doc_id]) {
            console.log('Publication Map: ', publicationMap);
            const link = publicationMap[doc_id]?.provider_url;
            const doi_link = "https://doi.org/" + publicationMap[doc_id]?.doi;

            if (doi_link) {
                window.open(doi_link, '_blank');
            } else if (link) {
                window.open(link, '_blank');
            } else {
                message.warning('No link available for this publication');
            }
        } else {
            showAbstract(doc_id);
        }
    };

    return (
        <>
            <div className='publication-panel-header'>
                <h3>
                    Relevant Publications [Click the title to view the publication]
                </h3>
                <span>Keywords: {props.queryStr.split('#').join(', ')}</span>
            </div>
            <List
                loading={loading}
                itemLayout="horizontal"
                rowKey={'doc_id'}
                dataSource={publications}
                size="large"
                pagination={{
                    disabled: true,
                    position: 'top',
                    current: page,
                    total: total,
                    pageSize: pageSize,
                    onChange: (page: number, pageSize: number) => {
                        setPage(page);
                        setPageSize(pageSize);
                    }
                }}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<FileProtectOutlined />}
                            title={<a onClick={showPublication(item.doc_id)}>{item.title}</a>}
                            description={
                                <PublicationDesc summary={item.summary} authors={item.authors}
                                    journal={item.journal} year={item.year}
                                    citationCount={item.citation_count} docId={item.doc_id}
                                    showAbstract={showAbstract} queryStr={props.queryStr}
                                />
                            }
                        />
                    </List.Item>
                )}
            />
        </>
    );
};

export default PublicationPanel;
