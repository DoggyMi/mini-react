const TEXT_ELEMENT = "TEXT_ELEMENT";

function createTextVDOM(textStr) {
  return { type: TEXT_ELEMENT, props: { nodeValue: textStr, children: [] } };
}

function createVDom(type, props, ...children) {
  // console.log("children", children);
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
  // console.log(1, wipFiber);
  let currentFiber = wipFiber;
  return () => {
    // console.log(2, currentFiber);
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
}

let stateHooks = null;
let stateHooksIndex = null;

function useState(initial) {
  let currentFiber = wipFiber;
  const oldHook = currentFiber.alternate?.stateHooks[stateHooksIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };

  stateHooks.push(stateHook);

  currentFiber.stateHooks = stateHooks;

  stateHooksIndex++;
  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  });
  stateHook.queue = [];
  function setState(action) {
    const egaerState =
      typeof action === "function" ? action(stateHook.state) : action;
    if (egaerState === stateHook.state) {
      return;
    }
    stateHook.queue.push(typeof action === "function" ? action : () => action);
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  }
  return [stateHook.state, setState];
}

let effectHooks = [];
function useEffect(action, deps) {
  effectHooks.push({
    action,
    deps,
    cleanUp: undefined,
  });
  wipFiber.effectHooks = effectHooks;
}

let nextWorkOfUnit = null;
let wipRoot = null;
// 用于更新
let lastRoot = null;

let deletions = [];
let wipFiber = null;

function workLoop(param) {
  const timeRemaining = param.timeRemaining();
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      // console.log("hit!!!", wipRoot, nextWorkOfUnit);
      nextWorkOfUnit = undefined;
    }

    shouldYield = timeRemaining < 1;
  }
  // console.log(nextFiber);
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach((fiber) => commitDelete(fiber));
  commitWork(wipRoot.child);
  commitEffect(wipRoot);
  // lastRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitEffect(fiber) {
  function runEffect(fiber) {
    if (!fiber) return;
    if (fiber.effectHooks) {
      if (!fiber.alternate) {
        fiber.effectHooks.forEach((effectHook) => {
          effectHook.cleanUp = effectHook.action();
        });
      } else {
        fiber.effectHooks.forEach((effectHook, index) => {
          if (effectHook.deps.length > 0) {
            const oldEffectHook = fiber.alternate.effectHooks[index];
            const result = effectHook.deps.some((dep, i) => {
              return dep !== oldEffectHook.deps[i];
            });
            if (result) {
              effectHook.cleanUp = effectHook.action();
            }
          }
        });
      }
    }
    runEffect(fiber.child);
    runEffect(fiber.sibling);
  }

  function runCleanUp(fiber) {
    if (!fiber) return;
    fiber.alternate?.effectHooks?.forEach((effectHook) => {
      if (effectHook.deps.length > 0) {
        effectHook.cleanUp && effectHook.cleanUp();
      }
    });
    runCleanUp(fiber.child);
    runCleanUp(fiber.sibling);
  }
  runCleanUp(fiber);
  runEffect(fiber);
}

function commitDelete(fiber) {
  // console.log("commitDelete", fiber);
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
          // console.log("key", key, oldProps[key], props[key]);
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

function reconcileChildren(fiber, children) {
  // 找老的子节点
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    // console.log("child", child);
    let newFiber;

    const isSameTag = oldFiber && oldFiber.type === child.type;
    if (isSameTag) {
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
      if (child) {
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
        deletions.push(oldFiber);
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    if (newFiber) {
      prevChild = newFiber;
    }
  });
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  stateHooks = [];
  stateHooksIndex = 0;
  effectHooks = [];
  wipFiber = fiber;
  // console.log("fiber", fiber);
  const children = [fiber.type(fiber.props)];
  // console.log(children);
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    // console.log(fiber);
    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";
  // console.log(fiber);
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
  useEffect,
  createElement: createVDom,
  update,
  useState,
};

export default React;
