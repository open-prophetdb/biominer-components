import { GraphHistoryItem } from '../typings';

export type GraphFormProps = {
  /**
   * @description The payload of the graph which you want to save. You must provide this prop if you want to save the graph.
   */
  payload?: Record<string, unknown>;
  /**
   * @description Whether the form is visible.
   * @default false
   */
  visible?: boolean;
  /**
   * @description How to save the graph. If you provide this prop, the form will show a save button.
   * @default undefined
   */
  onSubmit?: (data: GraphHistoryItem) => Promise<void>;
  /**
   * @description A listener for the close event.
   * @default undefined
   */
  onClose?: () => Promise<void>;
  /**
   * @description The parent element of the form.
   * @default undefined
   */
  parent?: HTMLElement;
};
