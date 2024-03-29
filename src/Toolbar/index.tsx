import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { ToolbarProps } from './index.t';

import './index.less';

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { position, onClick } = props;
  const [drawerActive, setDrawerActive] = useState<boolean>(false);
  const [container, setContainer] = useState<HTMLElement | false | undefined>(
    props.container == 'body' ? document.body : false,
  );

  useEffect(() => {
    if (props.visible) {
      setDrawerActive(props.visible);
    }
  }, [props.visible]);

  const switchDrawer = () => {
    if (props.onClose) {
      props.onClose();
    }
    setDrawerActive(!drawerActive);
  };

  // position: top, bottom, left, right
  const styleMap = {
    right: {
      right: '0px',
      top: '45%',
      height: '80px',
      width: '0px',
      borderColor: 'transparent #ddd transparent transparent',
    },
    top: {
      top: '0px',
      left: '45%',
      width: '80px',
      height: '0px',
      borderColor: '#ddd transparent transparent transparent',
    },
    left: {
      left: '0px',
      top: '45%',
      height: '80px',
      width: '0px',
      borderColor: 'transparent transparent transparent #ddd',
    },
    bottom: {
      left: '45%',
      bottom: '0px',
      width: '80px',
      height: '0px',
      borderColor: 'transparent transparent #ddd transparent',
    },
  };

  const handlerStyleMap = {
    right: {
      left: '5px',
      top: '8px',
    },
    top: {
      top: '-20px',
      left: '40%',
    },
    bottom: {
      left: '15px',
      top: '0px',
    },
    left: {
      left: '-15px',
      top: '8px',
    },
  };

  const pos = position ? position : 'right';
  const style = styleMap[pos] ? styleMap[pos] : styleMap['right'];
  const handlerStyle = handlerStyleMap[pos] ? handlerStyleMap[pos] : handlerStyleMap['right'];

  return (
    <div className="toolbar">
      <div
        style={{
          zIndex: 10,
          position: 'absolute',
          cursor: 'pointer',
          borderStyle: 'solid',
          borderWidth: '20px',
          boxSizing: 'border-box',
          ...style,
        }}
        onClick={() => {
          console.log('Show Drawer: ', pos);
          switchDrawer();
          if (onClick) {
            onClick(pos);
          }
        }}
      >
        <span style={{ position: 'absolute', ...handlerStyle }}>
          {pos === 'top' || pos === 'bottom' ? '=' : '||'}
        </span>
      </div>
      <Drawer
        width={props.width ? props.width : '300px'}
        height={props.height ? props.height : '300px'}
        title={props.title ? props.title : false}
        getContainer={container}
        rootStyle={{ position: 'absolute' }}
        closable={props.closable ? props.closable : false}
        mask={props.maskVisible ? props.maskVisible : false}
        placement={position}
        onClose={switchDrawer}
        open={drawerActive}
      >
        {drawerActive ? props.children : null}
      </Drawer>
    </div>
  );
};

export default Toolbar;
