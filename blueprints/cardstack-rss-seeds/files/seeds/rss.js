/* eslint-env node */

module.exports = [
  {
    type: 'plugin-configs',
    id: 'cardstack-rss-indexer',
    attributes: {
      module: 'cardstack-rss-indexer'
    }
  },
  {
    type: 'data-sources',
    id: 0,
    attributes: {
      'source-type': 'cardstack-rss-indexer',
      params: {
        url: 'https://medium.com/feed/@tarasm'
      }
    }
  }
];