// Create needed constants
const list = document.querySelector('ul');
const titleInput = document.querySelector('#title');
const bodyInput = document.querySelector('#body');
const form = document.querySelector('form');
const submitBtn = document.querySelector('form button');

let db;

window.onload = function () {
    let request = window.indexedDB.open('notes_db', 1);

    request.onerror = function () {
        const text = [
            'DB failed to open!',
            'Command: window.indexedDB.open(\'notes_db\', 1)'
        ].join('\n');

        console.log(text);
        alert(text);
    }

    request.onupgradeneeded = function (event) {
        console.group('onupgradeneeded');

        let db = event.target.result,
            objectStore,
            command;

        console.group('Create an objectStore to store our notes in (basically like a single table), including a auto-incrementing key');
        command = "objectStore = db.createObjectStore('notes_os', { keyPath: 'id', autoIncrement: true })";
        eval(command); console.log('> ' + command);

        console.group('Define what data items the objectStore will contain');
        command = "objectStore.createIndex('title', 'title', { unique: false })";
        eval(command); console.log('> ' + command)

        command = "objectStore.createIndex('description', 'description', { unique: false })";
        eval(command); console.log('> ' + command)
        console.groupEnd();
        console.groupEnd();

        console.log('Database setup complete');
        console.groupEnd();
    }

    request.onsuccess = function () {
        const text = 'DB has opened successfully!';
        console.log(text)

        db = request.result;

        // displayData();
    }
}