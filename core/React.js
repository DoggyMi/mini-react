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
  let currentFiber = wipFiber;
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
}

let stateHooks = null;
let stateHooksIndex = null;

let i = 0;
// 生成随机字符串
function generateRandomString() {
  return ++i + "=》";
  // return Math.random().toString(36).substring(7).split("").join(".");
}

function useState(initial) {
  let currentFiber = wipFiber;

  let oldHook = currentFiber.alternate?.stateHooks[stateHooksIndex];

  // 如果oldhook存在newHook属性，说明已经修改过数据了，循环查找到最新的hook
  while (oldHook?.newHook) {
    oldHook = oldHook.newHook;
  }

  const stateHook = {
    id: generateRandomString(),
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };

  // 如果有老的hook，将新的hook挂载到老的hook上
  if (oldHook) {
    oldHook.newHook = stateHook;
  }

  // console.log("创建stateHook", stateHook.id, stateHook);

  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  });
  stateHook.queue = [];

  stateHooks.push(stateHook);

  currentFiber.stateHooks = stateHooks;

  stateHooksIndex++;

  function setState(action) {
    console.log(currentFiber.id, "setState", currentFiber, action);
    const egaerState =
      typeof action === "function" ? action(stateHook.state) : action;
    if (egaerState === stateHook.state) {
      return;
    }
    stateHook.queue.push(typeof action === "function" ? action : () => action);
    // 由于闭包原因？如果父元素setState之前，子元素的stateHooks已经更新了，
    // 这里的currentFiber里的子元素是不会更新的,所以会导致数据错乱
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
let currentRoot = null;

let deletions = [];
let wipFiber = null;

function workLoop(param) {
  const timeRemaining = param.timeRemaining();
  let shouldYield = false;
  while (nextWorkOfUnit && !shouldYield) {
    nextWorkOfUnit = performUnitOfWork(nextWorkOfUnit);
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined;
    }

    shouldYield = timeRemaining < 1;
  }
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }

  if (!wipRoot && nextWorkOfUnit) {
    wipRoot = currentRoot;
  }
  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach((fiber) => commitDelete(fiber));
  commitWork(wipRoot.child);
  commitEffect();
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitEffect() {
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
  runCleanUp(wipRoot);
  runEffect(wipRoot);
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
        if (!(key in props)) {
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

function reconcileChildren(fiber, children) {
  if (fiber.id === "25=》") {
    console.log("reconcileChildren", fiber.id, fiber, children);
  }

  // 找老的子节点
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
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
        id: generateRandomString(),
      };
      if (typeof newFiber.type === "function") {
        console.log("创建fiber-update", newFiber.id, newFiber);
      }
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
          id: generateRandomString(),
        };
        if (typeof newFiber.type === "function") {
          console.log("创建fiber-placement", newFiber.id, newFiber);
        }
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

  const children = [fiber.type(fiber.props)];

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
  useEffect,
  createElement: createVDom,
  update,
  useState,
};

export default React;
