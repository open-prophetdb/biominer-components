export type MovableProps = {
  onClose?: () => void;
  width?: string;
  height?: string;
  title?: string;
  top?: string;
  right?: string;
  left?: string;
  help?: string | JSX.Element;
  children?: JSX.Element | JSX.Element[];
  maxHeight?: string;
  maxWidth?: string;
  minHeight?: string;
  minWidth?: string;
  className?: string;
  resizable?: boolean;
  draggable?: boolean;
  keepRatio?: boolean;
};
