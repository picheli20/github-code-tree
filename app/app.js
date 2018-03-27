$(document).ready(start);

var isCommit = false;

$(window).scroll(() => {
  if (isCommit) return;
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

      urlPullRegex = /(http|https):\/\/(www\.)?github\.com\/[-a-zA-Z0-9]*\/[-a-zA-Z0-9]*\/pull\/[0-9]*\/(files|commits)/;
      urlCommitRegex = /(http|https):\/\/(www\.)?github\.com\/[-a-zA-Z0-9]*\/[-a-zA-Z0-9]*\/commit/;

      isCommit = location.href.match(urlCommitRegex);

      if(location.href.match(urlPullRegex) || location.href.match(urlCommitRegex)) { // show only on PR files page
        initialSetup();
      }
    }
  }, 500);
}

function initialSetup() {
  if ($('.js-diff-progressive-spinner').length || !$('#files').length) {
    setTimeout(initialSetup, 100);
    return;
  }

  injectCss(isCommit ? 0 : 178, isCommit ? 20 : 0); // style.js
  injectHTML();

  areDiffBlocksCollapsed() ?  $('#collapseAll').hide() : $('#expandAll').hide();

  // Click Functions
  $('.gct-folder-name').click(obj => {
      $($($(obj.currentTarget).parent()[0])[0]).toggleClass('gct-folder-open');
  });

  $('.gct-file-name').click(obj => {
    var href = $(obj.currentTarget)[0].getAttribute("href");
    var file = $(`.file-info > a[href="${href}"]`).parent().parent().parent();
    if ($(file).hasClass('open Details--on')) {
      $(file).removeClass('open Details--on');
    }
  });

  $('#openAll').click(() => {
      $('.gct-folder').addClass('gct-folder-open');
  });

  $('#closeAll').click(() => {
      $('.gct-folder').removeClass('gct-folder-open');
  });

  $('#expandAll').click(() => {
      expandAllDiffBlocks();
  });

  $('#collapseAll').click(() => {
      collapseAllDiffBlocks();
  });
}

function injectHTML() {
    tree = buildTree();
    $(
        `<div class="gct-file-tree">
            <div class="gct-header">
                <div id="openAll">Open All</div>
                <div id="closeAll">Close All</div>
                <div id="expandAll">Expand All</div>
                <div id="collapseAll">Collapse All</div>
            </div>
            ${buildHtmlTree(tree)}
        </div>`
    ).appendTo('#files');
}

function buildHtmlTree(tree) {
    var content = '<ul>';

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
                <li class="gct-file">
                    <a class="gct-file-name" href="${item.file.link}">${iconFile()}  ${item.file.name}</a>
                    <span class="gct-file-changes">
                        <span class="gct-file-added">+${item.file.added}</span>
                        <span class="gct-file-removed">-${item.file.removed}</span>
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

    return content;
}

function buildTree() {
    var tree = {};

    $('.file-info').map((i, item) => {
        var diff = $(item).find('.diffstat')[0]
                            .getAttribute("aria-label")
                            .split(' & ');

        if (diff.length !== 2) { // skip the "Empty file removed" case
            diff = ['0', '0'];
        }
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

function areDiffBlocksCollapsed() {
    var numberOfDiffBlocksCollapsed = 0;
    var numberOfDiffBlocks = $('#files .file').length;

    $('#files .file').each(function(){
        if ($(this).hasClass('open Details--on')) {
            numberOfDiffBlocksCollapsed++;
        }
    });

    return numberOfDiffBlocksCollapsed === numberOfDiffBlocks;
}

function expandAllDiffBlocks() {
    $('#expandAll').hide();
    $('#collapseAll').show();
    $('#files .file').each(function(){
        if ($(this).hasClass('open Details--on')) {
            $(this).removeClass('open Details--on')
        }
    });
}

function collapseAllDiffBlocks() {
    $('#collapseAll').hide();
    $('#expandAll').show();
    $('#files .file').each(function(){
        if (!$(this).hasClass('open Details--on')) {
            $(this).addClass('open Details--on')
        }
    });
}
