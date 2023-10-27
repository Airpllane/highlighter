import "./libs/tabulator/js/tabulator.min.js"
import {createSearchObjectsTable} from "./scripts/search-objects-table.js"

var searchObjectsTable = undefined;
var settingsJSON = undefined;
const defaultSettings = JSON.parse(`{
    "currentObjectGroup": "first",
    "searchObjectGroups": 
    {
        "first":
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
        ],
        "second":
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
    settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup] = searchObjectsTable.getData();
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
    if (settingsJSON.searchObjectGroups.newGroup != undefined) { return; }
    settingsJSON.searchObjectGroups['newGroup'] = [];
    settingsJSON.currentObjectGroup = 'newGroup';
    reloadOptions();
    document.getElementById('save-button').disabled = false;
}

function deleteObjectGroup()
{
    delete settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup];
    settingsJSON.currentObjectGroup = Object.keys(settingsJSON.searchObjectGroups)[0];
    reloadOptions();
    document.getElementById('save-button').disabled = false;
}

function reloadOptions()
{
    fillObjectGroups();
    loadTable();
    fillTextarea();

    function fillObjectGroups()
    {
        document.getElementById('search-object-groups-select').replaceChildren();
        for (let key of Object.keys(settingsJSON.searchObjectGroups)) 
        {
            var option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            document.getElementById('search-object-groups-select').appendChild(option);
        }
        document.getElementById('search-object-groups-select').value = settingsJSON.currentObjectGroup;
    }

    function loadTable()
    {
        searchObjectsTable = createSearchObjectsTable(settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup], "#search-objects-table");
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

  
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('search-object-groups-select').addEventListener('change', selectObjectGroup)
document.getElementById('save-text-button').addEventListener('click', saveTextOptions);
document.getElementById('save-button').addEventListener('click', saveOptions);
document.getElementById('save-table-button').addEventListener('click', saveTableOptions);
document.getElementById('reset-button').addEventListener('click', resetStorage);
document.getElementById('new-object-group-button').addEventListener('click', newObjectGroup);
document.getElementById('delete-object-group-button').addEventListener('click', deleteObjectGroup);