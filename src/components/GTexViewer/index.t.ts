export type GTexViewerProps = {
  /**
   * @description The id of the root node
   * @default undefined
   */
  rootId?: string;
  /**
   * @description The type of data to display
   * @default undefined
   */
  type: 'gene' | 'transcript';
  /**
   * @description The title of charts in the GTexViewer panel
   * @default undefined
   */
  title?: string;
  /**
   * @description The official gene symbol, e.g. 'PRG4', only support human gene for now
   * @default ''
   */
  officialGeneSymbol: string;
  /**
   * @description The summary of the gene, e.g. Overall, this table provides insights into the tissue-specific expression pattern of the PRG4 gene in human tissues, as well as the specific transcript variants that are expressed in each tissue. The median expression levels suggest that PRG4 is highly expressed in some tissues, such as Adipose_Visceral_Omentum and Artery_Tibial, but not expressed or expressed at very low levels in other tissues, such as Bladder and Brain_Amygdala. The information in this table can be used to gain a better understanding of the role of PRG4 in different tissues and may be useful in designing future studies investigating the gene's function in health and disease.
   * @default undefined
   */
  summary?: string;
  /**
   * @description The title of the summary
   * @default undefined
   */
  summaryTitle?: string;
};
