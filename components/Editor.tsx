import Styles from './styles/Editor.module.scss';
import React, { createRef } from 'react';
import Editor from '@monaco-editor/react';
const tempCode = [
  'local sketch = Sketch.createSketch("test");',
  '-- Create Sketch',
  'local sketch = Sketch.createLine(0, 0, 0, 10, 0, 0, sketch);',
  'local sketch = Sketch.createLine(10, 0, 0, 10, 0, 10, sketch);',
  'local sketch = Sketch.createLine(0, 0, 10, 10, 0, 10, sketch);',
  'local sketch = Sketch.createLine(0, 0, 0, 0, 0, 10, sketch);',
  '-- Extrude Sketch',
].join('\n');
export default class EditorPanel extends React.Component {
  // TODO: Properly Type this
  public editorRef: any;
  state = {
    value: tempCode
  }
  constructor(props: {}) {
    super(props);
    this.editorRef = null;
  }
  componentDidMount() {
    if (window != undefined) {
      this.setState({
        value: localStorage.getItem('editorValue')
      })
    }
  }
  render() {
    // Render Ui
    return (
      <section className={Styles.container}>
        <Editor
          theme="vs-dark"
          defaultLanguage="lua"
          defaultValue={this.state.value} 
          onMount={(_editor) => this.editorRef  = _editor}
          onChange={(value) => {
            if (typeof value == 'string') 
              localStorage.setItem('editorValue', value)
          }}
        />
      </section>
    );
  }
}