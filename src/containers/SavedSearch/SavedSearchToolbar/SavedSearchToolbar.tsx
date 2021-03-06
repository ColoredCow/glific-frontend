import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ReactComponent as OptionsIcon } from '../../../assets/images/icons/MoreOptions/Unselected.svg';
import { ReactComponent as OptionsIconSelected } from '../../../assets/images/icons/MoreOptions/Selected.svg';

import { SAVED_SEARCH_QUERY } from '../../../graphql/queries/Search';
import { setErrorMessage } from '../../../common/notification';
import Loading from '../../../components/UI/Layout/Loading/Loading';
import styles from './SavedSearchToolbar.module.css';
import { IconButton, Popper, Fade, Paper, ClickAwayListener } from '@material-ui/core';

export interface SavedSearchToolbarProps {
  savedSearchCriteriaCallback: Function;
  refetchData?: any;
}

export const SavedSearchToolbar: React.SFC<SavedSearchToolbarProps> = (props) => {
  const [selectedSavedSearch, setSelectedSavedSearch] = useState<number | null>(null);
  const [optionsSelected, setOptionsSelected] = useState(false);

  const [fixedCollection, setFixedCollection] = useState<any>([]);
  const [additonalCollections, setAdditonalCollections] = useState<any>([]);
  const Ref = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // default queryvariables
  const queryVariables = {
    filter: {},
    opts: {
      limit: 10,
    },
  };

  useEffect(() => {
    // display created collection
    if (props.refetchData.savedSearchCollection) {
      refetch();
      handleAdditionalSavedSearch(props.refetchData.savedSearchCollection);
    }
  }, [props.refetchData.savedSearchCollection]);

  const { loading, error, client, refetch } = useQuery<any>(SAVED_SEARCH_QUERY, {
    variables: queryVariables,
    onCompleted: (data) => {
      setFixedCollection(data.savedSearches.slice(0, 3));
      setAdditonalCollections(data.savedSearches.slice(3));
    },
  });

  if (loading) return <Loading />;
  if (error) {
    setErrorMessage(client, error);
    return null;
  }

  const handlerSavedSearchCriteria = (
    savedSearchCriteria: string | null,
    savedSearchId: number | null
  ) => {
    props.savedSearchCriteriaCallback(savedSearchCriteria, savedSearchId);
    setSelectedSavedSearch(savedSearchId);
  };

  const savedSearchList = fixedCollection.map((savedSearch: any) => {
    // set the selected class if the button is clicked
    let labelClass = [styles.SavedSearchItemLabel];
    let countClass = [styles.SavedSearchCount];
    if (savedSearch.id === selectedSavedSearch) {
      labelClass.push(styles.SavedSearchItemSelected);
      countClass.push(styles.SavedSearchSelectedCount);
    }

    return (
      <div
        data-testid="savedSearchDiv"
        className={styles.SavedSearchItem}
        key={savedSearch.id}
        onClick={() => handlerSavedSearchCriteria(savedSearch.args, savedSearch.id)}
      >
        <div className={labelClass.join(' ')}>{savedSearch.shortcode}</div>
        <div className={countClass.join(' ')}>{savedSearch.count}</div>
      </div>
    );
  });

  const handleClickAway = () => {
    setAnchorEl(null);
    setOptionsSelected(false);
  };

  const handleAdditionalSavedSearch = (search: any) => {
    const removedCollection = fixedCollection[fixedCollection.length - 1];
    const fixedCollectionCopy = fixedCollection.slice(0, fixedCollection.length - 1);
    fixedCollectionCopy.push(search);
    const moreCollection = additonalCollections.filter((searc: any) => searc.id !== search.id);
    moreCollection.unshift(removedCollection);
    setFixedCollection(fixedCollectionCopy);
    setAdditonalCollections(moreCollection);
    handlerSavedSearchCriteria(search.args, search.id);
  };

  const additionalOptions = (
    <Popper open={open} anchorEl={anchorEl} placement="bottom" transition>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper elevation={3} className={styles.Popper}>
            {additonalCollections.map((search: any) => {
              return (
                <div
                  key={search.id}
                  className={styles.LabelContainer}
                  onClick={() => handleAdditionalSavedSearch(search)}
                >
                  <span className={styles.Label}>{search.shortcode}</span>
                  <span className={styles.Count}>{search.count}</span>
                </div>
              );
            })}
          </Paper>
        </Fade>
      )}
    </Popper>
  );

  return (
    <div className={styles.SavedSearchToolbar}>
      <div className={styles.SaveSearchContainer}>{savedSearchList}</div>
      <div className={styles.MoreLink}>
        <ClickAwayListener onClickAway={handleClickAway}>
          <IconButton
            onClick={() => {
              setAnchorEl(Ref.current);
              setOptionsSelected(true);
            }}
            aria-label="more"
            aria-controls="long-menu"
            aria-haspopup="true"
            size="small"
            ref={Ref}
          >
            {optionsSelected ? (
              <OptionsIconSelected className={styles.OptionsIcon} />
            ) : (
              <OptionsIcon className={styles.OptionsIcon} />
            )}
          </IconButton>
        </ClickAwayListener>
        {additionalOptions}
      </div>
    </div>
  );
};

export default SavedSearchToolbar;
