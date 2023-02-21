import React, {
  ReactElement,
  useContext,
  useEffect,
  ClipboardEvent,
  MouseEvent,
  KeyboardEvent,
  CompositionEvent,
} from 'react';
import classNames from 'classnames';
import AuthContext from '../../contexts/AuthContext';
import { commentDateFormat } from '../../lib/dateFormat';
import styles from './CommentBox.module.css';
import { ProfilePicture } from '../ProfilePicture';
import Markdown from '../Markdown';
import { RecommendedMentionTooltip } from '../tooltips/RecommendedMentionTooltip';
import { fixHeight, UseUserMentionOptions } from '../../hooks/useUserMention';
import { Post } from '../../graphql/posts';
import { cleanupEmptySpaces } from '../../lib/strings';
import {
  ArrowKey,
  BaseInputEvent,
  checkIsKeyboardCommand,
  KeyboardCommand,
  Y_AXIS_KEYS,
} from '../../lib/element';

type TextareaInputEvent = CompositionEvent<HTMLTextAreaElement> &
  BaseInputEvent;

export interface CommentBoxProps {
  authorName: string;
  authorImage: string;
  publishDate: Date | string;
  contentHtml: string;
  editContent?: string;
  input?: string;
  errorMessage?: string;
  sendingComment?: boolean;
  parentSelector?: () => HTMLElement;
  sendComment: (event: MouseEvent | KeyboardEvent) => Promise<void>;
  onInput?: (value: string) => unknown;
  useUserMentionOptions: UseUserMentionOptions;
  post: Post;
}

function CommentBox({
  authorImage,
  authorName,
  publishDate,
  contentHtml,
  editContent,
  input,
  errorMessage,
  onInput,
  sendComment,
  parentSelector,
  useUserMentionOptions,
}: CommentBoxProps): ReactElement {
  const { user } = useContext(AuthContext);
  const {
    onMentionClick,
    onMentionKeypress,
    offset,
    mentions,
    mentionQuery,
    selected,
    commentRef,
    onInputClick,
  } = useUserMentionOptions;
  useEffect(() => {
    commentRef.current?.focus();
    if (commentRef.current) {
      if (editContent) {
        // eslint-disable-next-line no-param-reassign
        commentRef.current.value = input || editContent;
      }
      commentRef.current.setAttribute(
        'data-min-height',
        commentRef.current.offsetHeight.toString(),
      );
    }
  }, []);

  const onPaste = (event: ClipboardEvent): void => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    if (document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, text);
    } else {
      document.execCommand('paste', false, text);
    }
  };

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const pressedSpecialkey = e.ctrlKey || e.metaKey;
    if (pressedSpecialkey && e.key === KeyboardCommand.Enter && input?.length) {
      return sendComment(e);
    }

    const isNavigatingPopup =
      e.key === KeyboardCommand.Enter ||
      Y_AXIS_KEYS.includes(e.key as ArrowKey);
    if (isNavigatingPopup && mentions?.length) {
      return e.preventDefault();
    }

    return e.stopPropagation();
  };

  const onTextareaInput = (e: TextareaInputEvent) => {
    const target = e.target as HTMLInputElement;
    fixHeight(target);
    onInput(cleanupEmptySpaces(target.value));

    onMentionKeypress(e.data, e);
  };

  const onKeyUp = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (checkIsKeyboardCommand(e)) onMentionKeypress(e.key, e);
  };

  useEffect(() => {
    if (!mentions?.length) commentRef?.current?.focus();
  }, [mentions]);

  return (
    <>
      <article className="break-words-overflow flex flex-col items-stretch rounded-8 typo-callout">
        <header className="mb-2 flex items-center">
          <ProfilePicture
            size="large"
            rounded="full"
            user={{ image: authorImage, username: authorName }}
            nativeLazyLoading
          />
          <div className="ml-2 flex flex-col">
            <div className="truncate typo-callout">{authorName}</div>
            <time
              dateTime={publishDate.toString()}
              className="text-theme-label-tertiary typo-callout"
            >
              {commentDateFormat(publishDate)}
            </time>
          </div>
        </header>
        <Markdown content={contentHtml} />
      </article>
      <div className="flex h-11 items-center px-2">
        <div className="ml-3 h-full w-px bg-theme-divider-tertiary" />
        <div className="ml-6 text-theme-label-secondary typo-caption1">
          Reply to{' '}
          <strong className="font-bold text-theme-label-primary">
            {authorName}
          </strong>
        </div>
      </div>
      <div className="relative flex flex-1 pl-2">
        <ProfilePicture user={user} size="small" nativeLazyLoading />
        <textarea
          className={classNames(
            'ml-3 flex-1 text-theme-label-primary bg-transparent border-none caret-theme-label-link break-words typo-subhead resize-none',
            styles.textarea,
          )}
          defaultValue={input}
          ref={commentRef}
          placeholder="Share your thoughts"
          onInput={onTextareaInput}
          onKeyDown={handleKeydown}
          onKeyUp={onKeyUp}
          onClick={onInputClick}
          onPaste={onPaste}
          tabIndex={0}
          aria-label="New comment box"
          aria-multiline
        />
      </div>
      <RecommendedMentionTooltip
        elementRef={commentRef}
        offset={offset}
        mentions={mentions}
        selected={selected}
        query={mentionQuery}
        appendTo={parentSelector}
        onMentionClick={onMentionClick}
      />
      <div
        className="my-2 mx-3 text-theme-status-error typo-caption1"
        style={{ minHeight: '1rem' }}
      >
        {errorMessage && <span role="alert">{errorMessage}</span>}
      </div>
    </>
  );
}

export default CommentBox;
