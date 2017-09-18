$(document).ready(start);

$(window).scroll(() => {
  if($('.is-stuck').length) {
    $('.gct-file-tree').addClass('gct-file-tree-fixed');
  }else {
    $('.gct-file-tree').removeClass('gct-file-tree-fixed');
  }
});

function start() {
  var oldLocation;
  setInterval(() => {
    if(location.origin + location.pathname != oldLocation) {
      oldLocation = location.origin + location.pathname;

      urlRegex = /(http|https):\/\/(www\.)?github\.com\/[-a-zA-Z1-9]*\/[-a-zA-Z1-9]*\/pull\/[0-9]*\/files/;
      if(location.href.match(urlRegex)) { // show only on PR files page
        initialSetup();
      }
    }
  }, 500);
}

function initialSetup() {
  if ($('.js-diff-progressive-spinner').length) {
    console.log('is loading..');
    setTimeout(initialSetup, 100);
    return;
  }

  console.log('starting..');

  injectCss(); // style.js
  injectHTML();

  // Click Functions
  $('.gct-folder-name').click(obj => {
      $($($(obj.currentTarget).parent()[0])[0]).toggleClass('gct-folder-open');
  });

  $('#openAll').click(() => {
      $('.gct-folder').addClass('gct-folder-open');
  });

  $('#closeAll').click(() => {
      $('.gct-folder').removeClass('gct-folder-open');
  });
}

function injectHTML() {
    tree = buildTree();
    $(`<div class="gct-file-tree">
        <div class="gct-header">
            <div id="openAll">Open All</div>
            <div id="closeAll">Close All</div>
        </div>
        ${buildHtmlTree(tree)}
        </div>`).appendTo('#files');
}

function buildHtmlTree(tree) {
    var content = '<ul>';

    for(var key in tree) {
        if(key === 'files') continue;
        content += `<li class="gct-folder">
            <span class="gct-folder-name">${iconFolder()} ${key}</span>
            <div class="gct-sub-folders">${buildHtmlTree(tree[key])}</div>
        </li>`;
    }

    if(tree.files) {
        tree.files.map(item => {
            content += `
                <li class="gct-file">
                    <a class="gct-file-name" href="${item.link}">${iconFile()}  ${item.name}</a>
                    <span class="gct-file-changes">
                        <span class="gct-file-added">+${item.added}</span>
                        <span class="gct-file-removed">-${item.removed}</span>
                    </span>
                </li>
            `;
        });
    }

    return content;
}

function buildTree() {
    var tree = {};

    $('.file-info').map((i, item) => {
        var diff = $(item).find('.diffstat')[0]
                            .getAttribute("aria-label")
                            .split(' & ');
        var pathString = $(item).find('a')[0];
        var pathLink = pathString.getAttribute("href");
        var filePath = $(item).parent('.file-header').data('path');
        var itemSplitted = filePath.split('/');

        var nodeObj = {};
        var nodeObjJoker = nodeObj;
        itemSplitted.map((node, i) => {
            if (itemSplitted.length === i + 1) {
                nodeObjJoker['files'] = nodeObjJoker['files'] || [];
                nodeObjJoker['files'].push({
                    added: diff[0].replace(/[^0-9]/g,'') * 1,
                    removed: diff[1].replace(/[^0-9]/g,'') * 1,
                    name: node,
                    link: pathLink
                });
                return;
            }

            nodeObjJoker[node] = {};
            nodeObjJoker = nodeObjJoker[node];
        });

        tree = mergeObjects(tree, nodeObj);
    });

    return tree;
}

function mergeObjects(og, so) {
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
