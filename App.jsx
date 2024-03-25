import React from "./core/React.js";

function Counter(num) {
  return <div>this is Counter{num}</div>;
}

function CounterContainer({ num }) {
  return <Counter num={num}></Counter>;
}

function App() {
  return (
    <div id="waka" className="123">
      hi-mini-jsx<div>321</div>
      <CounterContainer num="123123"></CounterContainer>
      <Counter num="444444"></Counter>
    </div>
  );
}

export default App;
