// 1 通过js代码，在页面中展示一段文字
const root = document.getElementById("root");
const div = document.createElement("div");
var btn = document.createTextNode("Hello World");

btn.nodeValue = "app";
div.id = "app";
div.append(btn);
root.append(div);
