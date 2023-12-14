export type NodeAttribute = {
  id: string; // e.g. Compound::DrugBank:DB00001
  label: string; // e.g. DrugBank:DB00001
  name: string; // e.g. Lepirudin
  resource: string; // e.g. DrugBank
  description?: string; // e.g. Lepirudin is identical to natural hirudin except for substitution of leucine for isoleucine at the N-terminal end of the molecule and the absence of a sulfate group on the tyrosine at position 63. It is produced via yeast cells. (Wikipedia)
  degree?: number; // e.g. 1
  cluster?: string; // e.g. Compound
  [key: string]: any;
};
