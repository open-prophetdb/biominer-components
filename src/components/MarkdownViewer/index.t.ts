export type MarkdownParams = {
  filelink: string;
};

export type MarkdownProps = {
  /**
   * @description A text of markdown
   */
  markdown?: string;
  /**
   * @description A url of markdown file, such as https://raw.githubusercontent.com/kevin940726/react-markdown-editor-lite/master/README.md
   * @default null
   */
  url?: string | null;
  /**
   * @description How to get file? If you want to use a url instead of a text, you need to implement this function.
   * ```js
   * async (params: MarkdownParams) => {
   *    const { filelink } = params;
   *    const res = await fetch(filelink);
   *    const text = await res.text();
   *    return text;
   * }
   * ```
   * @default undefined
   */
  getFile?: (params: MarkdownParams) => Promise<any>;
  /**
   * @description Whether show table of contents? true | false
   * @default false
   */
  enableToc?: boolean;
  /**
   * @description Whether show video? true | false
   * @default false
   */
  enableVideo?: boolean;
  /**
   * @description Whether show raw? true | false
   * @default false
   */
  enableRaw?: boolean;
  /**
   * @description Whether show slug? true | false
   * @default false
   */
  enableSlug?: boolean;
};
