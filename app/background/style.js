const injectCss = (isCommit) => {
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
      position: sticky;
      top: ${isCommit ? 20 : 70}px;
      background-color: transparent;
      left: 20px;
      z-index: 28;
      width: 280px;
      border: 1px solid #ddd;
      overflow: auto;
      padding: 10px;
      float: left;
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

    .gct-file {
      display: grid;
      grid-template-columns: 14px auto;
      margin-left: -14px;
    }

    .gct-file.viewed {
      opacity:0.5;
    }

    .gct-file-name {
      cursor: pointer;
    }
  </style>`).appendTo("head");
};
