import React from "./core/React.js";
let count = 10;
let showFoo = false;
function Counter({ num }) {
  function onClick() {
    React.update();
  }
  return (
    <div>
      <button onClick={onClick}>123</button>
      count: {count++}
    </div>
  );
}

function Foo() {
  return <div>FOO</div>;
}

function FooBarContainer() {
  const bar = <p>Bar</p>;
  const doClick = () => {
    showFoo = !showFoo;
    // console.log("showFoo", showFoo);
    React.update();
  };
  // console.log("FooBarContainer", showFoo);
  return (
    <div>
      FooBarContainer
      <button onClick={doClick}>点击</button>
      <div>{showFoo ? <Foo></Foo> : bar}</div>
    </div>
  );
}

function CounterContainer() {
  return (
    <>
      <Counter num={1003}></Counter>
      <Counter num={1004}></Counter>
    </>
  );
}

function App() {
  return (
    <div>
      hi-mini-react
      <FooBarContainer></FooBarContainer>
      {/* <Counter num={10}></Counter> */}
      {/* <Counter num={20}></Counter> */}
      {/* <CounterContainer></CounterContainer> */}
    </div>
  );
}

export default App;
