import React from "./core/React.js";

function Counter({ num }) {
  function onClick(){
    console.log("123");
  }
  return <div >
    <button onClick={onClick}>123</button>
    count: {num}
    </div>;
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
      <Counter num={10}></Counter>213
      <Counter num={20}></Counter>
      <CounterContainer></CounterContainer>
    </div>
  );
}

export default App;
