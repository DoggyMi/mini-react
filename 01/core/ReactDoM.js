import React from "./React.js";

const ReactDom = {
  createRoot(container) {
    return {
      render(App) {
        React.render(container, App);
      },
    };
  },
};

export default ReactDom;
