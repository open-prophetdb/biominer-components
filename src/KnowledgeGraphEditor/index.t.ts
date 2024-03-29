import type { EntityQueryParams, EntityRecordsResponse, StatisticsResponse } from '../typings';

export type GraphEdge = {
  source_name: string;
  source_id: string;
  source_type: string;
  target_name: string;
  target_id: string;
  target_type: string;
  key_sentence: string;
  relation_type: string;
  id?: number;
  curator?: string;
  created_at?: number;
  pmid: number;
};

export type GraphTableData = {
  data: GraphEdge[];
  total: number;
  page: number;
  pageSize: number;
};

// More details on the following papers:
export const RelationTypeDict: Record<string, string> = {
  AdG: 'Anatomy-downregulates-Gene',
  AeG: 'Anatomy-expresses-Gene',
  AuG: 'Anatomy-upregulates-Gene',
  CbG: 'Compound-binds-Gene',
  CcSE: 'Compound-causes-Side Effect',
  CdG: 'Compound-downregulates-Gene',
  CpD: 'Compound-palliates-Disease',
  CrC: 'Compound-resembles-Compound',
  CtD: 'Compound-treats-Disease',
  CuG: 'Compound-upregulates-Gene',
  DaG: 'Disease-associates-Gene',
  DdG: 'Disease-downregulates-Gene',
  DlA: 'Disease-localizes-Anatomy',
  DpS: 'Disease-presents-Symptom',
  DrD: 'Disease-resembles-Disease',
  DuG: 'Disease-upregulates-Gene',
  GcG: 'Gene-covaries-Gene',
  GiG: 'Gene-interacts-Gene',
  GpBP: 'Gene-participates-Biological Process',
  GpCC: 'Gene-participates-Cellular Component',
  GpMF: 'Gene-participates-Molecular Function',
  GpPW: 'Gene-participates-Pathway',
  'Gr>G': 'Gene-regulates-Gene',
  PCiC: 'Pharmacologic Class-includes-Compound',
  AGONIST: 'Agonist',
  'PARTIAL AGONIST': 'Partial Agonist',
  INHIBITOR: 'Inhibitor',
  ACTIVATOR: 'Activator',
  ANTAGONIST: 'Antagonist',
  BINDER: 'Binder',
  'CHANNEL BLOCKER': 'Channel Blocker',
  BLOCKER: 'Blocker',
  'POSITIVE ALLOSTERIC MODULATOR': 'Positive Allosteric Modulator',
  'ALLOSTERIC MODULATOR': 'Allosteric Modulator',
  MODULATOR: 'Modulator',
  OTHER: 'Other',
  ANTIBODY: 'Antibody',
  enzyme: 'enzyme',
  target: 'target',
  'x-atc': 'x-atc',
  treats: 'treats',
  carrier: 'carrier',
  'PROTEIN CLEAVAGE': 'Protein Cleavage',
  'PHYSICAL ASSOCIATION': 'Physical Association',
  ASSOCIATION: 'Association',
  'DIRECT INTERACTION': 'Direct Interaction',
  COLOCALIZATION: 'Colocalization',
  'DEPHOSPHORYLATION REACTION': 'Dephosphorylation Reaction',
  'CLEAVAGE REACTION': 'Cleavage Reaction',
  'PHOSPHORYLATION REACTION': 'Phosphorylation Reaction',
  'ADP RIBOSYLATION REACTION': 'Adp Ribosylation Reaction',
  'UBIQUITINATION REACTION': 'Ubiquitination Reaction',
  PTMOD: 'Ptmod',
  BINDING: 'Binding',
  ACTIVATION: 'Activation',
  REACTION: 'Reaction',
  CATALYSIS: 'Catalysis',
  INHIBITION: 'Inhibition',
  EXPRESSION: 'Expression',
  DrugVirGen: 'DrugVirGen',
  HumGenHumGen: 'HumGenHumGen',
  Coronavirus_ass_host_gene: 'Coronavirus_ass_host_gene',
  VirGenHumGen: 'VirGenHumGen',
  Covid2_acc_host_gene: 'Covid2_acc_host_gene',
  DrugHumGen: 'DrugHumGen',
  'A+': 'agonism, activation',
  'A-': 'antagonism, blocking',
  B: 'binding, ligand (esp. receptors)',
  'E+': 'increases expression/production',
  'E-': 'decreases expression/production',
  E: 'affects expression/production (neutral)',
  N: 'inhibits',
  O: 'transport, channels',
  K: 'metabolism, pharmacokinetics',
  Z: 'enzyme activity',
  T: 'treatment/therapy (including investigatory)',
  C: 'inhibits cell growth (esp. cancers)',
  Sa: 'side effect/adverse event',
  Pr: 'prevents, suppresses',
  Pa: 'alleviates, reduces',
  J: 'role in disease pathogenesis',
  Mp: 'biomarkers (of disease progression)',
  U: 'causal mutations',
  Ud: 'mutations affecting disease course',
  D: 'drug targets',
  Te: 'possible therapeutic effect',
  Y: 'polymorphisms alter risk',
  G: 'promotes progression',
  Md: 'biomarkers (diagnostic)',
  X: 'overexpression in disease',
  L: 'improper regulation linked to disease',
  W: 'enhances response',
  'V+': 'activates, stimulates',
  I: 'signaling pathway',
  H: 'same protein or complex',
  Rg: 'regulation',
  Q: 'production by cell population',
};

export type RelationType = {
  source: string;
  relationType: string;
  fullRelationType: string;
  description?: string;
};

export type GetEntitiesFn = (params: EntityQueryParams) => Promise<EntityRecordsResponse>;

export type GetStatistics = () => Promise<StatisticsResponse>;

export type OnSubmitFn = (data: GraphEdge) => Promise<GraphEdge>;

export type DeleteKnowledgeByIdFn = (id: number) => Promise<any>;

export type GraphFormProps = {
  onSubmit?: OnSubmitFn;
  onClose?: () => void;
  formData?: GraphEdge;
  getEntities: GetEntitiesFn;
  getStatistics: GetStatistics;
  curator?: string;
};

export type KnowledgeGetterParams = {
  /** Query string with json specification. */
  query_str?: string;
  /** Page, From 1. */
  page?: number;
  /** Num of items per page. */
  page_size?: number;
};

export type Knowledge = GraphEdge;

export type KnowledgeRecordsResponse = {
  /** Total number of records. */
  total: number;
  /** List of records. */
  records: Knowledge[];
  /** Page number. */
  page: number;
  /** Num of items per page. */
  page_size: number;
};

export type PostKnowledgeFn = (data: Knowledge) => Promise<Knowledge>;

export type PutKnowledgeByIdFn = (id: number, data: Knowledge) => Promise<Knowledge>;

export type GetKnowledgesFn = (params: KnowledgeGetterParams) => Promise<KnowledgeRecordsResponse>;

export type KnowledgeGraphEditorProps = {
  getEntities: GetEntitiesFn;
  getStatistics: GetStatistics;
  getKnowledges: GetKnowledgesFn;
  postKnowledge?: PostKnowledgeFn;
  putKnowledgeById?: PutKnowledgeByIdFn;
  deleteKnowledgeById?: DeleteKnowledgeByIdFn;
};
