export type ToolbarProps = {
  /**
   * @description Position of the toolbar
   * @default right
   */
  position: 'right' | 'left' | 'top' | 'bottom' | undefined;
  /**
   * @description Width of the toolbar
   * @default 300px
   */
  width?: string;
  /**
   * @description Title of the toolbar
   * @default false
   */
  title?: string;
  /**
   * @description Whether the toolbar is closable
   * @default false
   */
  closable?: boolean;
  /**
   * @description Whether the toolbar is maskVisible
   * @default false
   */
  maskVisible?: boolean;
  /**
   * @description Height of the toolbar
   * @default 300px
   */
  height?: string;
  /**
   * @description Whether the toolbar is visible
   * @default false
   */
  visible?: boolean;
  /**
   * @description Listener for the close event
   * @default () => {}
   */
  onClose?: () => void;
  /**
   * @description Listener for the click event of the toolbar
   * @default () => {}
   */
  onClick?: (position: string) => void;
  /**
   * @description Any valid ReactNode which will be rendered inside of the toolbar container
   * @default null
   */
  children?: React.ReactNode;
  /**
   * @description If you would like to render the toolbar in a specific container, you need to set the toolbar's position to `relative`. If not, the toolbar will be rendered in the body.
   * @default false
   */
  container?: false | 'body';
};
