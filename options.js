import "./libs/tabulator/js/tabulator.min.js"
import {createSearchObjectsTable} from "./scripts/search-objects-table.js"

var searchObjectsTable = undefined;
var settingsJSON = undefined;
const defaultSettings = JSON.parse(`{
    "currentObjectGroup": 0,
    "searchObjectGroups": [
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
    ]
}`);

function saveTextOptions ()
{
    settingsJSON = JSON.parse(document.getElementById("settingsJSON").value);
  
    chrome.storage.sync.set(
      { settingsJSON: settingsJSON },
      () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);

        loadTable();
      }
    );
}

function saveTableOptions () //redo
{
    //const settingsJSON = JSON.stringify(searchObjectsTable.getData(), null, 2);
    settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup] = searchObjectsTable.getData;
    chrome.storage.sync.set(
        { settingsJSON: settingsJSON },
        () => {
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(() => {
            status.textContent = '';
            }, 750);

            loadTable();
        }
    );

    document.getElementById("settingsJSON").value = JSON.stringify(settingsJSON, null, 2);
}
  
function restoreOptions ()
{
    chrome.storage.sync.get("settingsJSON").then((result) =>
    {
        try
        {
            settingsJSON = result.settingsJSON;
            loadTable();
            document.getElementById('settingsJSON').value = JSON.stringify(settingsJSON, null, 2);
        }
        catch(e)
        {
            console.log('invalid JSON:');
            console.log(e);   
        }
    });
}

function loadTable()
{
    console.log(settingsJSON);
    searchObjectsTable = createSearchObjectsTable(settingsJSON.searchObjectGroups[settingsJSON.currentObjectGroup], "#search-objects-table");
}

function resetStorage()
{
    chrome.storage.sync.clear();
    chrome.storage.sync.set({settingsJSON: defaultSettings});
    window.location.reload();
}

  
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-text').addEventListener('click', saveTextOptions);
document.getElementById('save-table').addEventListener('click', saveTableOptions);
document.getElementById('reset').addEventListener('click', resetStorage);