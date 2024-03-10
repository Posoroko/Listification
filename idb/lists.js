import { openDB } from 'idb';
export { createNewList, getLists, getListById };

async function createNewList(name, theme) {
    const db = await openDB('listify', 1);
    const tx = db.transaction('lists', 'readwrite');
    const store = tx.objectStore('lists');
    const request = await store.add({
        id: JSON.stringify(Date.now()),
        name: name, 
        theme: theme,
        items: [],
        date_created: Date.now(),
        date_updated: Date.now()
    });
    await tx.done;
    
    return request;
}

async function getLists(limit = 10) {
    const db = await openDB('listify', 1);
    const tx = db.transaction('lists', 'readonly');
    const store = tx.objectStore('lists');
    return store.getAll(null, limit);
}

async function getListById(id) {
    console.log('getListById called with id:', id);
    try {
        const db = await openDB('listify', 1);
        console.log('Database opened');
        const tx = db.transaction(['lists', 'items'], 'readonly');
        const listStore = tx.objectStore('lists');
        const itemsStore = tx.objectStore('items');
        const list = await listStore.get(id);
        console.log('List retrieved:', list);
        const itemCount = await itemsStore.count();
        console.log('Number of items:', itemCount);

        const itemsTx = db.transaction('items', 'readonly');
        const store = itemsTx.objectStore('items');
        const index = store.index('by_listId');
        const items = await index.getAll(id);

        list.items = items;

        return list;
    } catch (error) {
        console.error('Error in getListById:', error);
    }
}