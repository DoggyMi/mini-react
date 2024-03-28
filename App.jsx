import React from "./core/React.js";
let count = 10;
let showFoo = false;
function Counter({ num }) {
  function onClick() {
    props = {};
    count++;
    React.update();
  }
  return (
    <div {...props}>
      <button onClick={onClick}>123</button>
      count: {count}
    </div>
  );
}

function Foo() {
  return (
    <>
      FOO <div>123</div>
      <div>456</div>
    </>
  );
}

function Bar() {
  return <p>Bar</p>;
}

function FooBarContainer() {
  const foo = (
    <p>
      foo <div>123</div>
      <div>1243</div>
    </p>
  );
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
      {showFoo && foo}
      {/* <div>{showFoo ? foo : bar}</div> */}
      {/* <div>{showFoo ? <Foo></Foo> : <Bar></Bar>}</div> */}
    </div>
  );
}

function Foo() {
  return (
    <>
      FOO <div>123</div>
      <div>456</div>
    </>
  );
}

function Bar() {
  return <p>Bar</p>;
}

function FooBarContainer() {
  const foo = (
    <p>
      foo <div>123</div>
      <div>1243</div>
    </p>
  );
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
      {showFoo && foo}
      {/* <div>{showFoo ? foo : bar}</div> */}
      {/* <div>{showFoo ? <Foo></Foo> : <Bar></Bar>}</div> */}
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
