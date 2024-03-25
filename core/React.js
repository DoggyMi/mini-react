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
  nextFiber = {
    dom: container,
    type: elementData.type,
    props: elementData.props,
  };
  rootFiber = nextFiber;
}

let nextFiber = null;
let rootFiber = null;

function callback(param) {
  const timeRemaining = param.timeRemaining();
  let shouldYield = false;
  while (nextFiber && !shouldYield) {
    nextFiber = performUnitOfWork(nextFiber);
    shouldYield = timeRemaining < 1;
  }
  // console.log(nextFiber);
  if (nextFiber === null && rootFiber) {
    commitRoot();
  }
  requestIdleCallback(callback);
}

function commitRoot() {
  commitWork(rootFiber.child);
  rootFiber = null;
}

function commitWork(fiber) {
  if (fiber !== null) {
    if (fiber.parent.dom) {
      fiber.parent.dom.appendChild(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.subling);
  }
}

function initHtmlDom(fiber) {
  if (!fiber.dom) {
    const dom =
      fiber.type === TEXT_EL
        ? createTextEl(fiber.props.value)
        : document.createElement(fiber.type);
    Object.keys(fiber.props).map((key) => {
      if (key !== "children") {
        dom[key] = fiber.props[key];
      }
    });
    fiber.dom = dom;
  }
}

function initFunctionDom(fiber) {
  let { props, type } = fiber.type(fiber.props);
  while (typeof type === "function") {
    props = type(props).props;
    type = type(props).type;
  }
  if (!fiber.dom) {
    const dom =
      type === TEXT_EL
        ? createTextEl(props.value)
        : document.createElement(type);
    Object.keys(props).map((key) => {
      if (key !== "children") {
        dom[key] = props[key];
      }
    });
    fiber.dom = dom;
  }
  fiber.type = type;
  fiber.props = props;
}

function initChildFiber(fiber) {
  const props = fiber.props;
  let lastChild = null;
  if (props.children) {
    props.children.forEach((child, index) => {
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
}

function createFunctionComponent(fiber) {
  initFunctionDom(fiber);
  initChildFiber(fiber);
  console.log("createFunctionComponent", fiber);
}

function createHtmlComponent(fiber) {
  initHtmlDom(fiber);
  initChildFiber(fiber);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";
  if (isFunctionComponent) {
    createFunctionComponent(fiber);
  } else {
    createHtmlComponent(fiber);
  }

  console.log(fiber);

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
