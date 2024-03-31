import React from "./core/React.js";

function Foo() {
  console.log("更新 Foo");
  const [count, setCount] = React.useState(10);
  const [fooStr, setFooStr] = React.useState("A");
  React.useEffect(() => {
    // console.log("init");
    return () => {
      // console.log("clear init");
    };
  }, []);

  React.useEffect(() => {
    // console.log("count", count);
    return () => {
      // console.log("clear count1");
    };
  }, [count]);

  React.useEffect(() => {
    // console.log("count 2", count);
    return () => {
      // console.log("clear count2");
    };
  }, [count]);
  const handleClick = () => {
    // setCount(2);
    setCount((c) => c + 1);
    // setFooStr((str) => str + "A");
  };
  return (
    <div>
      <button onClick={handleClick}>Foo</button>
      <div> {count}</div>
      <div> {fooStr}</div>
    </div>
  );
}
function Bar() {
  console.log("更新 Bar");
  const [count, setCount] = React.useState(20);
  const handleClick = () => {
    setCount((c) => c + 1);
  };
  return (
    <div>
      <button onClick={handleClick}>Bar</button>
      {count}
    </div>
  );
}

function FooBarContainer() {
  const foo = (
    <p>
      foo
      <div>123</div>
      <div>1243</div>
    </p>
  );
  const doClick = () => {
    showFoo = !showFoo;
    React.update();
  };
  return (
    <div>
      FooBarContainer
      <button onClick={doClick}>点击</button>
      {showFoo && foo}
    </div>
  );
}

{
  /* <div>
<button onClick={handleClick}>App</button>
{count}
<Bar></Bar>
</div> */
}

function App() {
  const [itemList, setItemList] = React.useState([
    { text: "123", done: false },
    { text: "456", done: false },
  ]);
  const [allList, setAllItemList] = React.useState([
    { text: "123", done: false },
    { text: "456", done: false },
  ]);

  let filter = "all";
  let inputStr;

  const onAddClick = () => {
    addTodo();
  };

  const onTextChange = (e) => {
    inputStr = e.target.value;
  };

  const onkeydown = (e) => {
    if (e.key === "Enter") {
      setTimeout(() => {
        addTodo();
      }, 1);
    }
  };

  function addTodo() {
    if (inputStr) {
      setAllItemList((list) => [...list, { text: inputStr, done: false }]);
      updateItemList();
    }
  }

  function updateItemList() {
    const filterList = allList.filter((item) => {
      if (filter === "done") {
        return item.done;
      } else if (filter === "active") {
        return !item.done;
      }
      return true;
    });
    setItemList(filterList);
  }

  const handleChange = (e) => {
    filter = e.target.value;
    updateItemList();
  };

  function TodoList({ itemList }) {
    return (
      <ul>{...itemList.map((item) => <TodoItem item={item}></TodoItem>)}</ul>
    );
  }

  function TodoItem({ item }) {
    function deleteItem() {
      setAllItemList((list) => list.filter((tempItem) => tempItem !== item));
      updateItemList();
      setItemList;
    }

    function doneItem() {
      const done = !item.done;
      setItemList((list) => {
        return list.map((tempItem) => {
          if (tempItem === item) {
            tempItem.done = done;
            return tempItem;
          }
          return tempItem;
        });
      });
    }
    return (
      <li>
        <span style={{ color: "red", fontSize: "400px" }}>
          {item.text}== {item.done + ""}
        </span>
        <button onClick={deleteItem}>remove</button>
        <button onClick={doneItem}>done</button>
      </li>
    );
  }
  return (
    <div>
      <h2>TODOS</h2>

      <div>
        <input type="text" onChange={onTextChange} onkeydown={onkeydown} />
        <button onClick={onAddClick}>add</button>
      </div>
      <div>
        <button>save</button>
      </div>
      <div>
        <input
          type="radio"
          id="all"
          name="filter"
          value="all"
          checked
          onChange={handleChange}
        />
        <label for="all">all</label>

        <input
          type="radio"
          id="done"
          name="filter"
          value="done"
          onChange={handleChange}
        />
        <label for="done">done</label>

        <input
          type="radio"
          id="active"
          name="filter"
          value="active"
          onChange={handleChange}
        />
        <label for="active">active</label>
      </div>
      <TodoList itemList={itemList}></TodoList>
    </div>
  );
}

export default App;
