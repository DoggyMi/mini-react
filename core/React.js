const TEXT_ELEMENT = "TEXT_ELEMENT";

function createTextVDOM(textStr) {
  return { type: TEXT_ELEMENT, props: { nodeValue: textStr, children: [] } };
}

function createVDom(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextVDOM(child) : child;
      }),
    },
  };
}

function render(elementData, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [elementData],
    },
  };
  root = nextWorkOfUnit;
}

function update() {
  // console.log(lastRoot);
  nextWorkOfUnit = {
    dom: lastRoot.dom,
    props: lastRoot.props,
    alternate: lastRoot,
  };
  root = nextWorkOfUnit;
}

let nextWorkOfUnit = null;
let root = null;
// 用于更新
let lastRoot = null;

let deletions = [];

function workLoop(param) {
  const timeRemaining = param.timeRemaining();
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    shouldYield = timeRemaining < 1;
  }
  if (!nextWorkOfUnit && root) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach((fiber) => commitDelete(fiber));

  commitWork(root.child);
  lastRoot = root;
  root = null;
  deletions = [];
}

function commitDelete(fiber) {
  if (fiber.dom) {
    let fiberParentHasDom = fiber.parent;
    while (!fiberParentHasDom.dom) {
      fiberParentHasDom = fiberParentHasDom.parent;
    }
    fiberParentHasDom.dom.removeChild(fiber.dom);
  } else {
    commitDelete(fiber.child);
  }
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    if (fiber.action === "update") {
      updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else if (fiber.action === "placement") {
      fiberParent.dom.append(fiber.dom);
    }
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDom(type) {
  return type === TEXT_ELEMENT
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, props, oldProps) {
  // 删除
  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      if (key !== "children") {
        if (!key in props) {
          dom.removeAttribute(key);
        }
      }
    });
  }
  // 更新或者添加
  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      if (props[key] !== oldProps[key]) {
        if (key.startsWith("on")) {
          const eventName = key.slice(2).toLowerCase();
          dom.removeEventListener(eventName, oldProps[key]);
          dom.addEventListener(eventName, props[key]);
        } else {
          dom[key] = props[key];
        }
      }
    }
  });
}

function initChildren(fiber, children) {
  // 找老的子节点
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  // console.log(fiber);
  // console.log(oldFiber);
  children.forEach((child, index) => {
    let newFiber;

    const isSameTag = oldFiber && oldFiber.type === child.type;
    if (isSameTag) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        action: "update",
      };
    } else {
      if (oldFiber) {
        deletions.push(oldFiber);
      }
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: null,
        action: "placement",
      };
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  // console.log(children);
  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  initChildren(fiber, children);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

requestIdleCallback(workLoop);

const React = {
  render,
  createElement: createVDom,
  update,
};

export default React;
