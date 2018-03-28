function injectCss(offsetTop, offsetLeft) {
  $('#gct-style').remove();
  $(`<style type='text/css' id="gct-style">
    body.full-width #files {
      margin-left: 300px;
    }

    .gct-header {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }

    .gct-header > div {
      cursor: pointer;
    }

    .gct-file-tree {
      position: absolute;
      top: ${$('#files').offset().top - offsetTop}px;
      background-color: #fff;
      left: ${offsetLeft}px;
      z-index: 28;
      width: 280px;
      border: 1px solid #ddd;
      overflow: auto;
      padding: 10px;
    }

    .gct-icon {
      color: rgba(3, 47, 98, .4);
    }

    .gct-file-tree ul {
      list-style: none;
    }

    .gct-file-added {
      color: #2cbe4e;
    }

    .gct-file-removed {
      color: #cb2431;
    }

    .gct-file-changes {
      font-size: 0.7rem;
    }

    .gct-file-tree ul li {
      white-space: nowrap;
      margin-bottom: 5px;
    }

    .gct-sub-folders {
      margin-left: 15px;
      margin-top: 5px;
      display: none;
    }

    .gct-folder-open > .gct-sub-folders {
      display: block;
    }

    .gct-folder-open > .gct-folder-name > .gct-icon {
      color: rgba(3, 47, 98, .8);
    }

    .gct-folder-name {
      cursor: pointer;
    }

    .gct-file-name {
      cursor: pointer;
    }

    body:not(.full-width) .gct-file-tree,
    .gct-file-tree-fixed {
      position: fixed;
      top: 70px;
      left: 20px;
      height: calc(100% - 80px);
    }
  </style>`)
  .appendTo("head");
}