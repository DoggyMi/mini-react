import React from "../core/React";
export default function Todos() {
  const [itemList, setItemList] = React.useState([
    { text: "123", done: false, id: crypto.randomUUID() },
    { text: "456", done: true, id: crypto.randomUUID() },
  ]);

  const [displayList, setDisplayList] = React.useState([...itemList]);
  const [inputValue, setInputValue] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  console.log("更新 Todos", inputValue, itemList, displayList);
  React.useEffect(() => {
    const todos = localStorage.getItem("todos");
    if (todos) {
      setItemList(JSON.parse(todos));
    }
  }, []);

  React.useEffect(() => {
    if (filter === "all") {
      setDisplayList(itemList);
    } else if (filter === "done") {
      setDisplayList(itemList.filter((item) => item.done));
    } else if (filter === "active") {
      setDisplayList(itemList.filter((item) => !item.done));
    }
  }, [filter, itemList]);

  function onAddClick() {
    console.log("onAddClick");
    if (inputValue) {
      addTodo(inputValue);
      setInputValue("");
    }
  }

  function onSaveClick() {
    localStorage.setItem("todos", JSON.stringify(itemList));
  }

  function createTodo(title) {
    return {
      text: title,
      done: false,
      id: crypto.randomUUID(),
    };
  }

  function addTodo(title) {
    setItemList((list) => [...list, createTodo(title)]);
  }

  function deleteItem(id) {
    const newItemList = itemList.filter((item) => item.id !== id);
    setItemList(newItemList);
  }

  function doneItem(id) {
    const newItemList = itemList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          done: !item.done,
        };
      }
      return item;
    });
    setItemList(newItemList);
  }

  function TodoItem({ item, deleteItem, doneItem }) {
    return (
      <div className={item.done ? "done" : "active"}>
        {item.text}
        <button onClick={() => deleteItem(item.id)}>remove</button>
        {item.done ? (
          <button onClick={() => doneItem(item.id)}>cancel</button>
        ) : (
          <button onClick={() => doneItem(item.id)}>done</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>TODOS</h2>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            console.log("onChange");
            setInputValue(e.target.value);
          }}
        />
        <button onClick={onAddClick}>add</button>
      </div>
      <div>
        <button onClick={onSaveClick}>save</button>
      </div>
      <div>
        <input
          type="radio"
          id="all"
          name="filter"
          value="all"
          checked
          onChange={() => {
            setFilter("all");
          }}
        />
        <label for="all">all</label>

        <input
          type="radio"
          id="done"
          name="filter"
          value="done"
          onChange={() => {
            setFilter("done");
          }}
        />
        <label for="done">done</label>

        <input
          type="radio"
          id="active"
          name="filter"
          value="active"
          onChange={() => {
            setFilter("active");
          }}
        />
        <label for="active">active</label>
      </div>
      <ul>
        {...displayList.map((item) => (
          <li>
            <TodoItem
              item={item}
              deleteItem={deleteItem}
              doneItem={doneItem}
            ></TodoItem>
          </li>
        ))}
      </ul>
    </div>
  );
}
