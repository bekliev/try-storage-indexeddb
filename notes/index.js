const elList = document.querySelector('ul');
const elTitleInput = document.querySelector('#title');
const elDescriptionInput = document.querySelector('#description');
const elForm = document.querySelector('form');
const elSubmitBtn = document.querySelector('form button');

const dbName = 'notes_db';
const storeName = 'notes_os';

let db;

window.onload = function () {
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

        // displayData();
    }

    elForm.onsubmit = addData;
}

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
        // displayData()
        console.groupEnd();
    }

    transaction.onerror = function () {
        const text = 'transaction.onerror: Transaction not opened due to error';
        alert(text); console.log(text);
    }
}