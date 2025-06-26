import path from 'path';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error('Missing OPENROUTER_API_KEY in .env file');
  process.exit(1);
} else {
  console.log('OpenRouter API key loaded successfully');
}

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const frontendPath = path.join(__dirname, '..', 'webview-ui', 'build');
console.log('📁 Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

interface AskRequestBody {
  prompt: string;
  file?: {
    name: string;
    content: string;
    type?: string;
  };
}


app.post('/ask', function (req: Request<{}, {}, AskRequestBody>, res: Response): Promise<void> {
  return (async () => {
    const { prompt, file } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Invalid prompt' });
      return;
    }

    let fullPrompt = prompt;

    if (file?.name && file?.content) {
      if (file.type?.startsWith('image/')) {
        fullPrompt += `\n\n[Image file: ${file.name} (base64 omitted)]`;
      } else if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        fullPrompt += `\n\n[Binary file: ${file.name} (base64 omitted)]`;
      } else {
        const MAX_LENGTH = 4000;
        const safeText = file.content.slice(0, MAX_LENGTH);
        fullPrompt += `\n\nAttached text file (${file.name}):\n${safeText}`;
      }
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [{ role: 'user', content: fullPrompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.choices?.[0]?.message?.content || ' No reply received';
      res.json({ reply });
    } catch (err: any) {
      console.error('OpenRouter error:', err.response?.data || err.message);
      res.status(500).json({
        error: 'OpenRouter API error',
        detail: err.response?.data || err.message,
      });
    }
  })();
});

const PORT = 5013;
app.listen(PORT, () => {
  console.log(` Backend running on http://localhost:${PORT}`);
});
