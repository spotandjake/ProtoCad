import { decorateFunction, LuaFactory } from 'wasmoon';
import { Terminal } from 'xterm';
import { type Dispatch, type SetStateAction } from 'react'
import SDK from '../SDK';
import API from '../Backend';
// Run
export default async (code: string, terminal: Terminal, setScene: Dispatch<SetStateAction<THREE.Object3D[]>>): Promise<boolean> => {
  // Clear Scene
  setScene([]);
  // Create LuaFactory
  const factory = new LuaFactory('./lua.wasm');
  const lua = await factory.createEngine()
  // Try and run the code
  try {
    // Language Bindings
    lua.global.set('print', decorateFunction((thread, argsQuantity) => {
      const values = [];
      for (let i = 1; i <= argsQuantity; i++) {
        values.push(thread.index.ToString(i));
      }
      terminal.writeln(values.join('\t'));
    }, {
      receiveArgsQuantity: true,
      receiveThread: true
    }));
    // Create The Host Bindings
    const sdk = API(setScene);
    // TODO: Create Our Hierarchy on the side
    for (const nameSpace of Object.keys(sdk)) {
      //@ts-ignore
      lua.global.set(nameSpace, sdk[nameSpace]);
    }
    // Run The Code
    await lua.doString(code);
    // Close The Vm
    lua.global.close();
    // Return The Result
    return true;
  } catch (err: any) {
    // Write The Error
    if (err.hasOwnProperty('message') && typeof err.message == 'string') {
      terminal.writeln(err.message);
    } else {
      terminal.writeln('Unknown Error');
    }
    // Close The Vm
    lua.global.close();
    // Return Fail
    return false;
  }
}