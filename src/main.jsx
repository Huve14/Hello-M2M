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
    <section className="screen inner-screen home-screen">
      <HomeRadialBackground />
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

const HOME_FRAG_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
uniform vec3 iResolution;
uniform float iTime;

void main() {
  vec2 r = iResolution.xy;
  vec2 p = gl_FragCoord.xy - r * 0.5;
  float t = iTime * 0.55;
  vec4 o = vec4(0.0);

  for (float i = 1.0; i < 10.0; i += 1.0) {
    float a = (i * i) / 80.0 - length(p) / r.y;
    float denom = max(a, -a * 3.0) + 2.0 / r.y;
    float wave = cos(i - t);
    float angle = atan(p.y, p.x) + wave + i * i;
    float sm = smoothstep(wave, 2.0, cos(angle));
    o += 0.03 / denom * sm * (1.2 + sin(angle + i + vec4(0.0, 2.0, 4.0, 0.0)));
  }

  vec3 rings = tanh(o.rgb);
  float energy = clamp(dot(rings, vec3(0.36, 0.46, 0.18)), 0.0, 1.0);
  float redLift = smoothstep(0.42, 0.95, rings.r);
  float greyLift = smoothstep(0.3, 0.9, rings.g);

  vec3 navy = vec3(0.047, 0.090, 0.208);
  vec3 blue = vec3(0.160, 0.244, 0.608);
  vec3 red = vec3(0.929, 0.110, 0.141);
  vec3 grey = vec3(0.863, 0.867, 0.871);

  vec3 color = mix(navy, blue, energy * 0.62);
  color = mix(color, red, redLift * 0.34);
  color = mix(color, grey, greyLift * 0.12);
  fragColor = vec4(color, 1.0);
}
`;

const HOME_VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

function HomeRadialBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', { premultipliedAlpha: false });
    if (!canvas || !gl) return undefined;

    let disposed = false;
    let animationId = 0;
    const start = performance.now();

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, HOME_VERT_SRC);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, HOME_FRAG_SRC);
    if (!vertexShader || !fragmentShader) return undefined;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return undefined;
    }

    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniform = gl.getUniformLocation(program, 'iResolution');
    const timeUniform = gl.getUniformLocation(program, 'iTime');

    const resize = () => {
      const pixelRatio = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1));
      const width = Math.max(1, Math.floor(canvas.clientWidth * pixelRatio));
      const height = Math.max(1, Math.floor(canvas.clientHeight * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const render = (now) => {
      if (disposed) return;
      resize();
      gl.useProgram(program);
      gl.uniform3f(resolutionUniform, canvas.width, canvas.height, window.devicePixelRatio || 1);
      gl.uniform1f(timeUniform, (now - start) / 1000);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationId = window.requestAnimationFrame(render);
    };

    animationId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="home-radial-bg" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
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
    <section className="screen inner-screen explore-screen">
      <ExploreM2MBackground />
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

function ExploreM2MBackground() {
  const words = ['CONNECT', 'SYNC', 'CREATE', 'ACTIVATE', 'INSPIRE'];

  return (
    <div className="explore-bg" aria-hidden="true">
      <span className="explore-grid" />
      <span className="explore-blob explore-blob-red" />
      <span className="explore-blob explore-blob-blue" />
      <span className="explore-blob explore-blob-grey" />
      <div className="explore-stage">
        <div className="explore-orbit">
          {words.map((word, index) => (
            <span
              className="explore-word display"
              key={word}
              style={{
                '--word-angle': `${index * 72}deg`,
                '--word-delay': `${index * -3.8}s`,
              }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="explore-hub">
          <span className="explore-halo" />
          <img src="/assets/m2m-white.png" alt="" />
          <span className="explore-link">
            <i />
            <b />
            <i />
          </span>
        </div>
      </div>
      <span className="explore-grain" />
    </div>
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
