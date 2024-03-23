const TEXT_EL = "TEXT_EL";

function createTextEl(textStr) {
  return document.createTextNode(textStr);
}

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

function render(container, elementData) {
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
      render(elementNode, childItem);
    });

  // 挂到父节点上
  container.append(elementNode);
}

const React = {
  render,
  createElement,
};

export default React;
