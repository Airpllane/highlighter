// Saves options to chrome.storage
const saveOptions = () => {
    const searchJSON = document.getElementById("searchJSON").value;
  
    chrome.storage.sync.set(
      { searchJSON: searchJSON },
      () => {
        
        chrome.storage.sync.get(["searchJSON"]).then((result) =>
        {
            console.log(result);
            console.log(JSON.parse(result.searchJSON));
        });

        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 750);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.sync.get("searchJSON").then((result) =>
    {
        document.getElementById('searchJSON').value = result.searchJSON;
    });
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions);