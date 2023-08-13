import "./libs/tabulator/js/tabulator.min.js"
import {createSearchObjectsTable} from "./scripts/search-objects-table.js"

var searchObjectsTable;

const saveTextOptions = () => 
{
    const searchJSON = document.getElementById("searchJSON").value;
  
    chrome.storage.sync.set(
      { searchJSON: searchJSON },
      () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);

        searchObjectsTable.setData(searchJSON)
      }
    );
};

const saveTableOptions = () => 
{
  const searchJSON = JSON.stringify(searchObjectsTable.getData(), null, 2);
  chrome.storage.sync.set(
    { searchJSON: searchJSON },
    () => {
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);

      searchObjectsTable.setData(searchJSON)
    }
  );

  document.getElementById("searchJSON").value = searchJSON;
};
  
const restoreOptions = () => 
{
  chrome.storage.sync.get("searchJSON").then((result) =>
  {
    searchObjectsTable = createSearchObjectsTable(result.searchJSON, "#search-objects-table")
    document.getElementById('searchJSON').value = result.searchJSON;
  });
};
  
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-text').addEventListener('click', saveTextOptions);
document.getElementById('save-table').addEventListener('click', saveTableOptions);