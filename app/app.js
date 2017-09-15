$(document).ready(start);

var tree = {};

function start() {
    urlRegex = /(http|https):\/\/(www\.)?github\.com\/[-a-zA-Z1-9]*\/[-a-zA-Z1-9]*\/pull\/[0-9]*\/files/;
    if(location.href.match(urlRegex)) {
        console.log('hi');
        injectCss();
        startTree();
    }
}

function startTree() {
    $('.file-info a').map((i, item) => {
        var itemSplitted = item.text.split('/');
        var nodeObj = {};
        var nodeObjJoker = nodeObj;
        itemSplitted.map((node, i) => {
            if (itemSplitted.length === i + 1) {
                nodeObjJoker['files'] = nodeObjJoker['files'] || [];
                nodeObjJoker['files'].push(node);
                return;
            }

            nodeObjJoker[node] = {};
            nodeObjJoker = nodeObjJoker[node];
        });
        console.log(nodeObj);
        $.extend(tree, nodeObj);
    });
    console.log(tree);
}

function injectCss() {
    $(`<style type='text/css'>
        .diff-view.commentable {
            position: relative;
            width: 80%;
        }
    </style>`)
    .appendTo("head");
}