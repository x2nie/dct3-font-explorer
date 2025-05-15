import './style.scss'
import { loadFile, mount, reactive, whenReady } from '@odoo/owl'
import App from './App'

whenReady(async function () {

  const [templates, cpp_content] = await Promise.all([
    loadFile("templates.xml"),

    loadFile("examples/dev5-edt-text.cpp"),
  ])

  const env = {
    doc: reactive({
          fonts: [], 
          })
  }

  mount(App, document.body, { 
      env, 
      templates, 
      // 'debug': true,
      //props: {...}, templates: "..."}
  });
  
})

