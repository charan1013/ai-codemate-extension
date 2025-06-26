import { useRef, useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [chat, setChat] = useState<
    { type: 'user' | 'ai'; text: string; fileName?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFileSending, setIsFileSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    const hasFileMention = prompt.includes('@');
    if (hasFileMention && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      await sendToBackend({ prompt });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileSending(true);

    const isTextFile = file.type.startsWith('text/');
    const isImage = file.type.startsWith('image/');
    const isPdfOrDoc = file.type === 'application/pdf' || file.name.endsWith('.docx');

    const reader = new FileReader();

    reader.onload = async () => {
      let fileContent = '';
      if (isTextFile || isImage || isPdfOrDoc) {
        fileContent = reader.result as string;
      }

      const fileData = {
        name: file.name,
        content: fileContent,
        type: file.type,
      };

      await sendToBackend({ prompt, file: fileData });
      setIsFileSending(false);
    };

    if (isImage || isPdfOrDoc) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const sendToBackend = async ({
    prompt,
    file,
  }: {
    prompt: string;
    file?: { name: string; content: string; type?: string };
  }) => {
    setChat((prev) => [
      ...prev,
      { type: 'user', text: prompt, fileName: file?.name },
    ]);
    setPrompt('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5012/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, file }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setChat((prev) => [...prev, { type: 'ai', text: data.reply }]);
    } catch (err) {
      setError('⚠ Unable to contact AI backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>🤖 AI Codemate</h1>

      <div className="chat-window">
        {chat.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.type}`}>
            <div>{msg.text}</div>
            {msg.fileName && (
              <div className="file-info">
                📎 File sent: <strong>{msg.fileName}</strong>
              </div>
            )}
          </div>
        ))}
      </div>

      <textarea
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt or @filename..."
        className="user-message"
      />
      <br />
      <button onClick={sendPrompt} disabled={loading || !prompt}>
        {loading ? (isFileSending ? 'Sending file...' : 'Thinking...') : 'Ask AI'}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default App;
