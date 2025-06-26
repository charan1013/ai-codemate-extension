import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('aiCodemate.start', async () => {
    const panel = vscode.window.createWebviewPanel(
      'aiCodemate',
      'AI Codemate',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'webview-ui', 'build'))]
      }
    );

    const buildPath = path.join(context.extensionPath, 'webview-ui', 'build');
    const indexPath = path.join(buildPath, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    html = html.replace(/(src|href)="(.+?)"/g, (_, attr, src) => {
      if (src.startsWith('http')) return `${attr}="${src}"`;
      const filePath = vscode.Uri.file(path.join(buildPath, src));
      const webviewUri = panel.webview.asWebviewUri(filePath);
      return `${attr}="${webviewUri}"`; 
    });
const backendUrl = await vscode.env.asExternalUri(vscode.Uri.parse('http://localhost:5013'));
html = html.replace('</head>', `<script>window.BACKEND_URL="${backendUrl.toString()}";</script></head>`);


    panel.webview.html = html;
  });

  context.subscriptions.push(disposable);
  
}
