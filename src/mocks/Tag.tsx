import { FILTER_TAGS_NAME, GET_TAGS } from '../graphql/queries/Tag';
import { SEARCH_QUERY_VARIABLES as queryVariables } from '../common/constants';
import {
  ADD_MESSAGE_TAG_SUBSCRIPTION,
  DELETE_MESSAGE_TAG_SUBSCRIPTION,
} from '../graphql/subscriptions/Tag';

export const getTagsQuery = {
  request: {
    query: GET_TAGS,
  },
  result: {
    data: {
      tags: [
        {
          id: '87',
          label: 'Good message',
          description: 'Hey There',
          colorCode: '#0C976D',
          parent: null,
          language: {
            id: '1',
          },
        },
        {
          id: '1',
          label: 'important',
          description: 'some description',
          colorCode: '#0C976D',
          parent: { id: '2' },
          language: {
            id: '1',
          },
        },
      ],
    },
  },
};

export const filterTagsQuery = {
  request: {
    query: FILTER_TAGS_NAME,
    variables: {
      filter: {},
      opts: {
        order: 'ASC',
      },
    },
  },
  result: {
    data: {
      tags: [
        {
          id: '87',
          label: 'Good message',
        },
        {
          id: '1',
          label: 'important',
        },
      ],
    },
  },
};

export const addMessageTagSubscription = {
  request: {
    query: ADD_MESSAGE_TAG_SUBSCRIPTION,
    variables: queryVariables,
  },
  result: {
    data: {
      createdMessageTag: {
        message: {
          flow: 'OUTBOUND',
          id: '22',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
        },
        tag: { id: 1, label: 'Greeting', colorCode: '#00d084', parent: null },
      },
    },
  },
};

export const deleteMessageTagSubscription = {
  request: {
    query: DELETE_MESSAGE_TAG_SUBSCRIPTION,
    variables: queryVariables,
  },
  result: {
    data: {
      deletedMessageTag: {
        message: {
          flow: 'OUTBOUND',
          id: '22',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
        },
        tag: { id: 1, label: 'Greeting', colorCode: '#00d084', parent: null },
      },
    },
  },
};
