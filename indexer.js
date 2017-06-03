const logger = require('heimdalljs-logger');
const feedparser = require('feedparser-promised');

module.exports = class Indexer {
  constructor({ url }) {
    this.url = url;
    this.log = logger('rss-indexer');
  }

  branches() {
    return ['draft'];
  }

  beginUpdate(branch) {
    return new RSSUpdater(this.url, branch, this.log);
  }
};

const articleFields = {
  title: 'string',
  description: 'string',
  summary: 'string',
  link: 'string',
  origlink: 'string',
  permalink: 'string',
  date: 'date',
  pubdate: 'date',
  author: 'string',
  guid: 'string',
  comments: 'string',
  image: 'object',
  categories: 'any',
  source: 'object',
  enclosures: 'any',
  meta: 'object'
};

const articleSchema = {
  type: 'content-types',
  id: 'articles',
  attributes: {
    'is-built-in': null
  },
  relationships: {
    fields: {
      data: Object.keys(articleFields).map(id => {
        return {
          type: 'fields',
          id
        };
      })
    },
    'data-source': null
  }
};

const fieldsSchemas = Object.keys(articleFields).map(id => {
  let type = articleFields[id];
  return {
    type: 'fields',
    id,
    attributes: {
      'field-type': `@cardstack/core-types::${type}`
    }
  }
});

class RSSUpdater {
  constructor(url, branch, log) {
    this.url = url;
    this.branch = branch;
    this.log = log;
  }

  async schema() {
    return [
      articleSchema
    ].concat(fieldsSchemas);
  }

  async updateContent(meta, hints, ops) {
    let articles = await parseFeed(this.url, this.log);
    for (let article of articles) {
      let { guid } = article;
      await ops.save('articles', guid, {
        attributes: extractAttributes(article)
      });
    }
    return meta;
  }
}

async function parseFeed(url, log) {
  let result;
  try {
    result = await feedparser.parse(url);
  } catch (err) {
    log.warn(`Encoutered error ${err} while trying to parse feed at ${url}.`);
  }
  return result;
};

function extractAttributes(article) {
  return Object.keys(articleFields).reduce(function(result, field) {
    return Object.assign(result, {
      [field]: article[field]
    });
  }, {});
}