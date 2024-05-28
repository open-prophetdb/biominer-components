import { GraphEdge } from '../typings';

export type EdgeAttribute = {
  relid: string; // e.g. MONDO:0021040-Hetionet::DuG::Disease:Gene-ENTREZ:5468
  reltype: string; // e.g. Hetionet::DuG::Disease:Gene
  source_name: string; // e.g. Stargardt disease 1
  target_name: string; // e.g. ABCA4
  source_id: string; // e.g. MONDO:0021040
  target_id: string; // e.g. ENTREZ:5468
  source_type: string; // e.g. Disease
  target_type: string; // e.g. Gene
  score?: number; // e.g. 0.9
  metadata?: GraphEdge;
  [key: string]: any;
};


export type MetricAttribute = {
  entity_id: string;
  entity_type: string;
  entity_name: string;
  betweenness_score: number;
  degree_score: number;
  closeness_score: number;
  eigenvector_score: number;
  pagerank_score: number;
};

