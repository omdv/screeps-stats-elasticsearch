'use strict'

const axios = require('axios');
const zlib = require('zlib');
const { Client } = require('es7')

const API_TOKEN = process.env.SCREEPS_TOKEN;
const SHARD = process.env.SCREEPS_SHARD;
const DELAY = process.env.SCREEPS_POLL_FREQUENCY_SECONDS * 1000;
const ELASTIC_INDEX = process.env.ELASTICSEARCH_INDEX;
const NEW_ES_INDEX = process.env.ELASTICSEARCH_IS_NEW_INDEX;
const ES_NODE_ADDR = process.env.ELASTICSEARCH_NODE_ADDR;

const es_client = new Client({ node: ES_NODE_ADDR });
const screeps_api_url = 'https://screeps.com/api/user/memory?path=stats&shard='+SHARD;

const es_delete_indices = async () => {
  try {
    await es_client.indices.delete({index: ELASTIC_INDEX});
    console.log(ELASTIC_INDEX, 'index deleted');
  } catch (e) {
    console.error(e);
  }
}

const es_create_index = async () => {
  try {
    await es_client.indices.create({
      index: ELASTIC_INDEX,
      body: {
        mappings: {
          properties: {
            'timestamp': {'type': 'date'}
          }
        }
      }
    });
    console.log('New index created:',ELASTIC_INDEX);
  } catch (e) {
    console.error(e);
  }
}

const es_get_health = async () => {
  try {
    let resp = await es_client.cluster.health();
    console.log('--Elasticsearch health--\n', resp.body);
  } catch (e) {
    console.error(e);
  }
}

const timeOut = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), DELAY);
  });
}

const es_add_document = async(doc) => {
  try {
    const resp = await es_client.index({index: ELASTIC_INDEX, body: doc});
    console.log('Added document with timestamp:', doc.timestamp);
  } catch (e) {
    console.error(e);
  }
}

const get_screeps_memory = async () => {
  try {
    const resp = await axios.get(screeps_api_url, {headers: { 'X-Token': API_TOKEN }});
    const zipped = resp.data.data.split('gz:')[1];
    const data = JSON.parse(zlib.gunzipSync(new Buffer.from(zipped, 'base64')).toString());
    await es_add_document(data);
    await timeOut();
  } catch (e) {
    console.error(e);
  }
}

// main loop
(async () => {
  await es_get_health();
  if (NEW_ES_INDEX == 'yes') {
    await es_delete_indices();
    await es_create_index();
  }
  for (;;) {
    await get_screeps_memory();
  }
})();