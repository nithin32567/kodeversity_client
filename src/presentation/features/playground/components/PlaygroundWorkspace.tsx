import React, { useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { executeCode } from '../../../../utils/codeExecutor';
import { Play, Loader2, Code2, TerminalSquare, Lightbulb, ChevronRight, Check } from 'lucide-react';

interface PlaygroundWorkspaceProps {
  config: {
    problemDescription: string;
    hints: string[];
    starterCode?: string;
    language: string;
  };
  from?: string;
  fromId?: string;
  onStop?: () => void;
  onMarkComplete?: () => void;
}

export const PlaygroundWorkspace: React.FC<PlaygroundWorkspaceProps> = ({ config, onMarkComplete, onStop }) => {
  const [code, setCode] = useState(config.starterCode || '');
  const [output, setOutput] = useState<{ stdout: string; stderr: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunCode = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const result = await executeCode(config.language, code);
      if (result.run) {
        setOutput({ stdout: result.run.stdout, stderr: result.run.stderr });
      } else {
        setOutput({ stdout: '', stderr: 'Execution returned an unexpected response.' });
      }
    } catch (err: any) {
      setOutput({ stdout: '', stderr: err.response?.data?.message || 'Error executing code.' });
    } finally {
      setLoading(false);
    }
  };

  // Map our language enum to monaco language ids
  const getMonacoLanguage = (lang: string) => {
    const l = lang?.toLowerCase() || 'javascript';
    if (l === 'c++' || l === 'cpp') return 'cpp';
    if (l === 'csharp') return 'csharp';
    if (l === 'js') return 'javascript';
    if (l === 'go') return 'go';
    if (l === 'java') return 'java';
    return l;
  };

  return (
    <Group orientation="horizontal" className="h-full w-full min-h-[600px] border border-border overflow-hidden bg-background text-foreground">
      {/* Left Panel: Prose, Badge, Hints */}
      <Panel defaultSize={35} minSize={25} className="bg-card border-r border-border">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h2 className="text-base font-semibold tracking-wide text-foreground">Problem</h2>
            </div>
            {onStop && (
              <button onClick={onStop} className="text-xs text-muted-foreground hover:text-foreground">
                Exit
              </button>
            )}
          </div>
          <div className="p-5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 text-xs font-bold tracking-wider rounded-md uppercase">
                {config.language}
              </span>
            </div>
            
            <div className="prose prose-invert prose-sm sm:prose-base max-w-none mb-10 text-foreground/90 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: config.problemDescription }} />
            </div>
            
            {config.hints && config.hints.length > 0 && (
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 mb-4 text-amber-500">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">Hints</h3>
                </div>
                {config.hints.map((hint, index) => (
                  <details key={index} className="group border border-border rounded-lg bg-background overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex items-center justify-between p-3 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <span>Hint {index + 1}</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 text-muted-foreground" />
                    </summary>
                    <div className="px-3 pb-3 pt-1 text-sm text-muted-foreground border-t border-border/50 bg-background/50">
                      {hint}
                    </div>
                  </details>
                ))}
              </div>
            )}
            
            {onMarkComplete && (
               <button
                 onClick={onMarkComplete}
                 className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-primary)] hover:scale-[1.02] transition"
               >
                 <Check className="w-4 h-4" /> Mark as Completed
               </button>
            )}
          </div>
        </div>
      </Panel>

      <Separator className="w-1.5 bg-background hover:bg-[var(--accent-cyan)]/50 transition-colors flex items-center justify-center">
        <div className="w-0.5 h-8 bg-border rounded-full" />
      </Separator>

      {/* Right Panel: Editor & Terminal */}
      <Panel defaultSize={65}>
        <Group orientation="vertical">
          <Panel defaultSize={65} minSize={30}>
            <div className="h-full flex flex-col bg-[#1e1e1e]">
              <div className="flex justify-between items-center bg-[#252526] px-4 py-2 border-b border-[#3c3c3c] shadow-sm z-10">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Solution</span>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded text-sm font-semibold shadow disabled:opacity-60 transition-all flex items-center gap-2 active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  {loading ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={getMonacoLanguage(config.language)}
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
                    bracketPairColorization: { enabled: true },
                    formatOnPaste: true,
                  }}
                  loading={
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                  }
                />
              </div>
            </div>
          </Panel>

          <Separator className="h-1.5 bg-background hover:bg-[var(--accent-cyan)]/50 transition-colors flex items-center justify-center">
            <div className="w-8 h-0.5 bg-border rounded-full" />
          </Separator>

          <Panel defaultSize={35} minSize={20}>
            <div className="h-full bg-black flex flex-col">
              <div className="bg-[#141414] px-4 py-2 flex items-center gap-2 border-b border-[#3c3c3c]">
                <TerminalSquare className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Output</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap selection:bg-blue-500/30">
                {output ? (
                  <>
                    {output.stderr && <div className="text-red-400">{output.stderr}</div>}
                    {output.stdout && <div className="text-gray-300">{output.stdout}</div>}
                    {!output.stdout && !output.stderr && <div className="text-gray-500 italic">Program exited successfully with no output.</div>}
                  </>
                ) : (
                  <div className="text-gray-600 flex flex-col items-center justify-center h-full gap-2">
                    <TerminalSquare className="w-8 h-8 opacity-20" />
                    <p>Click "Run Code" to see the output here...</p>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </Group>
      </Panel>
    </Group>
  );
};
