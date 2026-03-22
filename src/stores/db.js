import Dexie from 'dexie'

const db = new Dexie('GetManDB')

db.version(1).stores({
  collections: '++id, name, parentId, order',
  requests: '++id, name, collectionId, method, url, headers, body, bodyType, order',
  history: '++id, timestamp',
  environments: '++id, name, isActive'
})

export default db
