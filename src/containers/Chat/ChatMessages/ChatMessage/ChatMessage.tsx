import React, { useState } from 'react';
import moment from 'moment';

import styles from './ChatMessage.module.css';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';
import { IconButton, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ListIcon from '../../../../components/UI/ListIcon/ListIcon';
import { NOTIFICATION } from '../../../../graphql/queries/Notification';
import { setNotification } from '../../../../common/notification';
import ToastMessage from '../../../../components/UI/ToastMessage/ToastMessage';

export interface ChatMessageProps {
  id: number;
  body: string;
  contactId: number;
  receiver: {
    id: number;
  };
  insertedAt: string;
}

const StyledIconButton = withStyles({
  root: {
    padding: '0',
    position: 'absolute',
    top: '0',
    right: '10px',
  },
})(IconButton);

export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  const client = useApolloClient();

  let additionalClass = styles.Mine;

  // State to store editted message label.
  const [messageTemplate, setMessageTemplate] = useState<string | null>(null);

  const [saveTemplate, { data }] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION);

  const message = useQuery(NOTIFICATION);

  if (props.receiver.id === props.contactId) {
    additionalClass = styles.Other;
  }

  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const showDialogBox = (props: any = {}) => {
    setMessageTemplate(props.body);
  };

  const handleCloseButton = () => {
    setMessageTemplate(null);
  };

  const handleOKButton = () => {
    saveTemplate({
      variables: {
        messageId: props.id,
        templateInput: {
          label: messageTemplate,
          shortcode: messageTemplate,
          languageId: '2',
        },
      },
    });
    console.log(data);
    setNotification(client, 'Message has been successfully saved as template');
    setMessageTemplate(null);
  };

  const onChange = (event: any = {}) => {
    setMessageTemplate(event.target.value);
  };

  let textField;
  if (messageTemplate) {
    textField = (
      <TextField
        autoFocus
        margin="dense"
        id="name"
        type="text"
        fullWidth
        value={messageTemplate}
        onChange={onChange}
      />
    );
  }

  let dialogBox;
  if (messageTemplate) {
    dialogBox = (
      <DialogBox
        handleCancel={handleCloseButton}
        handleOk={handleOKButton}
        title={'Save message as Template?'}
        children={textField}
      />
    );
  }

  let toastMessage;
  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  return (
    <div className={[styles.ChatMessage, additionalClass].join(' ')}>
      <StyledIconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={() => showDialogBox(props)}
      >
        <ListIcon icon="verticalMenu" fontSize="small" />
      </StyledIconButton>
      <div className={styles.Content} data-testid="content">
        {props.body}
      </div>
      <div className={styles.Date} data-testid="date">
        {moment(props.insertedAt).format('HH:mm')}
      </div>
      {dialogBox}
      {toastMessage}
    </div>
  );
};
