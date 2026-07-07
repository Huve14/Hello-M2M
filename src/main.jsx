import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  MapPin,
  MousePointerClick,
  UserPlus,
  Wifi,
} from 'lucide-react';
import './styles.css';

const HOSTS = [
  { name: 'Thabo Mokoena', role: 'Managing Director' },
  { name: 'Lerato Nkosi', role: 'Creative Director' },
  { name: 'Sipho Dlamini', role: 'Head of Activations' },
  { name: 'Aisha Patel', role: 'Client Services Lead' },
  { name: 'Johan van der Merwe', role: 'Strategy Director' },
  { name: 'Naledi Khumalo', role: 'Events Manager' },
  { name: 'Riaan Botha', role: 'Production Lead' },
  { name: 'Zanele Mthembu', role: 'Research & Insights' },
  { name: 'Kyle Adams', role: 'Brand Manager' },
  { name: 'Fatima Ismail', role: 'Finance & Operations' },
];

const SERVICES = [
  ['01', 'Promotions & Events', 'Brand activations that put your story face-to-face with the people who matter.'],
  ['02', 'Field Marketing', 'On-the-ground teams, campaigns, audits and merchandising built for measurable reach.'],
  ['03', 'Research & Data', 'Practical insights, clean databases and reporting that keep decisions sharp.'],
  ['04', 'Marketing Strategy', 'Campaign planning, creative direction and delivery management from concept to close.'],
  ['05', 'Concept & Design', 'Brand worlds, production-ready creative and visual systems made to travel.'],
  ['06', 'Audio Facilities', 'In-house audio production that gives brand messages a confident voice.'],
  ['07', 'Branding', 'Corporate identity, promotional items, banners, signage and everything between.'],
];

const CLIENTS = ['VERTEX', 'LUMEN', 'NOMAD', 'ORBIT', 'SABLE', 'FYNBOS', 'KITE', 'KAPPA'];
const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row) => row.split(''));

function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(tick);
  }, []);

  return useMemo(() => {
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const date = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return { time, date, greeting };
  }, [now]);
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function App() {
  const [screen, setScreen] = useState('attract');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [activeField, setActiveField] = useState('name');
  const [host, setHost] = useState(null);
  const { time, date, greeting } = useClock();

  useEffect(() => {
    if (screen === 'attract') return undefined;
    const idle = window.setTimeout(() => reset(), 180_000);
    return () => window.clearTimeout(idle);
  }, [screen, name, company, activeField]);

  const reset = () => {
    setScreen('attract');
    setName('');
    setCompany('');
    setHost(null);
    setActiveField('name');
  };

  const goHome = () => setScreen('home');
  const goBack = () => {
    const previous = {
      home: 'attract',
      name: 'home',
      host: 'name',
      done: 'home',
      explore: 'home',
      info: 'home',
    };
    setScreen(previous[screen] || 'attract');
  };

  const updateActiveValue = (nextValue) => {
    if (activeField === 'name') {
      setName(nextValue);
    } else {
      setCompany(nextValue);
    }
  };

  const activeValue = activeField === 'name' ? name : company;
  const canContinue = name.trim().length > 1;

  const pressKey = (key) => {
    if (key === 'backspace') {
      updateActiveValue(activeValue.slice(0, -1));
      return;
    }

    const nextLetter = key === 'space' ? ' ' : activeValue.length === 0 || activeValue.endsWith(' ') ? key : key.toLowerCase();
    updateActiveValue(`${activeValue}${nextLetter}`);
  };

  const selectHost = (nextHost) => {
    setHost(nextHost);
    setScreen('done');
  };

  const firstName = name.trim().split(' ')[0] || 'there';

  return (
    <main className="shell">
      <BrandStripes />
      {screen === 'attract' && <AttractScreen date={date} time={time} onStart={goHome} />}
      {screen === 'home' && <HomeScreen date={date} greeting={greeting} time={time} onNavigate={setScreen} />}
      {screen === 'name' && (
        <NameScreen
          activeField={activeField}
          canContinue={canContinue}
          company={company}
          name={name}
          onBack={goBack}
          onContinue={() => canContinue && setScreen('host')}
          onField={setActiveField}
          onKey={pressKey}
        />
      )}
      {screen === 'host' && <HostScreen hosts={HOSTS} onBack={goBack} onSelect={selectHost} />}
      {screen === 'done' && <DoneScreen company={company} host={host} name={name} time={time} firstName={firstName} onDone={reset} />}
      {screen === 'explore' && <ExploreScreen date={date} time={time} onBack={goBack} />}
      {screen === 'info' && <InfoScreen date={date} time={time} onBack={goBack} />}
    </main>
  );
}

function BrandStripes() {
  return (
    <div className="brand-frame" aria-hidden="true">
      <span className="brand-bar brand-bar-top" />
      <span className="brand-tab" />
      <span className="chevron-field chevron-left" />
      <span className="chevron-field chevron-right" />
    </div>
  );
}

function AttractScreen({ date, time, onStart }) {
  return (
    <section className="screen attract-screen">
      <div className="hero-mark">
        <img src="/assets/m2m-white.png" alt="M2M" />
        <p>taking <strong>BRAND</strong> to life</p>
      </div>
      <ParticleButton onActivate={onStart}>
        <span>Touch to begin</span>
      </ParticleButton>
      <ClockPlate date={date} time={time} />
    </section>
  );
}

function ParticleButton({ children, onActivate }) {
  const buttonRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) {
      onActivate();
      return;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nextParticles = Array.from({ length: 18 }, (_, index) => {
      const angle = (index / 18) * Math.PI * 2;
      const distance = 42 + (index % 4) * 18;
      return {
        id: `${Date.now()}-${index}`,
        x: centerX,
        y: centerY,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 20,
        delay: (index % 6) * 28,
        color: index % 3 === 0 ? '#ffffff' : '#ed1c24',
        size: index % 4 === 0 ? 8 : 5,
      };
    });

    setParticles(nextParticles);
    setIsPressed(true);
    window.setTimeout(() => setIsPressed(false), 160);
    window.setTimeout(() => setParticles([]), 950);
    window.setTimeout(onActivate, 520);
  };

  return (
    <>
      <span className="particle-layer" aria-hidden="true">
        {particles.map((particle) => (
          <i
            className="particle"
            key={particle.id}
            style={{
              '--particle-x': `${particle.x}px`,
              '--particle-y': `${particle.y}px`,
              '--particle-dx': `${particle.dx}px`,
              '--particle-dy': `${particle.dy}px`,
              '--particle-delay': `${particle.delay}ms`,
              '--particle-color': particle.color,
              '--particle-size': `${particle.size}px`,
            }}
          />
        ))}
      </span>
      <button
        className={`start-button particle-button ${isPressed ? 'is-pressed' : ''}`}
        ref={buttonRef}
        type="button"
        onClick={handleClick}
      >
        <span className="button-shine" aria-hidden="true" />
        {children}
        <MousePointerClick aria-hidden="true" />
      </button>
    </>
  );
}

function HomeScreen({ date, greeting, time, onNavigate }) {
  const cards = [
    { key: 'name', icon: UserPlus, title: 'Check in', body: "Sign in and we'll let your host know you've arrived." },
    { key: 'explore', icon: Compass, title: 'Explore M2M', body: 'Who we are, what we do, and the brands we bring to life.' },
    { key: 'info', icon: Wifi, title: 'Wi-Fi & info', body: 'Guest network, reception details and how to reach us.' },
  ];

  return (
    <section className="screen inner-screen">
      <TopBar date={date} time={time} />
      <div className="home-layout">
        <p className="eyebrow">Marketing2theMAX</p>
        <h1 className="display home-title">
          {greeting}.<br />
          Welcome to <span>M2M</span>.
        </h1>
        <div className="action-grid">
          {cards.map(({ key, icon: Icon, title, body }) => (
            <button className="action-card" type="button" key={key} onClick={() => onNavigate(key)}>
              <span className="icon-box"><Icon aria-hidden="true" /></span>
              <ArrowRight className="card-arrow" aria-hidden="true" />
              <strong>{title}</strong>
              <small>{body}</small>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function NameScreen({ activeField, canContinue, company, name, onBack, onContinue, onField, onKey }) {
  return (
    <section className="screen inner-screen">
      <TopBar action="Step 1 of 2" onBack={onBack} />
      <div className="checkin-layout">
        <p className="eyebrow">Visitor check-in</p>
        <h1 className="display section-title">Let&apos;s get you signed in</h1>
        <div className="field-row">
          <button type="button" className={`field ${activeField === 'name' ? 'is-active' : ''}`} onClick={() => onField('name')}>
            <span>Full name</span>
            <strong>{name}{activeField === 'name' && <i />}</strong>
          </button>
          <button type="button" className={`field ${activeField === 'company' ? 'is-active' : ''}`} onClick={() => onField('company')}>
            <span>Company optional</span>
            <strong>{company}{activeField === 'company' && <i />}</strong>
          </button>
        </div>
        <Keyboard onKey={onKey} />
        <button className="primary-action" type="button" disabled={!canContinue} onClick={onContinue}>
          Continue <ArrowRight aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function Keyboard({ onKey }) {
  return (
    <div className="keyboard" aria-label="On-screen keyboard">
      {KEY_ROWS.map((row) => (
        <div className="key-row" key={row.join('')}>
          {row.map((key) => (
            <button className="key display" type="button" key={key} onClick={() => onKey(key)}>
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="key-row">
        <button className="key key-back" type="button" onClick={() => onKey('backspace')}>⌫</button>
        <button className="key key-space" type="button" onClick={() => onKey('space')}>Space</button>
      </div>
    </div>
  );
}

function HostScreen({ hosts, onBack, onSelect }) {
  return (
    <section className="screen inner-screen">
      <TopBar action="Step 2 of 2" onBack={onBack} />
      <div className="host-layout">
        <p className="eyebrow">Host selection</p>
        <h1 className="display section-title">Who are you here to see?</h1>
        <div className="host-grid">
          {hosts.map((host) => (
            <button className="host-card" type="button" key={host.name} onClick={() => onSelect(host)}>
              <span className="avatar display">{initials(host.name)}</span>
              <span>
                <strong>{host.name}</strong>
                <small>{host.role}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DoneScreen({ company, firstName, host, name, onDone, time }) {
  return (
    <section className="screen inner-screen">
      <TopBar />
      <div className="done-layout">
        <span className="success-mark"><Check aria-hidden="true" /></span>
        <h1 className="display section-title">{host?.name || 'Your host'} has been notified</h1>
        <p>Thanks {firstName}. Please take a seat. Someone will be with you shortly.</p>
        <div className="visitor-badge">
          <div>
            <img src="/assets/m2m-white.png" alt="M2M" />
            <span>Visitor</span>
          </div>
          <strong className="display">{name.trim() || 'Guest'}</strong>
          <small>{company.trim() || 'M2M Guest'}</small>
          <dl>
            <dt>Here to see</dt>
            <dd>{host?.name || '-'}</dd>
            <dt>Checked in</dt>
            <dd>{time}</dd>
          </dl>
        </div>
        <button className="primary-action" type="button" onClick={onDone}>Done</button>
      </div>
    </section>
  );
}

function ExploreScreen({ date, time, onBack }) {
  return (
    <section className="screen inner-screen">
      <TopBar date={date} time={time} onBack={onBack} />
      <div className="scroll-view explore-layout">
        <p className="eyebrow">What defines us</p>
        <h1 className="display explore-title">We take <span>brands</span> to life and inspire brands to inspire the world.</h1>
        <p className="lead">Fueled by young, innovative minds alongside seasoned specialists, Marketing2theMAX is a one-stop marketing agency built around activations, events, design, research and brand delivery.</p>
        <div className="stats-row">
          <Stat value="2009" label="Born to inspire brands" />
          <Stat value="#1" label="Fast-growing activations energy" />
          <Stat value="360°" label="Above and below the line" />
        </div>
        <SectionHeading>What we do</SectionHeading>
        <div className="service-grid">
          {SERVICES.map(([number, title, body]) => (
            <article className="service-card" key={title}>
              <span className="display">{number}</span>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <SectionHeading>Who loves us</SectionHeading>
        <div className="client-grid">
          {CLIENTS.map((client) => <span className="display" key={client}>{client}</span>)}
        </div>
      </div>
    </section>
  );
}

function InfoScreen({ date, time, onBack }) {
  return (
    <section className="screen inner-screen">
      <TopBar date={date} time={time} onBack={onBack} />
      <div className="info-layout">
        <InfoPanel icon={Wifi} kicker="Guest Wi-Fi" title="You're welcome online">
          <InfoRow label="Network" value="M2M-Guest" />
          <InfoRow label="Password" value="Inspire2009" />
        </InfoPanel>
        <InfoPanel icon={MapPin} kicker="Find us" title="Reception">
          <InfoRow label="Address" value="399 Jan Smuts Avenue, Craighall Park, Randburg" />
          <InfoRow label="Call us" value="011 326 1667" />
          <InfoRow label="Hours" value="Mon - Fri, 08:00 - 17:00" />
        </InfoPanel>
      </div>
    </section>
  );
}

function InfoPanel({ children, icon: Icon, kicker, title }) {
  return (
    <article className="info-panel">
      <span className="icon-box"><Icon aria-hidden="true" /></span>
      <p className="eyebrow">{kicker}</p>
      <h1 className="display">{title}</h1>
      {children}
    </article>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat">
      <strong className="display">{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h2 className="display section-heading">
      <span />
      {children}
    </h2>
  );
}

function TopBar({ action, date, onBack, time }) {
  return (
    <header className="topbar">
      {onBack ? (
        <button className="back-button" type="button" onClick={onBack}>
          <ArrowLeft aria-hidden="true" />
          Home
        </button>
      ) : (
        <span className="topbar-spacer" />
      )}
      {action && <span className="step-label">{action}</span>}
      <div className="topbar-right">
        {time && <ClockPlate compact date={date} time={time} />}
        <img src="/assets/m2m-white.png" alt="M2M" />
      </div>
    </header>
  );
}

function ClockPlate({ compact = false, date, time }) {
  return (
    <div className={compact ? 'clock compact' : 'clock'}>
      <strong className="display">{time}</strong>
      <span>{date}</span>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
