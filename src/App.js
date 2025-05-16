import { Component, xml } from "@odoo/owl";
import { DropZone } from "./components/dropzone";
import { FontExplorer } from "./components/FontExplorer";

export default class App extends Component {
    static template = "App"
    static components = {DropZone, FontExplorer}
}