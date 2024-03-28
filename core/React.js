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
  wipRoot = {
    dom: container,
    props: {
      children: [elementData],
    },
  };
  nextWorkOfUnit = wipRoot;
}

function update() {
  wipRoot = {
    dom: lastRoot.dom,
    props: lastRoot.props,
    alternate: lastRoot,
  };
  nextWorkOfUnit = wipRoot;
}

let nextWorkOfUnit = null;
let wipRoot = null;
// 用于更新
let lastRoot = null;

function workLoop(param) {
  const timeRemaining = param.timeRemaining();
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    shouldYield = timeRemaining < 1;
  }
  // console.log(nextFiber);
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.child);
  lastRoot = wipRoot;
  console.log("lastRoot", lastRoot);
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.dom) {
    if (fiber.action === "update") {
      // console.log("fiber.action === update", fiber);
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
  if (oldProps) {
    Object.keys(oldProps).forEach((key) => {
      if (key !== "children") {
        // console.log(key, props);
        if (!(key in props)) {
          // console.log(dom, key);
          dom.removeAttribute(key);
        }
      }
    });
  }

  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        dom.removeEventListener(eventName, oldProps[key]);
        dom.addEventListener(eventName, props[key]);
      } else {
        // console.log(key, props, dom);
        dom[key] = props[key];
      }
    }
  });
}

function reconcileChildren(fiber, children) {
  // 找老的子节点
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    let newFiber;
    if (oldFiber && oldFiber.type === child.type) {
      newFiber = {
        // 标签类型
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
      newFiber = {
        // 标签类型 div,span(Html标签) 或者 函数(函数组件)
        type: child.type,
        // 元素属性 与 子节点数据
        props: child.props,
        // 构建链表数据结构用到 |
        parent: fiber,
        // 构建链表数据结构用到
        child: null,
        // 构建链表数据结构用到
        sibling: null,
        // 节点对应的真实dom
        dom: null,
        // effectTag 统一提交时，根据此节点控制放置元素还是更改属性
        action: "placement",
      };
      console.log(newFiber.type);
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
  console.log(children);
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  reconcileChildren(fiber, children);
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
