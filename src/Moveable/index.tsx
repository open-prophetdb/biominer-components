import React, { useEffect, useRef } from 'react';
import { Popover } from 'antd';
import Moveable from 'react-moveable';
import { CloseCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import { MovableProps } from './index.t';
import './index.less';

const Movable: React.FC<MovableProps> = (props) => {
  const explanationPanelRef = useRef<HTMLDivElement>(null);
  const movableComponentRef = useRef<HTMLDivElement>(null);
  const dragHandlerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (movableComponentRef.current) {
      const component = movableComponentRef.current;
      component.addEventListener('click', () => {
        console.log('Focus the explanation panel');
        component.style.zIndex = '3';

        const otherComponents = document.getElementsByClassName('explanation-panel');
        for (let i = 0; i < otherComponents.length; i++) {
          const otherComponent = otherComponents[i] as HTMLDivElement;
          if (otherComponent !== component) {
            otherComponent.style.zIndex = '2';
          }
        }
      });
    }
  }, [movableComponentRef.current]);

  return (
    <div
      className={"explanation-panel" + (props.className ? ` ${props.className}` : '')}
      ref={movableComponentRef}
      style={{
        top: props.top || '200px',
        right: props.right || props.width || 'unset',
        left: props.left || props.width || 'unset',
      }}
    >
      <div
        ref={explanationPanelRef}
        style={{
          position: 'absolute',
          width: props.width || '400px',
          height: props.height || 'auto',
          minWidth: props.minWidth || '200px',
          minHeight: props.minHeight || '200px',
          maxWidth: props.maxWidth || 'auto',
          maxHeight: props.maxHeight || 'auto',
        }}
        className="explanation-content"
      >
        <div className="explanation-title" ref={dragHandlerRef}>
          <h3>{props.title || 'Explanation'}</h3>
          <span>
            {props.help ? (
              <Popover content={props.help} title="Help" placement="topRight">
                <QuestionCircleFilled />
              </Popover>
            ) : null}
            {props.onClose ? (
              <CloseCircleFilled
                className="explanation-close"
                onClick={() => {
                  props.onClose?.();
                }}
              />
            ) : null}
          </span>
        </div>
        <div
          className="explanation-info"
          onDrag={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {props.children}
        </div>
      </div>
      {/* More details on https://daybrush.com/moveable/storybook/index.html?path=/story/basic--basic-resizable */}
      <Moveable
        target={explanationPanelRef}
        dragTarget={dragHandlerRef}
        draggable={props.draggable !== undefined ? props.draggable : true}
        throttleDrag={1}
        edgeDraggable={true}
        startDragRotate={0}
        throttleDragRotate={0}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
        }}
        resizable={props.resizable !== undefined ? props.resizable : true}
        keepRatio={props.keepRatio !== undefined ? props.keepRatio : false}
        throttleResize={1}
        renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
          e.target.style.transform = e.drag.transform;
        }}
      />
    </div>
  );
};

export default Movable;
