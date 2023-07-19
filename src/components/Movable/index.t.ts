export type MovableProps = {
  onClose?: () => void;
  width?: string;
  title?: string;
  top?: string;
  right?: string;
  help?: string | JSX.Element;
  children?: JSX.Element | JSX.Element[];
};
