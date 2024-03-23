// 2 将变量抽取出来，并整理成json数据结构，通过改变数据，渲染出不同的UI

// 即虚拟dom
const data = {
  type: "div",
  props: { id: "app" },
  children: [
    {
      type: "text",
      props: { id: "id1" },
      value: "hello world",
    },
    {
      type: "text",
      props: { id: "id2" },
      value: "aaa",
    },
  ],
};

const root = document.getElementById("root");
const div = document.createElement(data.type);
div.id = data.props.id;
root.append(div);
for (let index = 0; index < data.children.length; index++) {
  const childItemData = data.children[index];
  let childItem = null;
  if (childItemData.type === "text") {
    childItem = document.createTextNode(childItemData.value);
  } else {
    childItem = document.createElement(childItemData.type);
  }
  childItem.id = childItemData.props.id;
  div.append(childItem);
}
