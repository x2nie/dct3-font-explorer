import { Component, xml } from "@odoo/owl";
import { DropZone } from "./components/dropzone";

export default class App extends Component {
    static template = "App"
    static components = {DropZone}
}