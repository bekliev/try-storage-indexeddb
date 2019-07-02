const elList = document.querySelector('ul');
const elTitleInput = document.querySelector('#title');
const elDescriptionInput = document.querySelector('#description');
const elForm = document.querySelector('form');
const elSubmitBtn = document.querySelector('form button');

const dbName = 'notes_db';
const storeName = 'notes_os';
const idAttribute = 'data-note-id';

let db;

// window.onload = function () {
let request = window.indexedDB.open(dbName, 1);

request.onerror = function () {
    const text = [
        'DB failed to open!',
        'Command: window.indexedDB.open(dbName, 1)'
    ].join('\n');

    console.log(text);
    alert(text);
}

request.onupgradeneeded = function (event) {
    console.group('onupgradeneeded');

    const db = event.target.result;

    console.group('Create an objectStore to store our notes in (basically like a single table), including a auto-incrementing key');

    const objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    console.log("> objectStore = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });");

    console.group('Define what data items the objectStore will contain');
    objectStore.createIndex('title', 'title', { unique: false });
    console.log("> objectStore.createIndex('title', 'title', { unique: false })");

    objectStore.createIndex('description', 'description', { unique: false });
    console.log("> objectStore.createIndex('description', 'description', { unique: false })");
    console.groupEnd();

    console.groupEnd();

    console.log('Database setup complete');
    console.groupEnd();
}

request.onsuccess = function () {
    const text = 'DB has opened successfully!';
    console.log(text);

    db = request.result;

    displayData();
}

elForm.onsubmit = addData;
// }

function addData(event) {
    console.group('Submited');
    event.preventDefault();

    const newItem = {
        title: elTitleInput.value,
        description: elDescriptionInput.value
    };
    console.log({ newItem: newItem });

    console.log('open a read/write db transaction, ready for adding the data');
    const transaction = db.transaction([storeName], 'readwrite');

    console.log('call an object store that\'s already been added to the database');
    const objectStore = transaction.objectStore(storeName);

    console.group('Make a request to add our newItem object to the object store');
    const request = objectStore.add(newItem);
    request.onsuccess = function () {
        console.log('request.onsuccess: New item has been added!');

        console.log('Clear the form, ready for adding the next entry');
        elTitleInput.value = '';
        elDescriptionInput.value = '';
        console.groupEnd();
        console.groupEnd();
    }

    transaction.oncomplete = function () {
        console.group('transaction.oncomplete: Database modification finished.')
        console.log('update the display of data to show the newly added item, by running displayData() again.');
        displayData();
        console.groupEnd();
    }

    transaction.onerror = function () {
        const text = 'transaction.onerror: Transaction not opened due to error';
        alert(text); console.log(text);
    }
}

function deleteNote(event) {
    console.group('Delete note');

    const elParent = event.target.parentNode;

    const noteId = Number(elParent.getAttribute(idAttribute));
    console.log({ noteId: noteId });

    const transaction = db.transaction(storeName, 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.delete(noteId);

    transaction.oncomplete = function () {
        elList.removeChild(elParent);

        console.log('Note has been deleted');

        if (!elList.firstChild) showPlaceholder();

        console.groupEnd();
    }
}

function displayData() {
    console.group('displayData');

    console.log('Removing all list items');
    while (elList.firstChild) {
        elList.removeChild(elList.firstChild);
    }

    console.log('Fetching and rendering all notes');
    const objectStore = db.transaction(storeName).objectStore(storeName);
    objectStore.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;

        if (!cursor) {
            if (!elList.firstChild) showPlaceholder();

            console.log('All notes has been displayed!');
            console.groupEnd();
        } else {
            // Create elements
            const el = {
                li: document.createElement('li'),
                h3: document.createElement('h3'),
                p: document.createElement('p'),
                button: document.createElement('button'),
            };

            // Map the data
            const data = {
                id: cursor.value.id,
                title: cursor.value.title,
                description: cursor.value.description,
            };

            // Fullfill elements with data
            el.li.setAttribute(idAttribute, data.id);
            el.h3.textContent = '[' + data.id + '] ' + data.title;
            el.p.textContent = data.description;
            el.button.textContent = 'Delete';

            // Event handlers
            el.button.onclick = deleteNote;

            // Insert elements into the DOM
            el.li.appendChild(el.h3);
            el.li.appendChild(el.p);
            el.li.appendChild(el.button);
            elList.appendChild(el.li);

            // Iterate to the next item in the cursor
            cursor.continue();
        }
    }
}

function showPlaceholder() {
    const text = 'There has not data in this store yet.';
    const listItem = document.createElement('li');
    listItem.textContent = text;
    console.log(text);

    elList.appendChild(listItem);
}