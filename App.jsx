import React from "./core/React.js";
let count = 10;
let showFoo = false;

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
