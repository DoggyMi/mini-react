const TEXT_EL = "TEXT_EL";

function createTextEl(textStr) {
  return document.createTextNode(textStr);
}

function createTextElData(textStr) {
  return { type: TEXT_EL, props: { value: textStr } };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextElData(child) : child;
      }),
    },
  };
}

function render(container, elementData) {
  console.log(1, container, elementData);
  nextFiber = {
    dom: container,
    type: elementData.type,
    props: elementData.props,
  };
}

let nextFiber = null;

function callback(param) {
  const timeRemaining = param.timeRemaining();
  let shouldYield = false;
  while (nextFiber && !shouldYield) {
    nextFiber = performUnitOfWork(nextFiber);
    shouldYield = timeRemaining < 1;
  }
  requestIdleCallback(callback);
}

/**
 * 创建节点 并绑定参数
 * @param {*} fiber
 */
function createDom(type, props) {
  // console.log(type, props);
  const dom =
    type === TEXT_EL ? createTextEl(props.value) : document.createElement(type);
  props &&
    Object.keys(props).map((key) => {
      if (key !== "children") {
        dom[key] = props[key];
      }
    });
  return dom;
}

/**
 * @param {object} fiber
 */
function performUnitOfWork(fiber) {
  console.log("fiber", fiber);
  if (!fiber.dom) {
    // 创建当前dom并挂载到父节点
    fiber.dom = createDom(fiber.type, fiber.props, fiber);
    fiber.parent.dom.appendChild(fiber.dom);
  }
  // 遍历 创建子节点的fiber
  let lastChild = null;
  if (fiber.props.children) {
    fiber.props.children.forEach((child, index) => {
      console.log("child", child, index);
      const newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        dom: null,
        child: null,
        subling: null,
      };
      if (index === 0) {
        fiber.child = newFiber;
      } else if (lastChild) {
        lastChild.subling = newFiber;
      }
      lastChild = newFiber;
    });
  }
  // 返回下一个fiber
  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.subling) {
    return fiber.subling;
  }
  return fiber.parent.subling;
}

requestIdleCallback(callback);

const React = {
  render,
  createElement,
};

export default React;
