
import React, { useRef, useMemo, useState, useEffect } from 'react';
import './App.css';
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from 'y-monaco';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';

const App = () => {
  const [name, setName] = useState(() => {
    return new URLSearchParams(window.location.search).get("name") || "";
  });

  const [users, setUsers] = useState([]);
  const editorRef = useRef(null);


  //ydoc is a Yjs document that represents the shared state of the collaborative editing session. It is used to store the content of the editor and synchronize it across all connected clients. The ytext variable is a Yjs text type that is associated with the "monaco" key in the Yjs document, allowing us to bind it to the Monaco editor instance for real-time collaboration...yjs changes ko compare krti hai aur unko merge krti hai taki multiple users ke edits ko synchronize kiya ja sake bina kisi conflict ke. Yjs document mein changes ko track kiya jata hai aur jab koi user edit karta hai, to wo changes automatically sabhi connected clients ke paas reflect hote hain, ensuring a seamless collaborative editing experience.
  const ydoc = useMemo(() => new Y.Doc(), []);
  const ytext = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  // 1. Move the provider out of useEffect using useMemo so handlemount can access it.
  // We set autoConnect to false so we can manually connect when the user enters a name.
   //server or user k drmian connection establish krne k liye socket.io provider ka use kr rhe hai..jo ki yjs document ko server ke sath synchronize krta hai taki multiple users ke edits ko real-time mein reflect kiya ja sake. SocketIOProvider is a class that provides a WebSocket connection to a Yjs document, allowing for real-time synchronization of changes across multiple clients. It takes care of establishing the connection, handling updates, and ensuring that all connected clients stay in sync with the shared document.
  const provider = useMemo(() => new SocketIOProvider(
    "http://localhost:3001", 
    "monaco", 
    ydoc, 
    { autoConnect: false }
  ), [ydoc]);


    //MonacoBinding( ki helps se yjs, monaco editor se connect huta hai...fr editor mein jo b edit hoga wo yjs document mein bhi reflect hoga yani bai connected users k pass b show ho ga..jo jo server se connect hain) is a class that binds a Yjs document to a Monaco editor instance, allowing for real-time collaborative editing. It takes care of synchronizing the editor's content with the Yjs document and handling conflicts that may arise when multiple users are editing the same document simultaneously.

  //nechy monacobinding perform kr rhy..setup of monacobinding with yjs and socket.io provider
  const handlemount = (editor) => {
    editorRef.current = editor;
          
    // 2. 'provider' is now in scope!
    const monacoBinding = new MonacoBinding(
      ytext,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );
  };

  const handlejoin = (e) => {
    e.preventDefault();
    const enteredName = e.target.name.value;
    setName(enteredName);
     // Handle the logic for joining the collaborative editing session
    // This could involve connecting to a server, initializing the Yjs document, etc.
    
    // Fixed the URL manipulation to properly format the query parameter
    window.history.pushState({ }, '', `/${name}` + e.target.name.value); //window.history.pushState(state, unused, url);change browser's session history stack manually, allowing us to manipulate the URL without causing a page reload. This is useful for single-page applications (SPAs) where we want to change the URL to reflect the current state of the application without triggering a full page refresh. By using pushState, we can update the URL to include parameters or paths that represent the user's session or document they are editing, enhancing the user experience and enabling better navigation within the app.
  };

  useEffect(() => {  
    if (name) {
       // 3. Connect the provider manually now that we have a valid user
       provider.connect();


       //awareness is a feature of Yjs that allows clients to share information about their presence and state in a collaborative editing session. By setting local state fields, clients can communicate information such as their username, cursor position, or other relevant data to other connected clients. This helps enhance the collaborative experience by allowing users to see who else is currently editing the document and providing context for their interactions.
       provider.awareness.setLocalStateField("users", { name });

       const updateUsers = () => {
         const states = Array.from(provider.awareness.getStates().values());
         setUsers(states.filter(state => state.users && state.users.name).map(state => state.users));
       };

       // Set initial users and listen for changes
       updateUsers();
       provider.awareness.on("change", updateUsers);

      //page refresh huny se pehly ye func. chaly ga
       const handleBeforeUnload = () => {
         provider.awareness.setLocalStateField("users", null);
       };

       window.addEventListener("beforeunload", handleBeforeUnload);

       // 4. Proper cleanup to prevent memory leaks or duplicate listeners
       return () => {
         provider.disconnect();
         provider.awareness.off("change", updateUsers);
         window.removeEventListener("beforeunload", handleBeforeUnload);
       };
    }
  }, [name, provider]); // Added provider to the dependency array

  if (!name) {
    return (
      <main className='h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center'>
        <form 
          onSubmit={handlejoin} 
          className='h-1/4 w-1/4 bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-4'
        >
          <input 
            type="text"
            placeholder="Type your Name..."
            className='bg-gray-900 text-white p-2 rounded-lg'
            name='name'
            required
          />
          <button type="submit" className='bg-blue-500 text-white p-2 rounded-lg font-bold'>
            Join
          </button>
        </form>
      </main> 
    );
  }

  return (
   <main className='h-screen w-full bg-gray-950 flex flex-col gap-4 p-4'>
    <header className='h-16 w-full bg-gray-800 rounded-lg flex items-center justify-between p-4'>
      <h1 className='text-white text-4xl font-bold'>Collaborative Editor</h1>
    </header>

    <div className="flex h-full w-full gap-4">
      <aside className='h-full w-1/4 bg-gray-800 rounded-lg'>
        <h2 className='text-white text-2xl font-bold p-4'>Users</h2>
        <ul className='text-white p-4 flex flex-col gap-2'>
          {users.map((user, index) => (
            <li key={index} className='bg-gray-700 p-2 rounded-lg'>
              {user.name}
            </li>
          ))}
        </ul>
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
    </div>
   </main>
  );
}

export default App;









