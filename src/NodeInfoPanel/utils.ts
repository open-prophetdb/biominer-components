import axios from 'axios';
import { GeneInfo } from '../typings';

export const parseEntityId = (entityId: string) => {
  const [source, id] = entityId.split(':');

  if (!id) {
    // throw new Error(`Invalid entity id: ${entityId}`);
    return { source: 'unknown', id: source };
  }

  return { source, id };
};

export const entityId2id = (entityId: string) => {
  const { id } = parseEntityId(entityId);
  return id;
};

// geneId: e.g. 7157. It's a entrez gene id
export const getGeneInfo = async (geneId: string) => {
  const { data } = await axios.get(`https://mygene.info/v3/gene/${geneId}`);

  const formatedData: GeneInfo = {
    _id: data._id,
    _version: data._version,
    entrezgene: data.entrezgene,
    hgnc: data['HGNC'],
    name: data.name,
    symbol: data.symbol,
    taxid: data.taxid,
    type_of_gene: data.type_of_gene,
    summary: data.summary,
    // TODO: handle the case when ensembl is undefined
    ensembl: {
      gene: data.ensembl.gene,
      transcript: data.ensembl.transcript,
      protein: data.ensembl.protein,
      translation: data.ensembl.translation,
    },
    genomic_pos: {
      chr: data.genomic_pos.chr,
      start: data.genomic_pos.start,
      end: data.genomic_pos.end,
      strand: data.genomic_pos.strand,
    },
  };

  return formatedData;
};
