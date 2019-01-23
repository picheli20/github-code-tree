const debug = (what) => document.getElementById('debug').innerHTML = JSON.stringify(what, null, 2);

const checkBoxInit = (storeId) => {
  const element = document.getElementById(storeId);
  chrome.storage.sync.get([storeId], items => element.checked = items[storeId]);

  var toStore = {};
  element.addEventListener('click', () => {
    toStore[storeId] = element.checked;
    chrome.storage.sync.set(toStore);
  });
}

const inputInit = (storeId) => {

  const element = document.getElementById(storeId);
  chrome.storage.sync.get([storeId], items => {
    const stored = items[storeId];
    if (stored) {
      element.value = stored;
    }
  });

  var toStore = {};
  element.addEventListener('keyup', () => {
    toStore[storeId] = element.value;
    chrome.storage.sync.set(toStore);
  });
};

window.addEventListener("load", () => {
  ['closed', 'collapsed', 'folders', 'largeDiff'].forEach(option => checkBoxInit(option));
  ['customRegex'].forEach(option => inputInit(option));
});
