import React from "./core/React.js";
let count = 10;
let props = { id: "11111" };
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
      <Counter num={10}></Counter>
      {/* <Counter num={20}></Counter> */}
      {/* <CounterContainer></CounterContainer> */}
    </div>
  );
}

export default App;
