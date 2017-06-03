const temp = require('@cardstack/test-support/temp-helper');
const ElasticAssert = require('@cardstack/elasticsearch/node-tests/assertions');
const toJSONAPI = require('@cardstack/elasticsearch/to-jsonapi');
const JSONAPIFactory = require('@cardstack/test-support/jsonapi-factory');
const { Registry, Container } = require('@cardstack/di');

describe('rss/indexer', function() {
  let indexer, ea, dataSource;

  beforeEach(async function() {
    ea = new ElasticAssert();

    let factory = new JSONAPIFactory();

    factory.addResource('plugin-configs')
      .withAttributes({
        module: 'cardstack-rss-indexer'
      });

    dataSource = factory.addResource('data-sources')
        .withAttributes({
          'source-type': 'cardstack-rss-indexer',
          params: { 
            url: 'https://medium.com/feed/@tarasm' 
          }
        });

    factory.addResource('plugin-configs')
      .withAttributes({
        module: '@cardstack/hub',
      }).withRelated(
        'default-data-source',
        dataSource
      );

    let registry = new Registry();
    registry.register('config:seed-models', factory.getModels());
    registry.register('config:project', {
      path: `${__dirname}/..`,
      isTesting: true
    });
    indexer = new Container(registry).lookup('hub:indexers');
  });

  it('indexed the article', async function() {    
    await indexer.update();
    let contents = await ea.documentContents('draft', 'articles', 'https://medium.com/p/b1193497fb4b');
    let jsonapi = toJSONAPI('articles', contents);

    expect(jsonapi.id).toBe('https://medium.com/p/b1193497fb4b');
    expect(jsonapi.attributes.title).toBe('Node.js microservices on Google App Engine');
  });

});