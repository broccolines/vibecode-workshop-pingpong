const $ = id => document.getElementById(id);
let players = [];
let matches = [];

async function api(path, body) {
  const response = await fetch(path, body === undefined ? {} : {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function say(text, bad = true) {
  const el = $('message');
  el.textContent = text || '';
  el.hidden = !text;
  el.className = bad ? 'message error' : 'message ok';
}

const nameOf = id => players.find(p => p.id === id)?.name ?? 'Unknown player';
const myId = () => $('me').value;

function fill(select, list, keep) {
  select.replaceChildren(...list.map(p => Object.assign(document.createElement('option'), { value: p.id, textContent: p.name })));
  if (keep && list.some(p => p.id === keep)) select.value = keep;
}

function render() {
  const saved = localStorage.getItem('me');
  fill($('me'), players, myId() || saved);
  if (myId()) localStorage.setItem('me', myId());
  const others = players.filter(p => p.id !== myId());
  fill($('opponent'), others, $('opponent').value);
  $('record-section').hidden = others.length === 0;
  $('me').disabled = players.length === 0;
  $('hint').textContent = players.length === 0 ? 'No players yet. Start by creating a player below: that is you.'
    : players.length === 1 ? 'You need a second player before you can record a match. Create your opponent below.' : '';

  $('empty-matches').hidden = matches.length > 0;
  $('match-list').replaceChildren(...[...matches].reverse().map(m => {
    const [a, b] = m.participants;
    const s = m.result?.scores;
    const li = document.createElement('li');
    const text = s ? `${nameOf(a)} ${s[a]}–${s[b]} ${nameOf(b)}` : `${m.participants.map(nameOf).join(' vs ')} (${m.state})`;
    const time = Object.assign(document.createElement('time'), { dateTime: m.createdAt, textContent: new Date(m.createdAt).toLocaleString() });
    li.append(Object.assign(document.createElement('span'), { textContent: text }), time);
    return li;
  }));
}

async function load() {
  [players, matches] = await Promise.all([api('/api/players'), api('/api/matches')]);
  render();
}

$('me').addEventListener('change', () => { localStorage.setItem('me', myId()); render(); });

$('player-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const player = await api('/api/players', { name: $('name').value });
    localStorage.setItem('me', players.length === 0 ? player.id : (myId() || player.id));
    $('name').value = '';
    await load();
    say(`Player "${player.name}" created.`, false);
  } catch (error) { say(error.message); }
});

$('match-form').addEventListener('submit', async event => {
  event.preventDefault();
  const me = myId(), them = $('opponent').value;
  try {
    await api('/api/matches', {
      actingPlayerId: me, participants: [me, them],
      result: { scores: { [me]: $('my-score').valueAsNumber, [them]: $('their-score').valueAsNumber } },
    });
    $('match-form').reset();
    await load();
    say('Match recorded.', false);
  } catch (error) { say(error.message); }
});

load().catch(error => say(`Could not load data: ${error.message}`));
