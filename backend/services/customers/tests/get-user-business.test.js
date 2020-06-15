const { getHierarchy } = require('../functions/get-hierarchy-handler');

test('getBusinesHierarchy should return bysines hierarchy', () => {
  const expected = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
  return getHierarchy({}).then((result) => {
    expect(result).toMatchObject(expected);
    expect(result).toHaveProperty('body');
  });
});
