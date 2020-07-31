import React from 'react';

import styles from './HSMList.module.css';
import { ReactComponent as TemplateIcon } from '../../../../assets/images/icons/Template/UnselectedDark.svg';
import { Template } from '../../Template';

export interface HSMListProps {}

export const HSMList: React.SFC<HSMListProps> = () => {
  const templateIcon = <TemplateIcon className={styles.TemplateIcon} />;

  return (
    <Template
      title="Templates"
      listItem="sessionTemplates"
      listItemName="HSM Template"
      pageLink="template"
      listIcon={templateIcon}
      filters={{ isHsm: true }}
    />
  );
};
