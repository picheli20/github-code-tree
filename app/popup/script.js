const debug = (what) => document.getElementById('debug').innerHTML = JSON.stringify(what, null, 2);

const checkBoxInit = (storeId) => {
  const element = document.getElementById(option);
  chrome.storage.sync.get([storeId], items => element.checked = items[storeId]);

  var toStore = {};
  element.addEventListener('click', () => {
    toStore[storeId] = element.checked;
    chrome.storage.sync.set(toStore);
  });
}

window.addEventListener("load", () => ['closed', 'collapsed', 'folders', 'largeDiff'].map(option => checkBoxInit(option)));
