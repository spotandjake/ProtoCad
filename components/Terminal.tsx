import React, { useRef, useEffect } from 'react';
import Styles from './styles/Terminal.module.scss';
import compileLua from '../Logic/Compilers/Lua';
import XTerm from './Xterm';
import { FitAddon } from 'xterm-addon-fit';
// Prompts
const prompt = "> ";
// Ui
export default (props) => {
  const xtermRef = useRef(null);
  const fitAddon = new FitAddon();
  // useEffect
  useEffect(() => {
    // Call Fit
    fitAddon.fit();
    // Set Theme
    xtermRef.current.terminal.setOption('theme', {
      background: '#1e1e1e'
    });
    // Write Initial Prompt
    xtermRef.current.terminal.write(prompt);
  }, []);
  const commands: string[] = [];
  let command = '';
  let commandIndex = 0;
  // Render Terminal
  return (
    <section
      className={Styles.container}
    >
      <XTerm
        className={Styles.xTerm}
        ref={xtermRef}
        addons={[fitAddon]}
        onKey={async (event, terminal) => {
          if (event.domEvent.key == 'Enter') {
            // Write A New Line
            terminal.writeln('');
            // Call The onCommand
            await props.onCommand(terminal, command);
            commands.push(command);
            if (commands.length > 10) commands.shift();
            // Clear And Write Prompt
            terminal.write(`${prompt}`);
            command = '';
          } else if (event.domEvent.key == 'Backspace') {
            if (command.length > 0) {
              terminal.write('\b \b');
              command = command.slice(0, command.length-1);
            }
          } else if (event.domEvent.key == 'ArrowUp') {
            if (commands.length == 0) return;
            if (commandIndex < commands.length) commandIndex++;
            // Set Prompt
            command = commands[commands.length-commandIndex];
            terminal.write('\x1b[2K\r');  // clear the line
            terminal.write(`${prompt}`);
            terminal.write(command); // write the command
          } else if (event.domEvent.key == 'ArrowDown') {
            if (commands.length == 0) return;
            if (commandIndex >= 0) commandIndex--;
            // Set Prompt
            command = commands[commands.length-commandIndex];
            terminal.write('\x1b[2K\r');  // clear the line
            terminal.write(`${prompt}`);
            terminal.write(command);
          } else if (
            event.domEvent.key == 'ArrowRight' ||
            event.domEvent.key == 'ArrowLeft'
          ) {
            return;
          } else {
            terminal.write(event.key);
            command += event.key;
          }
        }}
      />
    </section>
  )
}