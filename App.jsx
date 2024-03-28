import React from "./core/React.js";
let countRoot = 10;
let countFoo = 15;
let countBar = 20;
// let showFoo = false;

function Foo() {
  console.log("更新 Foo");
  const update = React.update();
  const handleClick = () => {
    console.log("点击 click foo");
    countFoo++;
    update();
  };
  return (
    <div>
      <button onClick={handleClick}>Foo</button>
      {countFoo}
    </div>
  );
}
function Bar() {
  console.log("更新 Bar");
  const update = React.update();
  const handleClick = () => {
    console.log("点击 click bar");
    countBar++;
    update();
  };
  return (
    <div>
      <button onClick={handleClick}>Bar</button>
      {countBar}
    </div>
  );
}

function App() {
  console.log("更新 App");
  const update = React.update();
  const handleClick = () => {
    console.log("点击 click app");
    countRoot++;
    update();
  };
  return (
    <div>
      hi-mini-react
      <button onClick={handleClick}>App</button> {countRoot}
      <Foo></Foo>
      <Bar></Bar>
      {/* <Counter num={10}></Counter> */}
      {/* <Counter num={20}></Counter> */}
      {/* <CounterContainer></CounterContainer> */}
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
