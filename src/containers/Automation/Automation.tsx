import React, { useState } from 'react';
import { Input } from '../../components/UI/Form/Input/Input';
import { ListItem } from '../List/ListItem/ListItem';
import { ReactComponent as AutomationIcon } from '../../assets/images/icons/Automations/Selected.svg';
import styles from './Automation.module.css';

import {
  CREATE_AUTOMATION,
  UPDATE_AUTOMATION,
  DELETE_AUTOMATION,
} from '../../graphql/mutations/Automation';

import { GET_AUTOMATION } from '../../graphql/queries/Automation';

export interface AutomationProps {
  match: any;
}

const setValidation = (values: any) => {
  const errors: Partial<any> = {};
  if (!values.shortcode) {
    errors.shortcode = 'shortcode is required';
  }

  return errors;
};

const dialogMessage = "You won't be able to use this automation again.";

const formFields = [
  {
    component: Input,
    name: 'shortcode',
    type: 'text',
    placeholder: 'Shortcode',
  },
  {
    component: Input,
    name: 'name',
    type: 'text',
    placeholder: 'Name',
  },
];

const automationIcon = <AutomationIcon className={styles.AutomationIcon} />;

const queries = {
  getItemQuery: GET_AUTOMATION,
  createItemQuery: CREATE_AUTOMATION,
  updateItemQuery: UPDATE_AUTOMATION,
  deleteItemQuery: DELETE_AUTOMATION,
};

export const Automation: React.SFC<AutomationProps> = ({ match }) => {
  const [shortcode, setShortcode] = useState('');
  const [name, setName] = useState('');

  const states = { shortcode, name };

  const setStates = ({ shortcode, name }: any) => {
    setShortcode(shortcode);
    setName(name);
  };

  const additionalAction = { label: 'Configure', link: '/automation/configure' };

  return (
    <ListItem
      {...queries}
      match={match}
      states={states}
      setStates={setStates}
      setValidation={setValidation}
      listItemName="automation"
      dialogMessage={dialogMessage}
      formFields={formFields}
      redirectionLink="automation"
      cancelLink="automation"
      linkParameter="uuid"
      listItem="flow"
      icon={automationIcon}
      additionalAction={additionalAction}
      languageSupport={false}
    />
  );
};
