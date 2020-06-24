import React, { useState } from 'react';
import moment from 'moment';

import styles from './ChatMessage.module.css';
import { DialogBox } from '../../../../components/UI/DialogBox/DialogBox';
import { useMutation } from '@apollo/client';
import { SAVE_MESSAGE_TEMPLATE_MUTATION } from '../../../../graphql/mutations/MessageTemplate';
import { IconButton, TextField, Dialog } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { makeStyles } from '@material-ui/core/styles';

export interface ChatMessageProps {
  id: number;
  body: string;
  contactId: number;
  receiver: {
    id: number;
  };
  insertedAt: string;
}

const useStyles = makeStyles({
  iconButton: {
    position: 'absolute',
    right: '5px',
    top: '10px',
    padding: '0',
  },
  vertIcon: {
    fontSize: '18px',
  },
});
export const ChatMessage: React.SFC<ChatMessageProps> = (props) => {
  const classes = useStyles();
  let additionalClass = styles.Mine;

  // State to store editted message label.
  const [messageTemplate, setMessageTemplate] = useState<string | null>(null);
  const [saveTemplate] = useMutation(SAVE_MESSAGE_TEMPLATE_MUTATION);

  if (props.receiver.id === props.contactId) {
    additionalClass = styles.Other;
  }

  const showDialogBox = (props: any = {}) => {
    setMessageTemplate(props.body);
    console.log(props);
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
          shortcode: 'my id 8',
          languageId: '2',
        },
      },
    });
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
        label="Email Address"
        type="email"
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

  return (
    <div className={[styles.ChatMessage, additionalClass].join(' ')}>
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        className={classes.iconButton}
        onClick={() => showDialogBox(props)}
      >
        <MoreVertIcon className={classes.vertIcon} />
      </IconButton>
      <div className={styles.Content} data-testid="content">
        {props.body}
      </div>
      <div className={styles.Date} data-testid="date">
        {moment(props.insertedAt).format('HH:mm')}
      </div>
      {dialogBox}
    </div>
  );
};
