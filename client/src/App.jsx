import React from 'react'
import './App.css'
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from 'y-monaco'
import { useRef, useMemo } from 'react'
import * as Y from 'yjs'
// ✅ CORRECT: Use the named export from the main package
import { SocketIOProvider } from 'y-socket.io';

const App = () => {

  const editorRef = useRef(null);

//ydoc is a Yjs document that represents the shared state of the collaborative editing session. It is used to store the content of the editor and synchronize it across all connected clients. The ytext variable is a Yjs text type that is associated with the "monaco" key in the Yjs document, allowing us to bind it to the Monaco editor instance for real-time collaboration...yjs changes ko compare krti hai aur unko merge krti hai taki multiple users ke edits ko synchronize kiya ja sake bina kisi conflict ke. Yjs document mein changes ko track kiya jata hai aur jab koi user edit karta hai, to wo changes automatically sabhi connected clients ke paas reflect hote hain, ensuring a seamless collaborative editing experience.
  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  //MonacoBinding( ki helps se yjs, monaco editor se connect huta hai...fr editor mein jo b edit hoga wo yjs document mein bhi reflect hoga yani bai connected users k pass b show ho ga..jo jo server se connect hain) is a class that binds a Yjs document to a Monaco editor instance, allowing for real-time collaborative editing. It takes care of synchronizing the editor's content with the Yjs document and handling conflicts that may arise when multiple users are editing the same document simultaneously.

  //nechy monacobinding perform kr rhy..setup of monacobinding with yjs and socket.io provider
  const handlemount = (editor) => {
    editorRef.current = editor;

    //server or user k drmian connection establish krne k liye socket.io provider ka use kr rhe hai..jo ki yjs document ko server ke sath synchronize krta hai taki multiple users ke edits ko real-time mein reflect kiya ja sake. SocketIOProvider is a class that provides a WebSocket connection to a Yjs document, allowing for real-time synchronization of changes across multiple clients. It takes care of establishing the connection, handling updates, and ensuring that all connected clients stay in sync with the shared document. 
    const provider  = new SocketIOProvider("http://localhost:3001", "monaco", ydoc, { autoConnect: true });

    const monacoBinding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )
  }


  return (
   <main className='h-screen w-full bg-gray-950 flex gap-4 p-4'>

    <aside className='h-full w-1/4 bg-gray-800 rounded-lg'>
    </aside>
    <section className='h-full w-3/4 bg-gray-700 rounded-lg'>

    <Editor
      height="100%"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      theme="vs-dark"
      onMount={handlemount}
    />

    </section>
   </main>
  )
}

export default App














