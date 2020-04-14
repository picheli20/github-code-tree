var isCommit = false;

const open = () =>  $('.gct-folder').addClass('gct-folder-open');
const close = () => $('.gct-folder').removeClass('gct-folder-open');

const isDiffOpen = (el) => $(el).hasClass('Details--on') && $(el).hasClass('open');

const openDiff = (el) => $(el).addClass('Details--on open');
const closeDiff = (el) => $(el).removeClass('Details--on open');

const expandAllDiffBlocks = () => {
  $('#collapseAll').show();
  $('#expandAll').hide();
  $('#files .file').each((i, el) => openDiff(el));
}

const collapseAllDiffBlocks = () => {
  $('#collapseAll').hide();
  $('#expandAll').show();
  $('#files .file').each((i, el) => closeDiff(el));
}

const reInjectHTML = (savedItems) => $('#gct-tree').replaceWith($(`${buildHtmlTree(buildTree(savedItems))}`));

const injectHTML = (savedItems) => $(
  `<div class="gct-file-tree">
      <div class="gct-header">
        <div id="openAll">Open All</div>
        <div id="closeAll">Close All</div>
        <div id="expandAll">Expand All</div>
        <div id="collapseAll">Collapse All</div>
      </div>
      ${buildHtmlTree(buildTree(savedItems))}
      <div class="gct-header">
        <div id="refresh">Refresh</div>
      </div>
  </div>`
).appendTo('#files');

const mergeObjects = (og, so) => {
  for (var key in so) {
    if (!og[key]) {
      og[key] = {};
    }

    if (so[key].hasOwnProperty('length')) {
      og[key] = og[key].hasOwnProperty('length') ? og[key] : [];
      og[key].push(so[key][0]);
    }

    if(typeof so[key] === 'object' && !so[key].hasOwnProperty('length')) {
      mergeObjects(og[key], so[key]);
    }
  }
  return og;
}

const openLargeDiff = () => $('.load-diff-button').click();

const init = (savedItems) => {
  if ($('.js-diff-progressive-spinner').length || !$('#files').length) {
    return;
  }

  injectCss(isCommit); // style.js
  injectHTML(savedItems);

  savedItems.collapsed ? collapseAllDiffBlocks() : expandAllDiffBlocks();
  savedItems.closed ? close() : open();

  if (savedItems.largeDiff) {
    openLargeDiff();
  }

  $(window).scroll(() => {
    let topOffset;

    if (isCommit) {
      const { top } = $(`.toc-diff-stats`).offset();
      topOffset = top + 50;
    } else {
      const { top } = $(`.tabnav-tabs`).offset();
      topOffset = top + 120;
    }

    window.pageYOffset > topOffset
      ? $('.gct-file-tree').addClass('gct-file-tree-fixed')
      : $('.gct-file-tree').removeClass('gct-file-tree-fixed');
  });

  // Click Functions
  $('.gct-folder-name').click(obj => {
    $($($(obj.currentTarget).parent()[0])[0]).toggleClass('gct-folder-open');
  });

  // On file name click
  $('.gct-file-name').click(obj => {
    var href = $(obj.currentTarget)[0].getAttribute("href");
    var file = $(`.file-info > a[href="${href}"]`).parent().parent().parent();
    openDiff(file);
  });

  $('#openAll').click(() => open());
  $('#closeAll').click(() => close());

  $('#expandAll').click(() => expandAllDiffBlocks());
  $('#collapseAll').click(() => collapseAllDiffBlocks());

  $('#refresh').click(() => reInjectHTML(savedItems));

  // recompute the tree when a file has been viewed or not
  $(document, '.js-reviewed-toggle').click(() => { reInjectHTML(savedItems)});
}

const start = () => setInterval(() => {
  chrome.storage.sync.get(['customRegex'], ({ customRegex }) => {
    const regex = customRegex || '(http|https):\\/\\/(www\\.)?github[\\.]?[-a-zA-Z0-9]*\\.com';

    if(!$('.gct-file-tree').length) {
      urlPullRegex = RegExp(`${regex}\\/[-a-zA-Z0-9-_.]*\\/[-a-zA-Z0-9-_.]*\\/pull\\/[0-9]*\\/(files|commits)`);
      urlCommitRegex = RegExp(`${regex}\\/[-a-zA-Z0-9_.]*\\/[-a-zA-Z0-9_.]*\\/commit`);

      isCommit = location.href.match(urlCommitRegex);

      if(
        (location.href.match(urlPullRegex) || isCommit) // show only on PR or commit page
      ) {
        chrome.storage.sync.get(['closed', 'collapsed', 'folders', 'largeDiff'], items => init(items));
      }
    }
  });
}, 500);

const buildHtmlTree = (tree)  => {
    var content = '<ul id="gct-tree">';

    let unorderedList = [];
    for(var key in tree) {
      if(key === 'files') {
        unorderedList = unorderedList.concat(tree.files.map(item => ({
          type: 'file',
          name: item.name,
          file: item
        })));
      }else {
        unorderedList.push({
          type: 'directory',
          name: key
        });
      }
    }
    const orderedList = unorderedList.sort((a,b) => a.name.localeCompare(b.name));

    orderedList.forEach(item => {
      if(item.type === 'file') {
        content += `
          <li class="gct-file ${item.file.viewed ? 'viewed' : ''}">
            <a class="gct-file-view">
              ${item.file.viewed ? iconViewed() : ''}
            </a>
            <span>
              <a class="gct-file-name" href="${item.file.link}">${iconFile()}  ${item.file.name}</a>
              <span class="gct-file-changes">
                <span class="gct-file-added">+${item.file.added}</span>
                <span class="gct-file-removed">-${item.file.removed}</span>
              </span>
            </span>
          </li>
        `;
      }else {
        content += `<li class="gct-folder gct-folder-open">
          <span class="gct-folder-name">${iconFolder()} ${item.name}</span>
          <div class="gct-sub-folders">${buildHtmlTree(tree[item.name])}</div>
        </li>`;
      }
    });

    content += '</ul>';

    return content;
}

const buildTree = (savedItems)  => {
  var tree = {};

  $('.file-info').map((i, item) => {
    var diff = /\D*(\d+)\D+(\d+)\D+(\d+)\D*/
      .exec(
        $(item).find('.diffstat')[0]
          .getAttribute("aria-label")
      );

    if (!diff || diff.length < 4) { // skip the "Empty file removed" case
      diff = ['0', '0', '0'];
    } else {
      diff = [diff[2], diff[2], diff[3]]
    }


    var pathString = $(item).find('a')[0];
    var pathLink = pathString.getAttribute("href");
    var filePath = $(item).parent('.file-header').data('path');
    var itemSplitted = filePath.split('/');
    var isViewed = $(item).next('.file-actions').find('.js-reviewed-checkbox').is(':checked');

    var nodeObj = {};
    var nodeObjJoker = nodeObj;
    itemSplitted.map((node, i) => {
      if (itemSplitted.length === i + 1) {
        nodeObjJoker['files'] = nodeObjJoker['files'] || [];
        nodeObjJoker['files'].push({
          total: parseInt(diff[0]),
          added: parseInt(diff[1]),
          removed: parseInt(diff[2]),
          name: node,
          link: pathLink,
          viewed: isViewed,
        });
        return;
      }

      nodeObjJoker[node] = {};
      nodeObjJoker = nodeObjJoker[node];
    });

    tree = mergeObjects(tree, nodeObj);
  });

  if (savedItems.folders) {
    tree = joinEmptyFolders(tree, []);

    if (tree.merge) {
      let temporaryTree = {};
      temporaryTree[tree.key] = tree.obj;
      tree = temporaryTree;
    }
  }

  return tree;
}

const joinEmptyFolders = (obj, paths) => {
  let current = obj;
  paths.map(path => current = current[path]);

  const files = Object.keys(current).filter(key => Array.isArray(current[key]));

  Object.keys(current)
    .filter(key => !Array.isArray(current[key])).map(key => {
    const childPath = [...paths, key];
    const folder = joinEmptyFolders(obj, childPath);
    if (folder.merge && files.length === 0) {
      childPath[childPath.length - 1] = `${key}/${folder.key}`;
      current[`${key}/${folder.key}`] = folder.obj;
      delete current[key];

      return {
        merge: true,
        obj: { ...current },
        key: key,
      };
    }
  });

  // yes, I need to extract again the keys from the current, it could be modified
  var keys = Object.keys(current).filter(key => !Array.isArray(current[key]));

  // has only sub-folder, so should merge the keys
  if (keys.length === 1) {
    let childKey = keys[0];

    if (current[keys[0]].files && current[keys[0]].files.length) {
      return {
        merge: true,
        obj: current[keys[0]],
        key: keys[0],
      };
    }
  }

  return current;
}

$(document).ready(start);
