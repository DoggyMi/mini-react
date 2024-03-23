// 3 封装render
const TEXT_EL = "TEXT_EL";

function createTextElData(textStr) {
  return { type: TEXT_EL, value: textStr };
}

function createElement(type, props, ...children) {
  return {
    type,
    props,
    children: children.map((child) => {
      return typeof child === "string" ? createTextElData(child) : child;
    }),
  };
}

function createTextEl(textStr) {
  return document.createTextNode(textStr);
}

// function creataDivEl(type,props, ...children) {
//     return document.createElement(type);
//   }

const root = document.getElementById("root");
const app = createElement("div", { id: "123" }, "wakaka", "hello world");
render(app, root);

function render(elementData, parent) {
  // 创建节点
  const elementNode =
    elementData.type === TEXT_EL
      ? createTextEl(elementData.value)
      : document.createElement(elementData.type);

  // 绑定参数
  elementData.props &&
    Object.keys(elementData.props).map((key) => {
      elementNode[key] = elementData.props[key];
    });
  // 遍历子节点
  elementData.children &&
    elementData.children.forEach((childItem) => {
      render(childItem, elementNode);
    });

  // 挂到父节点上
  parent.append(elementNode);
}
