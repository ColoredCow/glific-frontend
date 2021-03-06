import React, { useState, useEffect, useCallback } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, useMutation, DocumentNode, useLazyQuery } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { setNotification, setErrorMessage } from '../../common/notification';
import { IconButton, Typography } from '@material-ui/core';
import { Button } from '../../components/UI/Form/Button/Button';
import { Loading } from '../../components/UI/Layout/Loading/Loading';
import { Pager } from '../../components/UI/Pager/Pager';
import { NOTIFICATION } from '../../graphql/queries/Notification';
import { ToastMessage } from '../../components/UI/ToastMessage/ToastMessage';
import { DialogBox } from '../../components/UI/DialogBox/DialogBox';
import styles from './List.module.css';
import SearchBar from '../../components/UI/SearchBar/SearchBar';
import { ReactComponent as DeleteIcon } from '../../assets/images/icons/Delete/Red.svg';
import { ReactComponent as EditIcon } from '../../assets/images/icons/Edit.svg';
import { ReactComponent as CrossIcon } from '../../assets/images/icons/Cross.svg';
import { ReactComponent as BackIcon } from '../../assets/images/icons/Back.svg';
import { ListCard } from './ListCard/ListCard';
import { GET_CURRENT_USER } from '../../graphql/queries/User';
import { getUserRole, displayUserGroups } from '../../context/role';
import { Tooltip } from '../../components/UI/Tooltip/Tooltip';

export interface ListProps {
  columnNames?: Array<string>;
  countQuery: DocumentNode;
  listItem: string;
  filterItemsQuery: DocumentNode;
  deleteItemQuery: DocumentNode;
  listItemName: string;
  dialogMessage: string;
  pageLink: string;
  columns: any;
  listIcon: any;
  columnStyles: any;
  title: string;
  button?: {
    show: boolean;
    label: string;
    link?: string;
  };
  showCheckbox?: boolean;
  searchParameter?: string;
  filters?: any;
  displayListType?: string;
  cardLink?: any;
  editSupport?: boolean;
  additionalAction?: {
    icon: any;
    parameter: string;
    link?: string;
    dialog?: any;
    label?: string;
  } | null;
  deleteModifier?: {
    icon: string;
    variables: any;
    label?: string;
  };
  refetchQueries?: any;
  dialogTitle?: string;
  backLinkButton?: any;
  restrictedAction?: any;
}

interface TableVals {
  pageNum: number;
  pageRows: number;
  sortCol: string;
  sortDirection: 'asc' | 'desc';
}

export const List: React.SFC<ListProps> = ({
  columnNames = [],
  countQuery,
  listItem,
  listIcon,
  filterItemsQuery,
  deleteItemQuery,
  listItemName,
  dialogMessage,
  pageLink,
  columns,
  columnStyles,
  title,
  dialogTitle,
  button = {
    show: true,
    label: 'Add New',
  },
  showCheckbox,
  deleteModifier = { icon: 'normal', variables: null, label: 'Delete' },
  editSupport = true,
  searchParameter = 'label',
  filters = null,
  displayListType = 'list',
  cardLink = null,
  additionalAction = null,
  refetchQueries,
  backLinkButton,
  restrictedAction,
}: ListProps) => {
  const client = useApolloClient();

  // DialogBox states
  const [deleteItemID, setDeleteItemID] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');

  const [newItem, setNewItem] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const capitalListItemName = listItemName[0].toUpperCase() + listItemName.slice(1);

  // Table attributes
  const [tableVals, setTableVals] = useState<TableVals>({
    pageNum: 0,
    pageRows: 10,
    sortCol: columnNames[0],
    sortDirection: 'asc',
  });

  let userRole: any = getUserRole();

  const handleTableChange = (attribute: string, newVal: number | string) => {
    // To handle sorting by columns that are not Name (currently don't support this functionality)
    if (attribute === 'sortCol' && newVal !== 'Name') {
      return;
    }
    // Otherwise, set all values like normal
    setTableVals({
      ...tableVals,
      [attribute]: newVal,
    });
  };
  let filter: any = {};
  filter[searchParameter] = searchVal;
  filter = { ...filter, ...filters };
  const filterPayload = useCallback(() => {
    return {
      filter,
      opts: {
        limit: tableVals.pageRows,
        offset: tableVals.pageNum * tableVals.pageRows,
        order: tableVals.sortDirection.toUpperCase(),
      },
    };
  }, [searchVal, tableVals]);

  // Get the total number of items here
  const { loading: l, error: e, data: countData, refetch: refetchCount } = useQuery(countQuery, {
    variables: { filter },
  });

  // Get item data here
  const [fetchQuery, { loading, error, data }] = useLazyQuery(filterItemsQuery, {
    variables: filterPayload(),
    fetchPolicy: 'cache-and-network',
  });

  // Get item data here
  const [fetchUserGroups, { loading: loadingGroups, data: userGroups }] = useLazyQuery(
    GET_CURRENT_USER
  );

  const message = useQuery(NOTIFICATION);
  let toastMessage;

  const checkUserRole = () => {
    userRole = getUserRole();
  };

  useEffect(() => {
    refetchCount();
  }, [filterPayload, searchVal]);

  useEffect(() => {
    if (userRole.length === 0) {
      checkUserRole();
    } else {
      if (!displayUserGroups && listItem === 'groups') {
        // if user role staff then display groups related to login user
        fetchUserGroups();
      } else {
        fetchQuery();
      }
    }
  }, [userRole]);

  // Make a new count request for a new count of the # of rows from this query in the back-end.

  useEffect(() => {
    return () => {
      setNotification(client, null);
    };
  }, [toastMessage, client]);

  const [deleteItem] = useMutation(deleteItemQuery, {
    onCompleted: () => {
      checkUserRole();
      refetchCount();
    },
    refetchQueries: () => {
      if (refetchQueries && refetchQueries.onDelete) {
        return [{ query: refetchQueries.onDelete }];
      } else return [{ query: filterItemsQuery, variables: filterPayload() }];
    },
  });

  const showDialogHandler = (id: any, label: string) => {
    setDeleteItemName(label);
    setDeleteItemID(id);
  };
  const closeToastMessage = () => {
    setNotification(client, null);
  };

  const closeDialogBox = () => {
    setDeleteItemID(null);
  };

  const handleDeleteItem = () => {
    if (deleteItemID !== null) {
      deleteHandler(deleteItemID);
    }
    setDeleteItemID(null);
  };

  if (message.data && message.data.message) {
    toastMessage = <ToastMessage message={message.data.message} handleClose={closeToastMessage} />;
  }

  let dialogBox;
  if (deleteItemID) {
    dialogBox = (
      <DialogBox
        title={
          dialogTitle
            ? dialogTitle
            : `Are you sure you want to delete the ${listItemName} "${deleteItemName}"?`
        }
        handleOk={handleDeleteItem}
        handleCancel={closeDialogBox}
        colorOk="secondary"
        alignButtons={'center'}
      >
        <p className={styles.DialogText}>{dialogMessage}</p>
      </DialogBox>
    );
  }

  if (newItem) {
    return <Redirect to={`/${pageLink}/add`} />;
  }

  if (loading || l || loadingGroups) return <Loading />;
  if (error || e) {
    if (error) {
      setErrorMessage(client, error);
    } else if (e) {
      setErrorMessage(client, e);
    }
    return null;
  }

  const deleteHandler = (id: number) => {
    const variables = deleteModifier.variables ? deleteModifier.variables(id) : { id };
    deleteItem({ variables: variables });
    setNotification(client, `${capitalListItemName} deleted successfully`);
  };

  // Reformat all items to be entered in table
  function getIcons(
    id: number | undefined,
    label: string,
    isReserved: boolean | null,
    additionalActionParameter: string,
    allowedAction: any | null
  ) {
    // there might be a case when we might want to allow certain actions for reserved items
    // currently we don't allow edit or delete for reserved items. hence return early
    if (isReserved) {
      return null;
    }
    let editButton = null;
    if (editSupport) {
      editButton = allowedAction.edit ? (
        <Link to={`/${pageLink}/` + id + '/edit'}>
          <Tooltip title="Edit" placement="top">
            <IconButton aria-label="Edit" color="default" data-testid="EditIcon">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Link>
      ) : null;
    }

    const deleteButton = (id: any, label: string) => {
      return allowedAction.delete ? (
        <Tooltip title={`${deleteModifier.label}`} placement="top">
          <IconButton
            aria-label="Delete"
            color="default"
            data-testid="DeleteIcon"
            onClick={() => showDialogHandler(id!, label)}
          >
            {deleteModifier.icon === 'cross' ? <CrossIcon /> : <DeleteIcon />}
          </IconButton>{' '}
        </Tooltip>
      ) : null;
    };

    if (id) {
      return (
        <div className={styles.Icons}>
          {additionalAction && additionalAction.link ? (
            <Link to={`${additionalAction?.link}/${additionalActionParameter}`}>
              <Tooltip title={`${additionalAction.label}`} placement="top">
                <IconButton
                  color="default"
                  className={styles.additonalButton}
                  data-testid="additionalButton"
                >
                  {additionalAction.icon}
                </IconButton>
              </Tooltip>
            </Link>
          ) : null}

          {additionalAction && additionalAction.dialog ? (
            <Tooltip title={`${additionalAction.label}`} placement="top">
              <IconButton
                color="default"
                data-testid="additionalButton"
                className={styles.additonalButton}
                onClick={() => additionalAction.dialog(additionalActionParameter)}
              >
                {additionalAction.icon}
              </IconButton>
            </Tooltip>
          ) : null}
          {/* do not display edit & delete for staff role in group */}
          {displayUserGroups || listItem !== 'groups' ? (
            <>
              {editButton}
              {deleteButton(id!, label)}
            </>
          ) : null}
        </div>
      );
    }
  }

  function formatList(listItems: Array<any>) {
    return listItems.map(({ ...listItem }) => {
      const label = listItem.label ? listItem.label : listItem.name;
      const isReserved = listItem.isReserved ? listItem.isReserved : null;
      // display only actions allowed to the user
      const allowedAction = restrictedAction
        ? restrictedAction(listItem)
        : { chat: true, edit: true, delete: true };
      let action: any;
      if (additionalAction) {
        // check if we are dealing with nested element
        const params = additionalAction.parameter.split('.');
        if (params.length > 1) {
          action = listItem[params[0]][params[1]];
        } else {
          action = listItem[params[0]];
        }
      }
      return {
        ...columns(listItem),
        operations: getIcons(listItem.id, label, isReserved, action, allowedAction),
      };
    });
  }

  const resetTableVals = () => {
    setTableVals({
      pageNum: 0,
      pageRows: 10,
      sortCol: columnNames[0],
      sortDirection: 'asc',
    });
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    let searchVal = e.target.querySelector('input').value.trim();
    setSearchVal(searchVal);
    resetTableVals();
  };

  // Get item data and total number of items.
  let itemList: any = [];
  if (data) {
    itemList = formatList(data[listItem]);
  }

  if (userGroups) {
    if (listItem === 'groups') {
      itemList = formatList(userGroups.currentUser.user['groups']);
    }
  }

  let itemCount: number = tableVals.pageRows;
  if (countData) {
    itemCount = countData['count' + listItem[0].toUpperCase() + listItem.slice(1)];
  }

  let displayList;
  if (displayListType === 'list') {
    displayList = (
      <Pager
        columnStyles={columnStyles}
        columnNames={columnNames}
        data={itemList}
        totalRows={itemCount}
        handleTableChange={handleTableChange}
        tableVals={tableVals}
        showCheckbox={showCheckbox}
      />
    );
  } else if (displayListType === 'card') {
    displayList = <ListCard data={itemList} link={cardLink} />;
  }
  const backLink = backLinkButton ? (
    <div className={styles.BackLink}>
      <Link to={backLinkButton.link}>
        <BackIcon />
        {backLinkButton.text}
      </Link>
    </div>
  ) : null;

  let buttonDisplay;
  if (button.show) {
    let buttonContent;
    if (!button.link) {
      buttonContent = (
        <Button
          color="primary"
          variant="contained"
          onClick={() => setNewItem(true)}
          data-testid="newItemButton"
        >
          {button.label}
        </Button>
      );
    } else {
      buttonContent = (
        <Link to={button.link}>
          <Button color="primary" variant="contained" data-testid="newItemLink">
            {button.label}
          </Button>
        </Link>
      );
    }
    buttonDisplay = <div className={styles.AddButton}>{buttonContent}</div>;
  }

  return (
    <>
      <div className={styles.Header}>
        <Typography variant="h5" className={styles.Title}>
          <IconButton disabled={true} className={styles.Icon}>
            {listIcon}
          </IconButton>
          {title}
        </Typography>
        <div className={styles.Buttons}>
          <SearchBar
            handleSubmit={handleSearch}
            onReset={() => {
              setSearchVal('');
              resetTableVals();
            }}
            searchVal={searchVal}
            handleChange={(e: any) => {
              // reset value only if empty
              if (!e.target.value) setSearchVal('');
            }}
          />
        </div>
        <div>
          {toastMessage}
          {dialogBox}
          {buttonDisplay}
        </div>
      </div>

      {backLink}
      {/* Rendering list of items */}

      {itemList ? displayList : <div>There are no {listItemName}s.</div>}
    </>
  );
};
