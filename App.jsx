import React from "./core/React.js";

function Foo() {
  console.log("更新 Foo");
  const [count, setCount] = React.useState(10);
  const [fooStr, setFooStr] = React.useState("A");
  React.useEffect(() => {
    console.log("init");
    return () => {
      console.log("clear init");
    };
  }, []);

  React.useEffect(() => {
    console.log("count", count);
    return () => {
      console.log("clear count1");
    };
  }, [count]);

  React.useEffect(() => {
    console.log("count 2", count);
    return () => {
      console.log("clear count2");
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
  const [count, setCount] = React.useState(10);
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

function App() {
  console.log("更新 App");
  const [count, setCount] = React.useState(10);
  const handleClick = () => {
    setCount((c) => c + 1);
  };
  return (
    <div>
      hi-mini-react
      <button onClick={handleClick}>App</button> {count}
      <Foo></Foo>
      <Bar></Bar>
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

export default App;
