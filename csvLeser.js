const fs = require('fs');
const sqlite3 = require('better-sqlite3')
const path = require('path')
const db = sqlite3('./studietid.db', {verbose: console.log})

const lines = fs.readFileSync('grupper.csv', 'utf-8').split('\n');

const data = lines.map(line => line.split(';')).filter(line => line.some(field => field.trim() !== ''));


//join every second array in the array
let joinedArray = [];
for (let i = 0; i < data.length; i += 2) {
    const data1 = data[i];
    const data2 = data[i + 1] || [];
    const joined = data1.concat(data2);
    joinedArray.push(joined);
}
console.log(joinedArray);
for (let data of joinedArray) {
    let subjectNameArray = [];
    let subjectCode = data [2]
    let subjectClass = data[4]
    let subjectNames = data[10];
    subjectNameArray = subjectNames.split(',');
    let subjectName = subjectNameArray[0]
    console.log(subjectNameArray[0]);
    console.log(subjectClass)
    console.log(subjectCode)
    console.log(subjectName)

    const sql = db.prepare("INSERT INTO subject (name, class, code) values (?, ?, ?)");
    const info = sql.run(subjectName, subjectClass, subjectCode);
    console.log('row inserted', info.lastInsertRowid);

    
}


//add elements into database


