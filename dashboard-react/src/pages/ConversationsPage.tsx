import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Search, Bot, CheckCircle, AlertTriangle,
  Clock, User, Zap, Database, ArrowRight, ChevronLeft, Filter,
  Play, Pause, Volume2, Mic,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';

// ── Types ─────────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant' | 'event';
type MessageType = 'text' | 'audio';
type ConversationStatus = 'resolved' | 'escalated' | 'active' | 'waiting';
type ResolutionType = 'auto-resolved' | 'human-escalated' | 'after-hours' | 'pending' | 'redirected';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  type?: MessageType;
  toolCall?: { name: string; result: string };
  // Audio-specific fields
  audioUrl?: string;
  audioDuration?: number; // in seconds
  transcription?: string;
  transcriptionConfidence?: number; // 0-100
  transcriberProvider?: 'soniox' | 'deepgram' | 'whisper' | 'google';
}

interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  agentName: string;
  flowName: string;
  status: ConversationStatus;
  resolution: ResolutionType;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  ticketId?: string;
  systemTarget?: string;
  messages: Message[];
}

// ── Demo Audio Data ───────────────────────────────────────────────────────────

// Demo audio messages with transcriptions
const demoAudioMessages: Record<string, { transcription: string; duration: number; confidence: number; provider: string }> = {
  'audio-1': {
    transcription: 'Bună ziua, am o problemă cu terminalul POS. Nu pot procesa plățile de aproximativ 15 minute. Este foarte urgent pentru că avem clienți care așteaptă.',
    duration: 12,
    confidence: 96,
    provider: 'soniox',
  },
  'audio-2': {
    transcription: 'Da, terminalele funcționează din nou. Vă mulțumesc foarte mult pentru ajutor! A fost foarte rapid.',
    duration: 6,
    confidence: 98,
    provider: 'soniox',
  },
  'audio-3': {
    transcription: 'Display-ul din bucătărie nu arată comenzile noi. Totul funcționa bine dimineață, dar acum nu se actualizează.',
    duration: 8,
    confidence: 94,
    provider: 'deepgram',
  },
  'audio-4': {
    transcription: 'Am găsit setarea. Spune sincronizare manuală. Ce trebuie să fac acum?',
    duration: 5,
    confidence: 97,
    provider: 'soniox',
  },
  'audio-5': {
    transcription: 'Sistemul de inventar este blocat de două ore. Nu putem face verificări de stoc sau să trimitem comenzi către furnizori.',
    duration: 9,
    confidence: 95,
    provider: 'whisper',
  },
  'audio-6': {
    transcription: 'Am nevoie urgent de rezolvare. Avem serviciu prânz și nu putem gestiona stocurile.',
    duration: 5,
    confidence: 93,
    provider: 'soniox',
  },
};

// ── Demo data ─────────────────────────────────────────────────────────────────

const conversations: Conversation[] = [
  // 1. POS system down — restarted, resolved (with audio messages)
  {
    id: 'conv-1',
    customerName: 'Adrian Popescu',
    customerPhone: '+40 721 234 567',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul de Suport Tehnic',
    status: 'resolved',
    resolution: 'auto-resolved',
    startedAt: '2026-03-24T09:14:00Z',
    lastMessageAt: '2026-03-24T09:31:00Z',
    messageCount: 14,
    ticketId: 'TKT-10482',
    systemTarget: 'Sistem POS',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '09:14' },
      { 
        id: 'm2', 
        role: 'user', 
        content: '[Mesaj vocal]',
        timestamp: '09:15',
        type: 'audio',
        audioUrl: 'audio-1',
        audioDuration: demoAudioMessages['audio-1'].duration,
        transcription: demoAudioMessages['audio-1'].transcription,
        transcriptionConfidence: demoAudioMessages['audio-1'].confidence,
        transcriberProvider: demoAudioMessages['audio-1'].provider as 'soniox',
      },
      { id: 'm3', role: 'assistant', content: 'Inteleg, suna critic. Lasă-mă să verific imediat contul tau. Poti furniza numele restaurantului sau emailul?', timestamp: '09:15' },
      { id: 'm4', role: 'user', content: 'Restaurant Popescu, adrian@restaurantpopescu.ro', timestamp: '09:16' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Căutare Client (CRM) → Gasit: Adrian Popescu, Restaurant Popescu, Plan: Enterprise', timestamp: '09:16', toolCall: { name: 'Căutare Client', result: 'Client gasit: Adrian Popescu · Restaurant Popescu · Plan: Enterprise' } },
      { id: 'm6', role: 'assistant', content: 'Te-am gasit, Adrian. Am identificat problema cu Sistemul POS. Lasă-mă sa deschid un tichet de suport și sa verific starea sistemului imediat.', timestamp: '09:17' },
      { id: 'm7', role: 'event', content: 'Apel instrument: Creare Tichet (Oracle RightNow) → TKT-10482 creat, Prioritate: Urgent', timestamp: '09:17', toolCall: { name: 'Creare Tichet', result: 'Tichet TKT-10482 creat · Prioritate: Urgent' } },
      { id: 'm8', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → Sistem POS: INACTIV (ultima vizionare: 09:02 UTC)', timestamp: '09:17', toolCall: { name: 'Verificare Stare Sistem', result: 'Sistem POS: INACTIV · Ultima vizionare: 09:02 UTC' } },
      { id: 'm9', role: 'assistant', content: 'Vad că serviciul POS este inactiv din 09:02 UTC. Voi încerca o repornire automata acum. Aceasta ar trebui sa dureze aproximativ 30-60 de secunde.', timestamp: '09:18' },
      { id: 'm10', role: 'event', content: 'Apel instrument: Repornire Serviciu → Repornire initiata pentru POS', timestamp: '09:18', toolCall: { name: 'Repornire Serviciu', result: 'Repornire initiata · Estimat: 45 secunde' } },
      { id: 'm11', role: 'assistant', content: 'Repornirea este in curs... voi verifica starea in 30 de secunde.', timestamp: '09:19' },
      { id: 'm12', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → Sistem POS: ACTIV (timp activitate: 0m 28s)', timestamp: '09:19', toolCall: { name: 'Verificare Stare Sistem', result: 'Sistem POS: ACTIV · Timp activitate: 28s' } },
      { id: 'm13', role: 'assistant', content: 'Vești bune! Sistemul POS este din nou online. Te rog sa incerci o tranzactie de test pe terminalele tale. Totul arata bine?', timestamp: '09:20' },
      { 
        id: 'm14', 
        role: 'user', 
        content: '[Mesaj vocal]',
        timestamp: '09:21',
        type: 'audio',
        audioUrl: 'audio-2',
        audioDuration: demoAudioMessages['audio-2'].duration,
        transcription: demoAudioMessages['audio-2'].transcription,
        transcriptionConfidence: demoAudioMessages['audio-2'].confidence,
        transcriberProvider: demoAudioMessages['audio-2'].provider as 'soniox',
      },
      { id: 'm15', role: 'event', content: 'Apel instrument: Actualizare Stare Tichet → TKT-10482 inchis ca Rezolvat', timestamp: '09:21', toolCall: { name: 'Actualizare Stare Tichet', result: 'TKT-10482 → Rezolvat' } },
      { id: 'm16', role: 'assistant', content: 'Perfect! Tichetul TKT-10482 a fost inchis ca rezolvat. Multumesc ca ai contactat suportul Horeca, Adrian. Sa ai o zi buna!', timestamp: '09:21' },
    ],
  },

  // 2. Kitchen display not showing orders — resolved with KB guidance (with audio)
  {
    id: 'conv-2',
    customerName: 'Mihaela Constantinescu',
    customerPhone: '+40 722 345 678',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul de Suport Tehnic',
    status: 'resolved',
    resolution: 'auto-resolved',
    startedAt: '2026-03-24T11:42:00Z',
    lastMessageAt: '2026-03-24T12:08:00Z',
    messageCount: 18,
    ticketId: 'TKT-10491',
    systemTarget: 'Display Bucatarie',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '11:42' },
      { 
        id: 'm2', 
        role: 'user', 
        content: '[Mesaj vocal]',
        timestamp: '11:43',
        type: 'audio',
        audioUrl: 'audio-3',
        audioDuration: demoAudioMessages['audio-3'].duration,
        transcription: demoAudioMessages['audio-3'].transcription,
        transcriptionConfidence: demoAudioMessages['audio-3'].confidence,
        transcriberProvider: demoAudioMessages['audio-3'].provider as 'deepgram',
      },
      { id: 'm3', role: 'assistant', content: 'Pare a fi o problema de sincronizare afisajului. Lasă-mă sa gasesc contul tau. Care e emailul sau numele restaurantului?', timestamp: '11:43' },
      { id: 'm4', role: 'user', content: 'Restaurant Constantinescu, mihaela@restaurantconstantinescu.ro', timestamp: '11:44' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Căutare Client (CRM) → Gasit: Mihaela Constantinescu, Restaurant Constantinescu', timestamp: '11:44', toolCall: { name: 'Căutare Client', result: 'Client gasit: Mihaela Constantinescu · Restaurant Constantinescu · Plan: Professional' } },
      { id: 'm6', role: 'event', content: 'Apel instrument: Creare Tichet (Oracle RightNow) → TKT-10491 creat, Prioritate: Inalta', timestamp: '11:45', toolCall: { name: 'Creare Tichet', result: 'Tichet TKT-10491 creat · Prioritate: Inalta' } },
      { id: 'm7', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → Display Bucatarie: ACTIV (timp activitate: 14h 22m)', timestamp: '11:45', toolCall: { name: 'Verificare Stare Sistem', result: 'Display Bucatarie: ACTIV · Timp activitate: 14h 22m' } },
      { id: 'm8', role: 'assistant', content: 'Serviciul displayului functioneaza, deci pare a fi o problema de configuratie sau sincronizare de retea. Lasă-mă sa te ghidez prin cateva pasi de diagnostic.', timestamp: '11:46' },
      { id: 'm9', role: 'assistant', content: 'Intai, verifica pe tableta displayului: du-te la Setari → Display Config → si spune-mi la ce este setat "Mod Sincronizare".', timestamp: '11:47' },
      { 
        id: 'm10', 
        role: 'user', 
        content: '[Mesaj vocal]',
        timestamp: '11:50',
        type: 'audio',
        audioUrl: 'audio-4',
        audioDuration: demoAudioMessages['audio-4'].duration,
        transcription: demoAudioMessages['audio-4'].transcription,
        transcriptionConfidence: demoAudioMessages['audio-4'].confidence,
        transcriberProvider: demoAudioMessages['audio-4'].provider as 'soniox',
      },
      { id: 'm11', role: 'assistant', content: 'Asta e problema. Ar trebui sa fie setat pe "Sincronizare Automata". Se intamplă dupa o actualizare software care reseteaza setarea. Iata cum sa o corectezi:\n\n1. Atinge "Mod Sincronizare"\n2. Selecteaza "Sincronizare Automata (Timp Real)"\n3. Atinge "Aplica & Repornire Display"\n\nDisplayul se va reîncarca si se va reconecta in aproximativ 10 secunde.', timestamp: '11:51' },
      { id: 'm12', role: 'user', content: 'Gata! Comenzile se vad acum! Vad 3 comenzi care au venit in timp ce eram inactivi.', timestamp: '11:56' },
      { id: 'm13', role: 'event', content: 'Apel instrument: Actualizare Stare Tichet → TKT-10491 inchis ca Rezolvat', timestamp: '11:56', toolCall: { name: 'Actualizare Stare Tichet', result: 'TKT-10491 → Rezolvat' } },
      { id: 'm14', role: 'assistant', content: 'Excelent! Tichetul TKT-10491 este inchis. Pentru viitor, aceasta setare poate fi reseteaza dupa actualizari majore - vom lucra sa o facem persistenta. Sa ai o zi buna, Mihaela!', timestamp: '11:56' },
    ],
  },

  // 3. Inventory system restart failed — escalated to L2 (with audio)
  {
    id: 'conv-3',
    customerName: 'Bogdan Ionescu',
    customerPhone: '+40 723 456 789',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul de Suport Tehnic',
    status: 'escalated',
    resolution: 'human-escalated',
    startedAt: '2026-03-24T14:05:00Z',
    lastMessageAt: '2026-03-24T14:28:00Z',
    messageCount: 16,
    ticketId: 'TKT-10503',
    systemTarget: 'Sistem Inventar',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '14:05' },
      { 
        id: 'm2', 
        role: 'user', 
        content: '[Mesaj vocal]',
        timestamp: '14:06',
        type: 'audio',
        audioUrl: 'audio-5',
        audioDuration: demoAudioMessages['audio-5'].duration,
        transcription: demoAudioMessages['audio-5'].transcription,
        transcriptionConfidence: demoAudioMessages['audio-5'].confidence,
        transcriberProvider: demoAudioMessages['audio-5'].provider as 'whisper',
      },
      { id: 'm3', role: 'assistant', content: 'Imi pare rau sa aud asta. Lasă-mă sa gasesc contul tau se sa ma pun pe treaba imediat. Care e restaurantul sau emailul?', timestamp: '14:06' },
      { id: 'm4', role: 'user', content: 'Taverna Ionescu, bogdan@tavernaionescu.ro', timestamp: '14:07' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Căutare Client (CRM) → Gasit: Bogdan Ionescu, Taverna Ionescu, Plan: Enterprise', timestamp: '14:07', toolCall: { name: 'Căutare Client', result: 'Client gasit: Bogdan Ionescu · Taverna Ionescu · Plan: Enterprise' } },
      { id: 'm6', role: 'event', content: 'Apel instrument: Creare Tichet (Oracle RightNow) → TKT-10503 creat, Prioritate: Critica', timestamp: '14:08', toolCall: { name: 'Creare Tichet', result: 'Tichet TKT-10503 creat · Prioritate: Critica' } },
      { id: 'm7', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → Inventar: INACTIV (ultima vizionare: 11:58 UTC, eroare: Timeout conexiune BD)', timestamp: '14:08', toolCall: { name: 'Verificare Stare Sistem', result: 'Inventar: INACTIV · Eroare: Timeout conexiune BD' } },
      { id: 'm8', role: 'assistant', content: 'Vad ca serviciul de inventar e inactiv din 11:58 UTC cu o eroare de conexiune la baza de date. Initiez o repornire de urgenta acum.', timestamp: '14:09' },
      { id: 'm9', role: 'event', content: 'Apel instrument: Repornire Serviciu → Repornire initiata pentru Inventar', timestamp: '14:09', toolCall: { name: 'Repornire Serviciu', result: 'Repornire initiata · Estimat: 60 secunde' } },
      { id: 'm10', role: 'assistant', content: 'Repornirea e in curs, verific starea...', timestamp: '14:10' },
      { id: 'm11', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → Inventar: INACTIV (eroare persista: Timeout conexiune BD)', timestamp: '14:10', toolCall: { name: 'Verificare Stare Sistem', result: 'Inventar: INACTIV · Eroare persista · Timeout conexiune BD' } },
      { id: 'm12', role: 'assistant', content: 'Repornirea nu a rezolvat problema - par a fi o problema profunda de conectivitate la baza de date care necesita investigatie de echipa Nivel 2. Escachez asta acum ca Prioritate Critica.', timestamp: '14:11' },
      { id: 'm13', role: 'event', content: 'Apel instrument: Actualizare Stare Tichet → TKT-10503 escalat la Suport Nivel 2', timestamp: '14:11', toolCall: { name: 'Actualizare Stare Tichet', result: 'TKT-10503 → Escalat la Suport Nivel 2' } },
      { id: 'm14', role: 'assistant', content: 'Bogdan, am escalat tichetul TKT-10503 echipei Nivel 2 cu prioritate Critica. Un specialist te va contacta in 15 minute. Vei primi notificare SMS si email.', timestamp: '14:12' },
      { 
        id: 'm15', 
        role: 'user', 
        content: '[Mesaj vocal]',
        timestamp: '14:13',
        type: 'audio',
        audioUrl: 'audio-6',
        audioDuration: demoAudioMessages['audio-6'].duration,
        transcription: demoAudioMessages['audio-6'].transcription,
        transcriptionConfidence: demoAudioMessages['audio-6'].confidence,
        transcriberProvider: demoAudioMessages['audio-6'].provider as 'soniox',
      },
      { id: 'm16', role: 'assistant', content: 'Absolut, inteleg urgenta. Echipa Nivel 2 e alertata si tichetul tau e in topul cozii. Multumesc pentru rabdare, Bogdan.', timestamp: '14:13' },
    ],
  },

  // 4. License validation — valid license, plan info shown
  {
    id: 'conv-4',
    customerName: 'Cristina Dumitrescu',
    customerPhone: '+40 724 567 890',
    agentName: 'Asistentul de Facturare Horeca',
    flowName: 'Fluxul de Validare Licenta',
    status: 'resolved',
    resolution: 'auto-resolved',
    startedAt: '2026-03-24T10:22:00Z',
    lastMessageAt: '2026-03-24T10:31:00Z',
    messageCount: 8,
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de facturare si licensing Horeca. Cum te pot ajuta?', timestamp: '10:22' },
      { id: 'm2', role: 'user', content: 'Trebuie sa verific daca licenta mea e inca valida. Adaugam o a doua locatie si vreau sa ma asigur ca suntem acoperiti.', timestamp: '10:23' },
      { id: 'm3', role: 'assistant', content: 'Desigur! Partajeaza-mi cheia de licenta si voi verifica imediat.', timestamp: '10:23' },
      { id: 'm4', role: 'user', content: 'Cheie licenta: HRC-ENT-2024-CD-88821', timestamp: '10:24' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Validare Cheie Licenta → Valida · Plan: Enterprise Multi-Site · Expira: 2026-12-31 · Locatii: pana la 5', timestamp: '10:24', toolCall: { name: 'Validare Cheie Licenta', result: 'Valida · Plan: Enterprise Multi-Site · Expira: 2026-12-31 · Locatii: pana la 5' } },
      { id: 'm6', role: 'assistant', content: 'Licenta ta e valida si in stare excelenta:\n\n• **Plan:** Enterprise Multi-Site\n• **Expira:** 31 Decembrie 2026\n• **Locatii acoperite:** Pana la 5 locuri\n• **Folosire curenta:** 1 din 5 locuri\n\nEsti acoperit complet sa adaugi o a doua locatie. Poti o activa din panoul admin sub Setari → Locatii → Adauga Locatie Noua.', timestamp: '10:25' },
      { id: 'm7', role: 'user', content: 'Perfect! Asta e exact ce aveam nevoie. Multumesc!', timestamp: '10:30' },
      { id: 'm8', role: 'assistant', content: 'Cu placere, Cristina! Mult succes cu noua locatie. Daca ai nevoie de ajutor la configurare, nu ezita sa ne contactezi.', timestamp: '10:31' },
    ],
  },

  // 5. License expired — redirected to renewal
  {
    id: 'conv-5',
    customerName: 'Rares Georgescu',
    customerPhone: '+40 725 678 901',
    agentName: 'Asistentul de Facturare Horeca',
    flowName: 'Fluxul de Validare Licenta',
    status: 'resolved',
    resolution: 'redirected',
    startedAt: '2026-03-23T15:44:00Z',
    lastMessageAt: '2026-03-23T15:52:00Z',
    messageCount: 9,
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de facturare si licensing Horeca. Cum te pot ajuta?', timestamp: '15:44' },
      { id: 'm2', role: 'user', content: 'Primesc o eroare care spune ca licenta mea a expirat cand incerc sa deschid panoul de management.', timestamp: '15:45' },
      { id: 'm3', role: 'assistant', content: 'Lasă-mă sa verific starea licentei imediat. Partajeaza-mi cheia de licenta.', timestamp: '15:45' },
      { id: 'm4', role: 'user', content: 'HRC-PRO-2023-RG-44210', timestamp: '15:46' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Validare Cheie Licenta → Expirata · Plan: Professional · Expirata: 2026-03-15', timestamp: '15:46', toolCall: { name: 'Validare Cheie Licenta', result: 'Expirata · Plan: Professional · Expirata: 2026-03-15' } },
      { id: 'm6', role: 'assistant', content: 'Pot confirma ca licenta ta Professional a expirat pe 15 Martie 2026. Datele sunt sigure si vor fi retinute 90 de zile.\n\nPentru a reinnoi, ai doua optiuni:\n\n1. **Online:** Logheaza-te pe portal.horecasoftware.ro si reinnoi sub Facturare → Abonament\n2. **Echipa Vanzari:** Contacteaza sales@horecasoftware.ro pentru preturile in volum sau upgrade la Enterprise', timestamp: '15:47' },
      { id: 'm7', role: 'user', content: 'Pot reinnui direct din chat?', timestamp: '15:49' },
      { id: 'm8', role: 'assistant', content: 'Nu pot procesa plati direct in chat, dar reinnouirea pe portal dureaza mai putin de 2 minute si accepta toate cardurile majore. Alternativ, pot sa te conectez cu echipa de vanzari care poate trimite un link de plata rapid. Care prefer?', timestamp: '15:50' },
      { id: 'm9', role: 'user', content: 'Voi incerca pe portal. Multumesc pentru ajutor.', timestamp: '15:52' },
    ],
  },

  // 6. Reservation system issue — network config, resolved with KB
  {
    id: 'conv-6',
    customerName: 'Elena Kovacs',
    customerPhone: '+40 726 789 012',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul de Suport Tehnic',
    status: 'resolved',
    resolution: 'auto-resolved',
    startedAt: '2026-03-23T18:30:00Z',
    lastMessageAt: '2026-03-23T18:59:00Z',
    messageCount: 20,
    ticketId: 'TKT-10447',
    systemTarget: 'Sistem Rezervari',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '18:30' },
      { id: 'm2', role: 'user', content: 'Sistemul de rezervari nu se sincronizeaza cu platforma de rezervari. Rezervarile online nu apar.', timestamp: '18:31' },
      { id: 'm3', role: 'assistant', content: 'Asta e o problema critica de sincronizare in ore de serviciu. Lasă-mă sa gasesc contul tau. Care e emailul sau restaurantul?', timestamp: '18:31' },
      { id: 'm4', role: 'user', content: 'Restaurant Kovacs, elena@restaurantkovacs.ro', timestamp: '18:32' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Căutare Client (CRM) → Gasit: Elena Kovacs, Restaurant Kovacs, Plan: Professional', timestamp: '18:32', toolCall: { name: 'Căutare Client', result: 'Client gasit: Elena Kovacs · Restaurant Kovacs · Plan: Professional' } },
      { id: 'm6', role: 'event', content: 'Apel instrument: Creare Tichet (Oracle RightNow) → TKT-10447 creat, Prioritate: Inalta', timestamp: '18:33', toolCall: { name: 'Creare Tichet', result: 'Tichet TKT-10447 creat · Prioritate: Inalta' } },
      { id: 'm7', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → Rezervari: ACTIV (timp activitate: 6h 12m, webhook: degradat)', timestamp: '18:33', toolCall: { name: 'Verificare Stare Sistem', result: 'Rezervari: ACTIV · Webhook outbound: DEGRADAT' } },
      { id: 'm8', role: 'assistant', content: 'Vad ca serviciul de Rezervari e activ dar conexiunea webhook de ieșire e degradata - asta blocheaza sincronizarea cu platforma de rezervari. Lasă-mă sa te ghidez.', timestamp: '18:34' },
      { id: 'm9', role: 'assistant', content: 'Du-te la panoul admin Horeca → Integrari → Platforma Rezervari → si verifica campul "URL Webhook". Incă arata URL-ul platformei de rezervari?', timestamp: '18:35' },
      { id: 'm10', role: 'user', content: 'Da, arata URL-ul dar e o icona rosie de avertisment langa.', timestamp: '18:40' },
      { id: 'm11', role: 'assistant', content: 'Icona rosie inseamna ca webhook-ul a fost automat oprit din cauza mai multor esecuri de livrare (de obicei din intreruperea temporara pe cealalta parte). Sa-l reactivezi:\n\n1. Apasa pe icona de avertisment\n2. Selecteaza "Reactivare Webhook"\n3. Apasa "Test Conexiune" pentru verificare\n\nVezi aceste optiuni?', timestamp: '18:41' },
      { id: 'm12', role: 'user', content: 'Da, le vad. Rulari testul... arata "Conexiune cu succes"!', timestamp: '18:47' },
      { id: 'm13', role: 'assistant', content: 'Excelent! Webhook-ul e reconectat. Rezervarile noi de pe platforma de rezervari ar trebui sa apara in 1-2 minute. Ar trebui sa verifi manual daca ai pierdut alte rezervari in timp de inactivitate.', timestamp: '18:48' },
      { id: 'm14', role: 'user', content: 'Vad 4 rezervari care tocmai au aparut. Ne-au lipsit de vreo 2 ore.', timestamp: '18:55' },
      { id: 'm15', role: 'event', content: 'Apel instrument: Actualizare Stare Tichet → TKT-10447 inchis ca Rezolvat', timestamp: '18:55', toolCall: { name: 'Actualizare Stare Tichet', result: 'TKT-10447 → Rezolvat' } },
      { id: 'm16', role: 'assistant', content: 'Tichetul TKT-10447 e inchis ca rezolvat. Cele 4 rezervari recuperate trebuie sa fie in sistemul tau. Sa ai o seara buna cu serviciul, Elena!', timestamp: '18:59' },
    ],
  },

  // 7. Customer not found in CRM
  {
    id: 'conv-7',
    customerName: 'Necunoscut',
    customerPhone: '+40 727 890 123',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul de Suport Tehnic',
    status: 'resolved',
    resolution: 'redirected',
    startedAt: '2026-03-24T08:02:00Z',
    lastMessageAt: '2026-03-24T08:08:00Z',
    messageCount: 7,
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '08:02' },
      { id: 'm2', role: 'user', content: 'Sistemul POS s-a stricat in amiaza micii.', timestamp: '08:03' },
      { id: 'm3', role: 'assistant', content: 'Te voi ajuta sa rezolvi asta imediat. Poti furniza numele restaurantului sau email?', timestamp: '08:03' },
      { id: 'm4', role: 'user', content: 'Restaurant Nou, tocmai am configurat contul saptamana trecuta.', timestamp: '08:04' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Căutare Client (CRM) → Nu s-a gasit match pentru "Restaurant Nou"', timestamp: '08:04', toolCall: { name: 'Căutare Client', result: 'Nu s-a gasit - client nu e in CRM' } },
      { id: 'm6', role: 'assistant', content: 'Am incercat sa gasesc "Restaurant Nou" dar contul nu e in sistemul nostru. Se poate intamplatoare daca configurarea contului inca se proceseaza.\n\nTe rog incearca:\n• **Email:** support@horecasoftware.ro\n• **Telefon:** +40 731-HORECA-1\n• **Referinta:** mentioneaza ca esti client nou configurat in ultimele 7 zile\n\nEchipa noastra va prioritiza cazul tau.', timestamp: '08:05' },
      { id: 'm7', role: 'user', content: 'OK, voi suna. Multumesc.', timestamp: '08:08' },
    ],
  },

  // 8. After-hours inquiry
  {
    id: 'conv-8',
    customerName: 'Ioana Marinescu',
    customerPhone: '+40 728 901 234',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul Dupa Program',
    status: 'waiting',
    resolution: 'after-hours',
    startedAt: '2026-03-23T22:15:00Z',
    lastMessageAt: '2026-03-23T22:19:00Z',
    messageCount: 5,
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '22:15' },
      { id: 'm2', role: 'user', content: 'Buna, displayul bucatariei s-a stricat in mijlocul serviciului nocturn.', timestamp: '22:16' },
      { id: 'm3', role: 'assistant', content: 'Salut, multumesc ca contactezi suportul Horeca. Orele noastre sunt luni-vineri, 9:00-18:00 EET. Te vom raspunde urmatorul zi lucratoare.', timestamp: '22:16' },
      { id: 'm4', role: 'assistant', content: 'Daca doresti, descrie pe scurt problema si o vom verifica prima ora dimineata:', timestamp: '22:17' },
      { id: 'm5', role: 'user', content: 'Display bucatarie la Restaurant Marinescu s-a oprit in jur de 22:00. Toate tabletele arata "Conexiune Pierduta". POS functioneaza normal. Urgent reparare pentru serviciul de dimineata.', timestamp: '22:19' },
    ],
  },

  // 9. Active conversation — POS issue in progress
  {
    id: 'conv-9',
    customerName: 'Vlad Sandu',
    customerPhone: '+40 729 012 345',
    agentName: 'Asistentul de Suport Horeca',
    flowName: 'Fluxul de Suport Tehnic',
    status: 'active',
    resolution: 'pending',
    startedAt: '2026-03-24T16:44:00Z',
    lastMessageAt: '2026-03-24T16:51:00Z',
    messageCount: 9,
    ticketId: 'TKT-10521',
    systemTarget: 'Sistem POS',
    messages: [
      { id: 'm1', role: 'assistant', content: 'Salut! Sunt asistentul de suport Horeca Software. Cum te pot ajuta astazi?', timestamp: '16:44' },
      { id: 'm2', role: 'user', content: 'POS-ul se deconecteaza la fiecare 10-15 minute. Trebuie sa-l repornesc constant.', timestamp: '16:45' },
      { id: 'm3', role: 'assistant', content: 'Deconexiunile intermitente de asta sunt de obicei problema de retea sau configuratie. Lasă-mă sa gasesc contul - care e emailul sau restaurantul?', timestamp: '16:45' },
      { id: 'm4', role: 'user', content: 'Gasthaus Sandu, vlad@gasthaussandu.ro', timestamp: '16:46' },
      { id: 'm5', role: 'event', content: 'Apel instrument: Căutare Client (CRM) → Gasit: Vlad Sandu, Gasthaus Sandu, Plan: Professional', timestamp: '16:46', toolCall: { name: 'Căutare Client', result: 'Client gasit: Vlad Sandu · Gasthaus Sandu · Plan: Professional' } },
      { id: 'm6', role: 'event', content: 'Apel instrument: Creare Tichet (Oracle RightNow) → TKT-10521 creat, Prioritate: Inalta', timestamp: '16:47', toolCall: { name: 'Creare Tichet', result: 'Tichet TKT-10521 creat · Prioritate: Inalta' } },
      { id: 'm7', role: 'event', content: 'Apel instrument: Verificare Stare Sistem → POS: ACTIV (timp activitate: 3m 12s - recent repornit)', timestamp: '16:47', toolCall: { name: 'Verificare Stare Sistem', result: 'POS: ACTIV · Timp activitate: 3m 12s (recent repornit)' } },
      { id: 'm8', role: 'assistant', content: 'POS-ul functioneaza dar arata ca a fost repornit acum 3 minute - consistent cu ce descrii. Scurte timpuri de functionare sugereaza o problema de timeout heartbeat. Lasă-mă sa verific. Pe terminalul POS, du-te la Setari → Retea → si spune-mi la ce e setat "Interval Keep-Alive".', timestamp: '16:48' },
      { id: 'm9', role: 'user', content: 'Spune 30 de secunde.', timestamp: '16:51' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig: Record<ConversationStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'info' | 'default'; icon: React.ElementType }> = {
  resolved: { label: 'Rezolvat', variant: 'success', icon: CheckCircle },
  escalated: { label: 'Escalat', variant: 'danger', icon: AlertTriangle },
  active: { label: 'Activ', variant: 'info', icon: MessageSquare },
  waiting: { label: 'In asteptare', variant: 'warning', icon: Clock },
};

const resolutionConfig: Record<ResolutionType, { label: string; color: string }> = {
  'auto-resolved': { label: 'Auto-rezolvat', color: 'text-green-700 bg-green-50' },
  'human-escalated': { label: 'Escalat la Nivel 2', color: 'text-red-700 bg-red-50' },
  'after-hours': { label: 'Dupa program', color: 'text-amber-700 bg-amber-50' },
  'pending': { label: 'In progres', color: 'text-blue-700 bg-blue-50' },
  'redirected': { label: 'Redirectionat', color: 'text-slate-700 bg-slate-100' },
};

const transcriberLabels: Record<string, string> = {
  soniox: 'Soniox',
  deepgram: 'Deepgram',
  whisper: 'OpenAI Whisper',
  google: 'Google Speech',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 24) return `Azi ${d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  if (diffH < 48) return `Ieri ${d.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ── Audio Waveform (Demo) ─────────────────────────────────────────────────────

function AudioWaveform({ isPlaying, progress }: { isPlaying: boolean; progress: number }) {
  const bars = 40;
  const heights = Array.from({ length: bars }, (_, i) => {
    // Generate pseudo-random heights based on index
    const baseHeight = 20 + Math.sin(i * 0.5) * 30 + Math.cos(i * 0.3) * 20;
    return Math.max(10, Math.min(80, baseHeight + (Math.random() * 20 - 10)));
  });

  return (
    <div className="flex items-center gap-0.5 h-8 flex-1">
      {heights.map((h, i) => {
        const isActive = (progress * bars) > i;
        return (
          <div
            key={i}
            className={`w-1 rounded-full transition-colors duration-100 ${
              isActive ? 'bg-green-400' : 'bg-slate-300'
            }`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

// ── Audio Message Bubble ──────────────────────────────────────────────────────

function AudioMessageBubble({ msg }: { msg: Message }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranscription, setShowTranscription] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const duration = msg.audioDuration || 0;

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsPlaying(true);
      const startTime = progress * duration;
      const startTimestamp = Date.now() - startTime * 1000;
      
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimestamp) / 1000;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);
        
        if (newProgress >= 1) {
          setIsPlaying(false);
          setProgress(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    setProgress(newProgress);
  };

  const confidenceColor = (msg.transcriptionConfidence || 0) >= 95 
    ? 'text-green-600' 
    : (msg.transcriptionConfidence || 0) >= 85 
      ? 'text-amber-600' 
      : 'text-red-500';

  return (
    <div className={`flex gap-2 mb-3 flex-row-reverse`}>
      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
        <User className="w-3.5 h-3.5 text-slate-600" />
      </div>
      <div className="max-w-[75%] items-end flex flex-col gap-1">
        {/* Audio Player */}
        <div className="bg-green-500 text-white rounded-2xl rounded-tr-sm px-3 py-2 min-w-[280px]">
          {/* Play controls */}
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <div 
              className="flex-1 cursor-pointer"
              onClick={handleSeek}
            >
              <AudioWaveform isPlaying={isPlaying} progress={progress} />
            </div>
            <span className="text-xs font-mono opacity-80">
              {formatDuration(Math.round(progress * duration))} / {formatDuration(duration)}
            </span>
          </div>
          
          {/* Audio info */}
          <div className="flex items-center gap-2 text-xs opacity-80">
            <Mic className="w-3 h-3" />
            <span>Mesaj vocal</span>
          </div>
        </div>
        
        {/* Transcription */}
        {msg.transcription && showTranscription && (
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 max-w-full shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-medium text-purple-700">Transcriere</span>
              <span className="text-xs text-slate-400">•</span>
              <span className={`text-xs font-medium ${confidenceColor}`}>
                {msg.transcriptionConfidence}% încredere
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">
                {transcriberLabels[msg.transcriberProvider || 'soniox']}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{msg.transcription}</p>
          </div>
        )}
        
        <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>
      </div>
    </div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  // Handle audio messages
  if (msg.type === 'audio' && msg.role === 'user') {
    return <AudioMessageBubble msg={msg} />;
  }

  if (msg.role === 'event') {
    return (
      <div className="flex items-start gap-2 my-2">
        <div className="flex-1 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Zap className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-medium text-orange-700">{msg.toolCall?.name}</span>
            <span className="text-xs text-slate-400 ml-2">{msg.timestamp}</span>
            <p className="text-xs text-slate-600 mt-0.5">{msg.toolCall?.result}</p>
          </div>
        </div>
      </div>
    );
  }

  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-slate-200' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-slate-600" /> : <Bot className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${isUser ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
          {msg.content}
        </div>
        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
      </div>
    </div>
  );
}

// ── Conversation Detail ───────────────────────────────────────────────────────

function ConversationDetail({ conv, onBack }: { conv: Conversation; onBack: () => void }) {
  const { label: statusLabel, variant: statusVariant, icon: StatusIcon } = statusConfig[conv.status];
  const { label: resLabel, color: resColor } = resolutionConfig[conv.resolution];

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition mb-4">
        <ChevronLeft className="w-4 h-4" /> Toate Conversatiile
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">{conv.customerName}</h2>
              <p className="text-sm text-slate-500">{conv.customerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusLabel}
            </Badge>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${resColor}`}>{resLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Agent</p>
            <p className="text-sm font-medium text-slate-700 flex items-center gap-1"><Bot className="w-3.5 h-3.5 text-green-600" />{conv.agentName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Flux</p>
            <p className="text-sm font-medium text-slate-700">{conv.flowName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Inceput</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(conv.startedAt)}</p>
          </div>
          {conv.ticketId && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Tichet</p>
              <p className="text-sm font-medium text-slate-700 flex items-center gap-1"><Database className="w-3.5 h-3.5 text-purple-500" />{conv.ticketId}</p>
            </div>
          )}
          {conv.systemTarget && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Sistem</p>
              <p className="text-sm font-medium text-slate-700">{conv.systemTarget}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Mesaje</p>
            <p className="text-sm font-medium text-slate-700">{conv.messages.length}</p>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
        {conv.messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {conv.status === 'active' && (
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            Bot scrie...
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ConversationStatus | 'all'>('all');

  const selected = conversations.find(c => c.id === selectedId) ?? null;

  if (selected) {
    return (
      <div className="animate-fade-in">
        <ConversationDetail conv={selected} onBack={() => setSelectedId(null)} />
      </div>
    );
  }

  const filtered = conversations.filter(c => {
    const matchSearch = !search || c.customerName.toLowerCase().includes(search.toLowerCase()) || c.customerPhone.includes(search) || (c.ticketId ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const total = conversations.length;
  const resolved = conversations.filter(c => c.status === 'resolved').length;
  const escalated = conversations.filter(c => c.status === 'escalated').length;
  const active = conversations.filter(c => c.status === 'active').length;
  const waiting = conversations.filter(c => c.status === 'waiting').length;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Conversatii</h1>
        <p className="text-sm text-slate-500 mt-0.5">Istoric conversatii WhatsApp pe toti agentii</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: total, color: 'text-slate-800' },
          { label: 'Rezolvate', value: resolved, color: 'text-green-700' },
          { label: 'Escalate', value: escalated, color: 'text-red-600' },
          { label: 'Activ / Astept.', value: `${active} / ${waiting}`, color: 'text-blue-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cauta dupa nume, telefon, tichet…"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['all', 'active', 'waiting', 'resolved', 'escalated'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${filterStatus === s ? 'bg-accent-500 text-white border-accent-500' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {s === 'all' ? 'Toti' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg py-16 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Nu exista conversatii care sa se potriveasca cu filtrele.</p>
          </div>
        )}
        {filtered.map(conv => {
          const { label: statusLabel, variant, icon: StatusIcon } = statusConfig[conv.status];
          const { label: resLabel, color: resColor } = resolutionConfig[conv.resolution];
          const lastMsg = conv.messages[conv.messages.length - 1];
          const isUserLast = lastMsg?.role === 'user';
          const hasAudio = conv.messages.some(m => m.type === 'audio');

          return (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 hover:shadow-sm hover:border-slate-300 transition text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-slate-800 text-sm truncate">{conv.customerName}</span>
                    <span className="text-xs text-slate-400 flex-shrink-0">{conv.customerPhone}</span>
                    {hasAudio && <Mic className="w-3 h-3 text-purple-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {lastMsg?.type === 'audio' ? '🎤 ' : (isUserLast ? '👤 ' : '🤖 ')}
                    {lastMsg?.type === 'audio' ? lastMsg.transcription?.slice(0, 50) + '...' : lastMsg?.content}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <Badge variant={variant}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusLabel}
                  </Badge>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${resColor}`}>{resLabel}</span>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                  <span className="text-xs text-slate-400">{formatDate(conv.lastMessageAt)}</span>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MessageSquare className="w-3 h-3" />
                    {conv.messages.length}
                    {conv.systemTarget && (
                      <>
                        <ArrowRight className="w-3 h-3" />
                        <span>{conv.systemTarget}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
