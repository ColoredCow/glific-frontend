import { GET_USERS_QUERY, FILTER_USERS, USER_COUNT } from '../../graphql/queries/Users';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { GET_GROUPS } from '../../graphql/queries/Group';

export const STAFF_MANAGEMENT_MOCKS = [
  {
    request: {
      query: GET_USERS_QUERY,
      variables: { id: 1 },
    },
    result: {
      data: {
        user: {
          user: {
            groups: [],
            id: '1',
            name: 'Glific Admin',
            phone: '919900991223',
            roles: ['admin'],
          },
        },
      },
    },
  },
  {
    request: {
      query: FILTER_USERS,
      variables: { filter: { name: '' }, opts: { limit: 10, offset: 0, order: 'ASC' } },
    },
    result: {
      data: {
        users: [
          {
            groups: [],
            id: '1',
            name: 'Glific Admin',
            phone: '919900991223',
            roles: ['admin'],
          },
        ],
      },
    },
  },
  {
    request: {
      query: USER_COUNT,
      variables: { filter: { name: '' } },
    },
    result: {
      data: {
        countUsers: 1,
      },
    },
  },
  {
    request: {
      query: GET_LANGUAGES,
    },
    result: {
      data: {
        languages: [
          {
            id: '1',
            label: 'English (United States)',
          },
          {
            id: '2',
            label: 'Hindi (India)',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_GROUPS,
    },
    result: {
      data: {
        groups: [
          {
            id: '1',
            label: 'Group 1',
            isRestricted: true,
          },
          {
            id: '2',
            label: 'Group 2',
            isRestricted: true,
          },
        ],
      },
    },
  },
];
