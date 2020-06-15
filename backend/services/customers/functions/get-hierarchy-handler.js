'use strict';
require('dotenv').config();

var response = () => {}

if (process.env.IS_OFFLINE) {
    response = require('../../../layers/helper_lib/src/response.helper').response;
}
else {
    response = require('mypay-helpers').response;
}

export const getHierarchy = async(event) => {
  const userId = event.id;

  const data = {
    userId: userId,
    items: [
      {
        name: 'Danny\'s Warehouse',
        id: 1,
        clients: [],
        type: 'b',
      },
      {
        name: 'Hair Saloon',
        id: 2,
        type: 'b',
        clients: [
          {
            name: 'Hair Saloon',
            id: 3,
            type: 'c',
            merchants: [{ name: 'Worpress', id: 4, type: 'm' }],
          },
        ],
      },
      {
        name: 'Art Galery',
        id: 5,
        type: 'b',
        clients: [
          {
            type: 'c',
            name: 'Barbican',
            id: 6,
            merchants: [{ name: 'Barbican Rubens', id: 7, type: 'm' }],
          },
          {
            name: 'Dulwich',
            id: 8,
            type: 'c',
            merchants: [
              {
                name: 'Dulwich Shakespeare ',
                id: 9,
                type: 'm',
              },
              { name: 'Dulwich LSO', id: 10, type: 'm' },
            ],
          },
        ],
      },
      {
        name: 'UlTech',
        id: 11,
        type: 'b',
        clients: [
          {
            name: 'T2S',
            id: 12,
            type: 'c',
            merchants: [
              {
                name: 'Tiger Bite',
                id: 13,
                type: 'm',
              },
              {
                name: 'Subway',
                id: 14,
                type: 'm',
              },
              {
                name: 'Dominous',
                id: 15,
                type: 'm',
              },
            ],
          },
          {
            name: 'Food hub',
            id: 16,
            type: 'c',
            merchants: [
              {
                name: 'TigerBite',
                id: 17,
                type: 'm',
              },
              {
                name: 'Subway',
                id: 18,
                type: 'm',
              },
              {
                name: 'Kfs',
                id: 19,
                type: 'm',
              },
            ],
          },
        ],
      },
    ],
  };

  return response(data);
};
