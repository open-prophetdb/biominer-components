// @ts-nocheck
import React from 'react';
import moment from 'moment';
import ErrorIcon from './error-icon.svg';
import avatar from './placeholder.png';
import DislikeOutlined from './dislike.svg';
import LikeOutlined from './like.svg';
import DeleteOutlined from './delete.svg';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';

// Create a functional react component
const Tooltip = (props) => {
  return (
    <div className="tooltip">
      {props.children}
      <span className="tooltiptext">{props.title}</span>
    </div>
  );
};

function getLocale() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

function MessageBox(props) {
  const {
    type, // text, indicator, notification, markdown
    timestamp,
    timestampFormat,
    buttons,
    left,
    author,
    hasError,
    text,
    likeHandler,
    dislikeHandler,
    deleteHandler,
  } = props;

  const locale = getLocale();
  if (type === 'text' || type === 'indicator' || type === 'markdown') {
    let time;
    if (timestamp) {
      if (timestampFormat === 'calendar') {
        time = moment(timestamp).locale(locale).calendar();
      } else if (timestampFormat === 'fromNow') {
        time = moment(timestamp).locale(locale).fromNow();
      } else {
        time = moment(timestamp).locale(locale).format(timestampFormat);
      }
    }

    const _buttons = buttons
      ? buttons.map((button, idx) => {
          if (button.type === 'URL') {
            return (
              <a
                key={idx}
                href={button.payload}
                rel="noreferrer"
                target="_blank"
                className="react-chat-message-button"
              >
                {button.title}
              </a>
            );
          }
        })
      : [];

    // Allow for custom rehype plugins, such as rehype-autolink-headings, rehype-slug, rehype-raw, etc.
    const rehypePlugins = props.rehypePlugins || [];

    return (
      <div
        className={`react-chat-messageBox ${
          left ? 'react-chat-messageBoxLeft' : 'react-chat-messageBoxRight'
        }`}
      >
        <img
          alt="avater img"
          src={author.avatarUrl ? author.avatarUrl : avatar}
          className={`react-chat-avatar ${
            left ? 'react-chat-avatarLeft' : 'react-chat-avatarRight'
          }`}
        />
        <div
          className={`react-chat-message ${
            left ? 'react-chat-messageLeft' : 'react-chat-messageRight'
          }`}
        >
          <div className="react-chat-additional">{author.username}</div>
          <div
            className={`react-chat-bubble ${
              left ? 'react-chat-leftBubble' : 'react-chat-rightBubble'
            } ${hasError ? 'react-chat-bubbleWithError' : ''}`}
          >
            {type === 'indicator' && (
              <div className="react-chat-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            {type === 'text' && text}
            {type === 'markdown' &&
              (text ? (
                <ReactMarkdown
                  className="message-markdown-viewer"
                  rehypePlugins={rehypePlugins}
                  remarkPlugins={[remarkGfm]}
                >
                  {text}
                </ReactMarkdown>
              ) : (
                text
              ))}
            {_buttons.length > 0 && (
              <div
                className={
                  left
                    ? 'react-chat-message-buttonGroupLeft'
                    : 'react-chat-message-buttonGroupRight'
                }
              >
                {_buttons}
              </div>
            )}
            {hasError && (
              <img
                src={ErrorIcon}
                className={`${
                  left ? 'react-chat-errorLeft' : 'react-chat-errorRight'
                } react-chat-error`}
              />
            )}
          </div>
          <div className="react-chat-additional">
            {time !== null && time}
            <span className="react-chat-message-like">
              <img
                src={LikeOutlined}
                className={'chatbox-icon'}
                onClick={(e) => {
                  if (likeHandler) likeHandler(props);
                }}
              />
              <img
                src={DislikeOutlined}
                className={'chatbox-icon'}
                onClick={(e) => {
                  if (dislikeHandler) dislikeHandler(props);
                }}
              />
              <img
                src={DeleteOutlined}
                className={'chatbox-icon'}
                onClick={(e) => {
                  if (deleteHandler) deleteHandler(props);
                }}
              />
            </span>
          </div>
        </div>
      </div>
    );
  } else if (type === 'notification') {
    return <div className="text-center text-secondary react-chat-notification">{text}</div>;
  }
}

export default MessageBox;
