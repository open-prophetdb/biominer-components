export type EdgeAttribute = {
  relid: string; // e.g. MONDO:0021040-Hetionet::DuG::Disease:Gene-ENTREZ:5468
  reltype: string; // e.g. Hetionet::DuG::Disease:Gene
  source: string; // e.g. Disease::MONDO:0021040
  target: string; // e.g. Gene::ENTREZ:5468
  source_id: string; // e.g. MONDO:0021040
  target_id: string; // e.g. ENTREZ:5468
  source_type: string; // e.g. Disease
  target_type: string; // e.g. Gene
  dataset: string; // e.g. drkg
  resource: string; // e.g. Hetionet
  key_sentence?: string; // e.g. "The gene ABCA4 is associated with the disease Stargardt disease 1."
  pmids?: string[]; // e.g. "12345678|23456789"
  score?: number; // e.g. 0.9
  [key: string]: any;
};
