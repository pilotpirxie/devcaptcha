import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/App";

ReactDOM.render(
    <Hello compiler="aaaaaaaa" framework="React" />,
    document.getElementById("example")
);