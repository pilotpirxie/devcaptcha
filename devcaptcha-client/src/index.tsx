import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";

console.log(Math.random());

ReactDOM.render(
    <App compiler={"a"} />,
    window.document.getElementById("example")
);