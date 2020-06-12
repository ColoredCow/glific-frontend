import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import {
  Paper,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Button,
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import styles from './TagList.module.css';

import { GET_TAGS } from '../../../graphql/queries/Tag';
import { DELETE_TAG } from '../../../graphql/mutations/Tag';

export interface TagListProps {}

const notificationMessage = gql`
  {
    message @client
  }
`;

export const TagList: React.SFC<TagListProps> = (props) => {
  const client = useApolloClient();
  const [newTag, setNewTag] = useState(false);

  const { loading, error, data } = useQuery(GET_TAGS);

  const message = useQuery(notificationMessage);

  const h = message.data;
  console.log(message.data);

  let deleteId: number = 0;
  const [deleteTag] = useMutation(DELETE_TAG, {
    update(cache) {
      const tags: any = cache.readQuery({ query: GET_TAGS });
      const tagsCopy = JSON.parse(JSON.stringify(tags));
      tagsCopy.tags = tags.tags.filter((val: any) => val.id !== deleteId);
      cache.writeQuery({
        query: GET_TAGS,
        data: tagsCopy,
      });
    },
  });

  useEffect(() => {
    if (h) alert(h.message);
  }, [h]);

  if (newTag) {
    return <Redirect to="/tag/add" />;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  const tagList = data.tags;

  const deleteHandler = (id: number) => {
    deleteId = id;
    deleteTag({ variables: { id } });
    client.writeQuery({
      query: gql`
        query notificationMessage {
          message
        }
      `,
      data: { message: 'Deleted' },
    });
  };

  let listing: any;
  if (tagList.length > 0) {
    listing = tagList.map((n: any) => {
      return (
        <TableRow key={n.id}>
          <TableCell component="th" scope="row">
            {n.label}
          </TableCell>
          <TableCell scope="row">{n.description}</TableCell>
          <TableCell>
            <Link to={'/tag/' + n.id + '/edit'}>
              <IconButton aria-label="Edit" color="default">
                <EditIcon />
              </IconButton>
            </Link>
            <IconButton aria-label="Delete" color="default" onClick={() => deleteHandler(n.id!)}>
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      );
    });
  } else {
    listing = (
      <TableRow>
        <TableCell>There are no tags.</TableCell>
      </TableRow>
    );
  }

  return (
    <div>
      <div className={styles.AddButtton}>
        <Button variant="contained" color="primary" onClick={() => setNewTag(true)}>
          New Tag
        </Button>
      </div>
      <br />
      <br />
      <TableContainer component={Paper}>
        <Table className={styles.Table} aria-label="tag listing">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{listing}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
