import React, { useState } from 'react';
import { Button } from 'antd';
import parse from 'html-react-parser';

export const SEPARATOR = '#';

const Desc: React.FC<{
    summary: string; authors?: string[],
    journal: string, year?: number,
    citationCount?: number, docId: string,
    showAbstract: (doc_id: string) => Promise<any>,
    queryStr: string
}> = (props) => {
    const [abstract, setAbstract] = useState<string>('');
    const [abstractVisible, setAbstractVisible] = useState<boolean>(false);

    const fetchAbstract = (doc_id: string) => {
        props.showAbstract(doc_id).then((publication) => {
            console.log('fetchAbstract for a publication: ', publication);
            setAbstract(publication.article_abstract || '');
            setAbstractVisible(true);
        }).catch((error) => {
            console.error('Error: ', error);
            setAbstract('');
            setAbstractVisible(false);
        });
    };

    const escapeRegExp = (str: string) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const highlightWords = (text: string, words: string[]): string => {
        let newText = text;
        words.forEach(word => {
            let escapedWord = escapeRegExp(word);
            let regex = new RegExp(`(${escapedWord})(?![^<]*>|[^<>]*<\/)`, 'gi');
            newText = newText.replace(regex, '<span class="highlight">$1</span>');
        });

        return newText;
    }

    return (
        <div>
            <p>
                {parse(highlightWords(props.summary, props.queryStr.split(SEPARATOR)))}
                <Button type="link" onClick={() => {
                    if (abstractVisible) {
                        setAbstractVisible(false);
                    } else {
                        fetchAbstract(props.docId);
                    }
                }} style={{ paddingLeft: '2px' }}>
                    {abstractVisible ? 'Hide Abstract' : 'Show Abstract'}
                </Button>
            </p>
            {
                abstractVisible ?
                    <p>{parse(highlightWords(abstract, props.queryStr.split(SEPARATOR)))}</p> : null
            }
            <p>
                {props.year} | {props.journal} &nbsp; | &nbsp; {props.authors ? props.authors.join(', ') : 'Unknown'}
            </p>
            {
                props.citationCount ?
                    <p>Cited by {props.citationCount} publications</p> : null
            }
        </div>
    );
};

export default Desc;