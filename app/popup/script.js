function debug(what) {
  document.getElementById('debug').innerHTML = JSON.stringify(what, null, 2);
}

function init() {
  checkBoxInit(document.getElementById('closed'), 'closed');
  checkBoxInit(document.getElementById('collapsed'), 'collapsed');
  checkBoxInit(document.getElementById('folders'), 'folders');
}

function checkBoxInit(element, storeId) {
  chrome.storage.sync.get([storeId], items => element.checked = items[storeId]);

  var toStore = {};
  element.addEventListener('click', () => {
    toStore[storeId] = element.checked;
    chrome.storage.sync.set(toStore);
  });
}

window.addEventListener("load", init);
