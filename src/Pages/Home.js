import React, { useEffect, useState } from 'react';
import "./Home.js"

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch('/notes', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.status === 200) {
          setNotes(data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error('An error occurred', err);
      }
    };

    fetchNotes();
  }, []);

  const handleCreateNote = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (response.status === 201) {
        console.log(data.message);
        setNotes([...notes, { title, content }]);
        setTitle('');
        setContent('');
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  };

  const handleEditNote = async (id, updatedNote) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedNote),
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log(data.message);
        const updatedNotes = notes.map((note) =>
          note._id === id ? { ...note, ...updatedNote } : note
        );
        setNotes(updatedNotes);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 200) {
        console.log(data.message);
        const filteredNotes = notes.filter((note) => note._id !== id);
        setNotes(filteredNotes);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('An error occurred', err);
    }
  };

  return (
    <div>
      <h1>Notes</h1>
      <form onSubmit={handleCreateNote}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button type="submit">Create Note</button>
      </form>

      {notes.map((note) => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => handleEditNote(note._id, { title: 'Updated Title', content: 'Updated Content' })}>Edit</button>
          <button onClick={() => handleDeleteNote(note._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Home;
