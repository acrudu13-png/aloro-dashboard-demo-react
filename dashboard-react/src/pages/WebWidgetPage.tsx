import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Settings2, Copy, Check, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface WidgetConfig {
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  greeting: string;
  title: string;
  showTranscript: boolean;
}

const colorPresets = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
];

type CallState = 'idle' | 'connecting' | 'connected' | 'ended';

export function WebWidgetPage() {
  const [config, setConfig] = useState<WidgetConfig>({
    primaryColor: '#3b82f6',
    position: 'bottom-right',
    greeting: 'Hello! I\'m your AI assistant. Click the call button to start a voice conversation.',
    title: 'Voice Assistant',
    showTranscript: true,
  });

  const [isWidgetOpen, setIsWidgetOpen] = useState(true);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(true);
  const [copied, setCopied] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: 'user' | 'agent'; text: string; time: string }[]>([
    { speaker: 'agent', text: config.greeting, time: '0:00' },
  ]);
  const [callDuration, setCallDuration] = useState(0);
  const durationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate call duration
  useEffect(() => {
    if (callState === 'connected') {
      durationRef.current = setInterval(() => {
        setCallDuration(d => d + 1);
      }, 1000);
    } else {
      if (durationRef.current) clearInterval(durationRef.current);
      setCallDuration(0);
    }
    return () => {
      if (durationRef.current) clearInterval(durationRef.current);
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    setCallState('connecting');
    setTimeout(() => {
      setCallState('connected');
      setTranscript(prev => [...prev, {
        speaker: 'agent',
        text: 'Hi! Thanks for calling. How can I help you today?',
        time: formatDuration(callDuration + 2),
      }]);
    }, 1500);
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setTranscript([{ speaker: 'agent', text: config.greeting, time: '0:00' }]);
    }, 1000);
  };

  const getEmbedCode = () => {
    return `<script src="https://cdn.aloro.ai/widget.js"></script>
<script>
  AloroVoice.init({
    orgId: 'your-org-id',
    assistantId: 'your-assistant-id',
    primaryColor: '${config.primaryColor}',
    position: '${config.position}',
    greeting: '${config.greeting}',
    title: '${config.title}',
    showTranscript: ${config.showTranscript}
  });
</script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Voice Widget</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure and preview your embeddable voice AI widget</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Customization Panel */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Widget Configuration
            </h2>
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="text-xs text-accent-600 hover:underline"
            >
              {showCustomizer ? 'Hide' : 'Show'}
            </button>
          </div>

          {showCustomizer && (
            <div className="p-4 space-y-5 overflow-hidden">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorPresets.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(c => ({ ...c, primaryColor: color.value }))}
                      className={`w-8 h-8 rounded-lg border-2 transition ${
                        config.primaryColor === color.value
                          ? 'border-slate-800 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={e => setConfig(c => ({ ...c, primaryColor: e.target.value }))}
                    className="w-8 h-8 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Position
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="position"
                      checked={config.position === 'bottom-right'}
                      onChange={() => setConfig(c => ({ ...c, position: 'bottom-right' }))}
                      className="w-4 h-4 text-accent-500"
                    />
                    <span className="text-sm text-slate-600">Bottom Right</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="position"
                      checked={config.position === 'bottom-left'}
                      onChange={() => setConfig(c => ({ ...c, position: 'bottom-left' }))}
                      className="w-4 h-4 text-accent-500"
                    />
                    <span className="text-sm text-slate-600">Bottom Left</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Widget Title
                </label>
                <Input
                  value={config.title}
                  onChange={e => setConfig(c => ({ ...c, title: e.target.value }))}
                />
              </div>

              {/* Greeting */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Greeting Message
                </label>
                <Textarea
                  value={config.greeting}
                  onChange={e => setConfig(c => ({ ...c, greeting: e.target.value }))}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Show Transcript */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.showTranscript}
                  onChange={e => setConfig(c => ({ ...c, showTranscript: e.target.checked }))}
                  className="w-4 h-4 text-accent-500 rounded"
                />
                <span className="text-sm text-slate-700">Show live transcript</span>
              </label>
            </div>
          )}
        </Card>

        {/* Embed Code */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Embed Code</h2>
          </div>
          <div className="p-4">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto font-mono whitespace-pre-wrap">
              {getEmbedCode()}
            </pre>
            <Button
              variant="secondary"
              onClick={copyEmbedCode}
              className="mt-3 w-full"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Demo Widget - positioned fixed */}
      {isWidgetOpen && (
        <div
          className={`fixed bottom-6 ${config.position === 'bottom-right' ? 'right-6' : 'left-6'} w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50`}
          style={{ maxWidth: 'calc(100vw - 3rem)' }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              <span className="font-medium">{config.title}</span>
            </div>
            <button
              onClick={() => setIsWidgetOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-4 bg-slate-50">
            {/* Call State Display */}
            <div className="text-center mb-4">
              {callState === 'idle' && (
                <>
                  <div className="text-sm text-slate-500 mb-2">Ready to call</div>
                  <button
                    onClick={handleStartCall}
                    className="w-16 h-16 rounded-full text-white shadow-lg hover:scale-105 transition flex items-center justify-center mx-auto"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    <Phone className="w-7 h-7" />
                  </button>
                  <div className="text-xs text-slate-400 mt-2">Click to start voice call</div>
                </>
              )}

              {callState === 'connecting' && (
                <>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: config.primaryColor + '20' }}>
                    <div className="w-3 h-3 rounded-full animate-ping" style={{ backgroundColor: config.primaryColor }} />
                  </div>
                  <div className="text-sm text-slate-600">Connecting...</div>
                </>
              )}

              {callState === 'connected' && (
                <>
                  {/* Audio Visualizer */}
                  <div className="flex items-center justify-center gap-1 h-12 mb-2">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 rounded-full transition-all duration-100"
                        style={{
                          backgroundColor: config.primaryColor,
                          height: `${20 + (isMuted ? 0 : Math.random() * 30)}px`,
                          opacity: isMuted ? 0.3 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-lg font-mono text-slate-700 mb-1">{formatDuration(callDuration)}</div>
                  <div className="text-xs text-slate-500">{isMuted ? 'Muted' : 'Listening...'}</div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                        isMuted ? 'bg-red-100 text-red-500' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={handleEndCall}
                      className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </>
              )}

              {callState === 'ended' && (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-2">
                    <PhoneOff className="w-7 h-7 text-slate-400" />
                  </div>
                  <div className="text-sm text-slate-600">Call ended</div>
                </>
              )}
            </div>

            {/* Transcript */}
            {config.showTranscript && callState !== 'idle' && (
              <div className="border-t border-slate-200 pt-3">
                <div className="text-xs font-medium text-slate-500 mb-2">Transcript</div>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {transcript.map((msg, i) => (
                    <div key={i} className={`text-xs ${msg.speaker === 'user' ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block px-2 py-1 rounded ${
                        msg.speaker === 'user' 
                          ? 'bg-slate-200 text-slate-700' 
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Widget Toggle Button (when closed) */}
      {!isWidgetOpen && (
        <button
          onClick={() => setIsWidgetOpen(true)}
          className={`fixed bottom-6 ${config.position === 'bottom-right' ? 'right-6' : 'left-6'} w-14 h-14 rounded-full text-white shadow-lg hover:scale-105 transition z-50 flex items-center justify-center`}
          style={{ backgroundColor: config.primaryColor }}
        >
          <Phone className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
