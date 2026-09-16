import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  SendHorizontal,
  RefreshCw,
  FileCheck,
  Volume2,
  VolumeX,
  Edit3
} from 'lucide-react';
import {
  commandCenterService
} from '../../../services/commandCenterService';
import {
  AgentMessage,
  AgentActionProposal,
  AgentCallableIntent
} from '../../../types';

interface AgenticAssistantPanelProps {
  onActionExecuted?: (actionType: string) => void;
}

export const AgenticAssistantPanel: React.FC<AgenticAssistantPanelProps> = ({
  onActionExecuted
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello Rajesh. I am your Command Center Agentic Assistant. You can speak or type commands like:\n- "Cancel my class, I\'m unwell"\n- "Start my 10:15 lecture"\n- "Draft announcement for Sec A on lab viva"\n- "Show me student doubt report"',
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Web Speech Synthesis (TTS)
  const handleSpeak = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`\-\[\]]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);
    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Update proposal parameter before confirmation
  const handleUpdateProposalParam = (msgId: string, paramKey: string, newValue: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.actionProposal) {
          return {
            ...m,
            actionProposal: {
              ...m.actionProposal,
              parsedParameters: {
                ...m.actionProposal.parsedParameters,
                [paramKey]: newValue
              }
            }
          };
        }
        return m;
      })
    );
  };

  // Setup Web Speech API STT
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded, isLoading]);

  // Offline / rule-based fallback intent extraction
  const extractIntentsOffline = (input: string): { reply: string; proposal: AgentActionProposal | null; isReadonly: boolean } => {
    const msg = input.toLowerCase().trim();
    const detected: AgentCallableIntent[] = [];
    const params: Record<string, any> = {};
    let requiresConfirm = false;
    let reply = '';
    let isReadonly = false;

    // Bundled cancel_class + mark_leave
    const mentionsCancel = /\bcancel\b|\bpostpone\b|\bcall off\b/i.test(msg);
    const mentionsLeave = /\bleave\b|\bunwell\b|\bsick\b|\bill\b|\bfever\b/i.test(msg);

    if (mentionsCancel && mentionsLeave) {
      detected.push('cancel_class', 'mark_leave');
      requiresConfirm = true;
      params.subjectCode = 'ME-102';
      params.slot = '10:15 AM (ME-102 Sec B)';
      params.date = new Date().toISOString().split('T')[0];
      params.reason = msg.includes('unwell') ? 'Faculty unwell' : 'Medical emergency';
      reply = `I have detected two related actions: cancelling your class and submitting a medical leave request. Review and confirm below.`;
    } else if (mentionsCancel) {
      detected.push('cancel_class');
      requiresConfirm = true;
      params.subjectCode = 'ME-102';
      params.slot = 'Upcoming session';
      params.reason = 'Faculty administrative cancellation';
      reply = `I have drafted an order to cancel the class. Confirmation required.`;
    } else if (mentionsLeave) {
      detected.push('mark_leave');
      requiresConfirm = true;
      params.date = new Date().toISOString().split('T')[0];
      params.reason = 'Casual / Personal Leave';
      reply = `I have drafted a leave application. Confirmation required.`;
    } else if (/\bstart\b|\bbegin\b/i.test(msg) && /\bclass\b|\blecure\b/i.test(msg)) {
      detected.push('start_class');
      requiresConfirm = true;
      params.slotId = 'cc-slot-2';
      params.subjectCode = 'ME-102';
      reply = `Ready to start session for ME-102. Confirm to open attendance ledger.`;
    } else if (/\bschedule\b|\bmeeting\b/i.test(msg)) {
      detected.push('schedule_meeting');
      requiresConfirm = true;
      params.title = 'Faculty Department Review';
      params.date = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      reply = `Meeting drafted. Please confirm parameters.`;
    } else if (/\bannouncement\b|\bbroadcast\b|\bnotify\b/i.test(msg)) {
      detected.push('draft_announcement');
      requiresConfirm = true;
      params.title = 'Class Notice regarding lab observation';
      params.sections = ['Sec A', 'Sec B'];
      params.message = input.replace(/^(draft announcement|post announcement|broadcast|notify students)\s*:?/i, '').trim() || 'Please check the uploaded study materials before tomorrow.';
      reply = `I have drafted an announcement for your classes. Review and confirm.`;
    } else if (/\bdoubt\b|\bmisconception\b|\breport\b/i.test(msg)) {
      detected.push('generate_doubt_report');
      isReadonly = true;
      reply = `**Doubt Analytics Summary**:
- **High Urgency**: *Clausius Inequality* (35 doubts). Core misconception: students confuse path-dependent boundary work with state entropy.
- **Moderate Urgency**: *Atmospheric Inversion* (26 doubts). Core misconception: students assume pressure decreases imply buoyant dispersion at night.
- **Low Urgency**: *Hessian Matrix Extrema* (13 doubts). Testing required on saddle boundary paths.`;
    } else if (/\bsummarize\b|\bstudent\b|\baarav\b/i.test(msg)) {
      detected.push('summarize_student');
      isReadonly = true;
      reply = `**Student Profile: Aarav Sharma (2026-ENG-001 - Sec A)**
- **Study Hours**: 28.5 hrs (Top 10%)
- **Questions Solved**: 142 drills
- **Doubts Logged**: 11
- **Growth Velocity**: +14.8% trajectory
- **Recommendation**: Mastery in Inversion Models is solid; ready for advanced numericals.`;
    } else if (/\bsync\b/i.test(msg) && /\battendance\b/i.test(msg)) {
      detected.push('sync_attendance');
      isReadonly = true;
      reply = `Attendance records successfully reconciled with BMU ERP Turnstile server. All 4 periods verified.`;
    } else {
      reply = `Command received: "${input}". You can ask me to cancel classes, mark leave, start sessions, broadcast notices, or summarize doubt reports.`;
    }

    let proposal: AgentActionProposal | null = null;
    if (requiresConfirm) {
      proposal = {
        id: `prop-${Date.now()}`,
        intents: detected,
        parsedParameters: params,
        description: `Action: ${detected.join(' + ')}`,
        requiresConfirmation: true,
        status: 'pending_confirmation'
      };
    }

    return { reply, proposal, isReadonly };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend || inputText;
    if (!raw.trim() || isLoading) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: raw.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: raw.trim(),
          teacherContext: { teacherId: 'prof.rajesh' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: AgentMessage = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Action processed.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionProposal: data.actionProposal || undefined,
          isReadonlyResult: data.isReadonlyResult,
          resultData: data.resultData
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Server agent response non-OK');
      }
    } catch (err) {
      console.warn('Using offline rule-based agent extraction:', err);
      const offline = extractIntentsOffline(raw);
      const assistantMsg: AgentMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: offline.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionProposal: offline.proposal || undefined,
        isReadonlyResult: offline.isReadonly
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execution of confirmed write proposal
  const handleConfirmAction = (proposal: AgentActionProposal, msgId: string) => {
    const res = commandCenterService.executeAgentAction(proposal);

    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.actionProposal) {
          return {
            ...m,
            actionProposal: {
              ...m.actionProposal,
              status: 'executed',
              executedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              resultSummary: res.message
            }
          };
        }
        return m;
      })
    );

    if (onActionExecuted) {
      onActionExecuted(proposal.intents.join(','));
    }
  };

  const handleDismissAction = (msgId: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id === msgId && m.actionProposal) {
          return {
            ...m,
            actionProposal: {
              ...m.actionProposal,
              status: 'dismissed'
            }
          };
        }
        return m;
      })
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. Collapsed Command Bar Pill */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#181D24] hover:bg-[#1E252D] border border-[#26303B] shadow-2xl text-xs font-semibold text-[#E2E8F0] transition-all cursor-pointer font-['Sora'] group ring-1 ring-[#6EA8A0]/30"
        >
          <div className="w-6 h-6 rounded-lg bg-[#6EA8A0]/15 flex items-center justify-center text-[#6EA8A0] shrink-0">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span>Command Assistant</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#12161A] text-[#6EA8A0] border border-[#26303B]">
            Online
          </span>
          <ChevronUp className="w-4 h-4 text-[#94A3B8] group-hover:text-[#E2E8F0] ml-1" />
        </button>
      )}

      {/* 2. Expanded Floating Command Center Panel */}
      {isExpanded && (
        <div className="w-[380px] sm:w-[440px] h-[520px] rounded-2xl bg-[#181D24] border border-[#26303B] shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
          {/* Header */}
          <div className="p-4 border-b border-[#26303B] bg-[#12161A] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#6EA8A0]/15 border border-[#6EA8A0]/30 flex items-center justify-center text-[#6EA8A0]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#E2E8F0] font-['Sora']">
                  Agentic Command Bar
                </h3>
                <span className="text-[10px] text-[#94A3B8] font-mono block">
                  Callable tool loop with write confirmation
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#181D24] transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Messages History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              const proposal = msg.actionProposal;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl border leading-relaxed ${
                      isUser
                        ? 'bg-[#1E252D] border-[#26303B] text-[#E2E8F0]'
                        : 'bg-[#12161A] border-[#26303B] text-[#94A3B8]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#26303B]/60">
                      {!isUser ? (
                        <button
                          type="button"
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className="text-[10px] font-mono text-[#6EA8A0] hover:text-[#5D968E] flex items-center gap-1 cursor-pointer transition-colors"
                          title={speakingMsgId === msg.id ? 'Stop audio' : 'Listen with Speech Synthesis'}
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-[#C46859]" />
                              <span className="text-[#C46859]">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      ) : <span />}
                      <span className="text-[9px] font-mono text-[#94A3B8]/60">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* PARSED CONFIRMATION CARD (For any write intent: schedule, cancel, mark leave, post announcement) */}
                  {proposal && (
                    <div className="w-[90%] mt-2.5 p-3.5 rounded-xl bg-[#12161A] border border-[#D9A566]/40 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#D9A566] font-['Sora']">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Confirm Action Execution</span>
                      </div>

                      {/* Bundled Intent Badges */}
                      <div className="flex flex-wrap gap-1">
                        {proposal.intents.map(intent => (
                          <span
                            key={intent}
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#D9A566]/15 text-[#D9A566] border border-[#D9A566]/30"
                          >
                            {intent.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      {/* Parsed Parameters Breakdown (Editable before Execution) */}
                      <div className="p-2.5 rounded-lg bg-[#181D24] border border-[#26303B] text-[11px] font-mono space-y-2 text-[#E2E8F0]">
                        <div className="flex items-center justify-between text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3 h-3 text-[#6EA8A0]" />
                            <span>Action Parameters</span>
                          </span>
                          {proposal.status === 'pending_confirmation' && (
                            <span className="text-[9px] text-[#6EA8A0] lowercase font-normal">
                              editable before execution
                            </span>
                          )}
                        </div>
                        {Object.entries(proposal.parsedParameters).map(([key, val]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-[#94A3B8] font-semibold">{key}</span>
                            <input
                              type="text"
                              value={Array.isArray(val) ? val.join(', ') : String(val ?? '')}
                              disabled={proposal.status !== 'pending_confirmation'}
                              onChange={e => handleUpdateProposalParam(msg.id, key, e.target.value)}
                              className="px-2 py-1 bg-[#12161A] border border-[#26303B] rounded text-xs text-[#E2E8F0] focus:outline-none focus:border-[#6EA8A0] disabled:opacity-60"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Confirmation & Dismiss Controls */}
                      {proposal.status === 'pending_confirmation' ? (
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleDismissAction(msg.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#181D24] cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleConfirmAction(proposal, msg.id)}
                            className="px-3 py-1 rounded-lg bg-[#6EA8A0] hover:bg-[#5D968E] text-[#12161A] text-[11px] font-semibold cursor-pointer font-['Sora']"
                          >
                            Confirm & Execute
                          </button>
                        </div>
                      ) : proposal.status === 'executed' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#6EA8A0] font-mono pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Executed: {proposal.resultSummary}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#94A3B8] italic pt-1">
                          Action dismissed by user.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#6EA8A0]" />
                <span>Parsing command & verifying callable tools...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Fast Quick Actions Chips */}
          <div className="px-3 py-1.5 border-t border-[#26303B] bg-[#12161A] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px] font-mono">
            <button
              onClick={() => handleSendMessage("Cancel my class, I'm unwell")}
              className="px-2 py-1 rounded bg-[#181D24] hover:bg-[#1E252D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] whitespace-nowrap cursor-pointer"
            >
              Cancel class + sick leave
            </button>
            <button
              onClick={() => handleSendMessage('Start ME-102 lecture')}
              className="px-2 py-1 rounded bg-[#181D24] hover:bg-[#1E252D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] whitespace-nowrap cursor-pointer"
            >
              Start ME-102
            </button>
            <button
              onClick={() => handleSendMessage('Show me student doubt report')}
              className="px-2 py-1 rounded bg-[#181D24] hover:bg-[#1E252D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] whitespace-nowrap cursor-pointer"
            >
              Doubt report
            </button>
            <button
              onClick={() => handleSendMessage('Summarize Aarav Sharma progress')}
              className="px-2 py-1 rounded bg-[#181D24] hover:bg-[#1E252D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] whitespace-nowrap cursor-pointer"
            >
              Student summary
            </button>
            <button
              onClick={() => handleSendMessage('Schedule tutorial tomorrow at 4 PM for Sec B')}
              className="px-2 py-1 rounded bg-[#181D24] hover:bg-[#1E252D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] whitespace-nowrap cursor-pointer"
            >
              Schedule tutorial
            </button>
            <button
              onClick={() => handleSendMessage('Draft announcement for Sec A on lab report submission due Friday')}
              className="px-2 py-1 rounded bg-[#181D24] hover:bg-[#1E252D] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#26303B] whitespace-nowrap cursor-pointer"
            >
              Post notice
            </button>
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-[#26303B] bg-[#12161A]">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Input Mic */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isListening
                    ? 'bg-[#C46859]/20 border-[#C46859] text-[#C46859] animate-pulse'
                    : 'bg-[#181D24] border-[#26303B] text-[#94A3B8] hover:text-[#E2E8F0]'
                }`}
                title={isListening ? 'Listening... click to stop' : 'Click to speak'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ask assistant or give command..."
                className="flex-1 px-3 py-2 bg-[#181D24] border border-[#26303B] rounded-xl text-xs text-[#E2E8F0] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#6EA8A0]"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-2 rounded-xl bg-[#6EA8A0] hover:bg-[#5D968E] disabled:opacity-40 text-[#12161A] cursor-pointer"
              >
                <SendHorizontal className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
