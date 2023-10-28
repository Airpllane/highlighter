import "./libs/tabulator/js/tabulator.min.js"
import {createSearchObjectsTable} from "./scripts/search-objects-table.js"

var searchObjectsTable = undefined;
var settingsJSON = undefined;
const defaultSettings = JSON.parse(`{
    "currentObjectGroup": "0",
    "searchObjectGroups": 
    [
        {
            "name": "first",
            "objects":
            [
                {
                "aliases": ["綾小路清隆", "綾小路", "清隆"],
                "color": "#AFE1AF",
                "description": "character 0"
                },
                {
                "aliases": ["堀北鈴音", "堀北", "鈴音"],
                "color": "#FF5733",
                "description": "character 1"
                },
                {
                "aliases": ["櫛田桔梗", "櫛田", "桔梗"],
                "color": "#00FFFF",
                "description": "character 2"
                }
            ]
        },
        {
            "name": "second",
            "objects": 
            [
                {
                "aliases": ["須藤健", "須藤", "健"],
                "color": "#DFFF00",
                "description": "character 3"
                },
                {
                "aliases": ["軽井沢恵", "軽井沢", "恵"],
                "color": "#DF00FF",
                "description": "character 4"
                }
            ]
        }
    ]
}`);

async function saveOptions()
{
    chrome.storage.sync.set(
        { settingsJSON: settingsJSON },
        () => {
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(() => {
            status.textContent = '';
            }, 750);
        }
    );
}

function saveTextOptions()
{
    settingsJSON = JSON.parse(document.getElementById("settingsJSON").value);
    saveOptions().then(() => {reloadOptions();});
}

function saveTableOptions()
{
    settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].objects = searchObjectsTable.getData();
    saveOptions().then(() => {reloadOptions();});
}

function selectObjectGroup()
{
    settingsJSON.currentObjectGroup = document.getElementById('search-object-groups-select').value;
    saveOptions().then(() => {reloadOptions();});
    document.getElementById('save-button').disabled = false;
}

function newObjectGroup()
{
    settingsJSON.currentObjectGroup = settingsJSON.searchObjectGroups.push({"name": "newGroup", "objects": []}) - 1;
    reloadOptions();
    document.getElementById('save-button').disabled = false;
}

function deleteObjectGroup()
{
    settingsJSON.searchObjectGroups.splice(settingsJSON.currentObjectGroup, 1);
    settingsJSON.currentObjectGroup = 0;
    reloadOptions();
    document.getElementById('save-button').disabled = false;
}

function reloadOptions()
{
    fillObjectGroups();
    fillOptions();
    loadTable();
    fillTextarea();

    function fillObjectGroups()
    {
        document.getElementById('search-object-groups-select').replaceChildren();
        for (let i = 0; i < settingsJSON.searchObjectGroups.length; i++) 
        {
            var option = document.createElement("option");
            option.value = i;
            option.textContent = settingsJSON.searchObjectGroups[i].name;
            document.getElementById('search-object-groups-select').appendChild(option);
        }
        document.getElementById('search-object-groups-select').value = settingsJSON.currentObjectGroup;
    }

    function fillOptions()
    {
        document.getElementById("object-group-name-input").value = settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].name;
    }

    function loadTable()
    {
        searchObjectsTable = createSearchObjectsTable(settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].objects, "#search-objects-table");
    }

    function fillTextarea()
    {
        document.getElementById('settingsJSON').value = JSON.stringify(settingsJSON, null, 2);
    }
}

function restoreOptions()
{
    chrome.storage.sync.get("settingsJSON").then((result) =>
    {
        settingsJSON = result.settingsJSON;
        reloadOptions();
        document.getElementById('save-button').disabled = true;
    });
}

function resetStorage()
{
    chrome.storage.sync.clear();
    chrome.storage.sync.set({settingsJSON: defaultSettings});
    window.location.reload();
}

function trackObjectGroupName()
{
    settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup].name = document.getElementById('object-group-name-input').value;
    reloadOptions();
    document.getElementById('save-button').disabled = false;
}

function addRow()
{
    searchObjectsTable.addData([{ aliases: ["New"], color: '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0'), description: "New description" }], false);
}
  
document.addEventListener('DOMContentLoaded', restoreOptions);


document.getElementById('add-row-button').addEventListener('click', addRow);
document.getElementById('save-table-button').addEventListener('click', saveTableOptions);

document.getElementById('search-object-groups-select').addEventListener('change', selectObjectGroup);
document.getElementById('new-object-group-button').addEventListener('click', newObjectGroup);
document.getElementById('delete-object-group-button').addEventListener('click', deleteObjectGroup);
document.getElementById('object-group-name-input').addEventListener('input', trackObjectGroupName);

document.getElementById('save-text-button').addEventListener('click', saveTextOptions);
document.getElementById('save-button').addEventListener('click', saveOptions);
document.getElementById('reset-button').addEventListener('click', resetStorage);
