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

function fill(select, list, keep, placeholder) {
  const options = list.map(p => Object.assign(document.createElement('option'), { value: p.id, textContent: p.name }));
  if (placeholder) options.unshift(Object.assign(document.createElement('option'), { value: '', textContent: placeholder }));
  select.replaceChildren(...options);
  select.value = keep && list.some(p => p.id === keep) ? keep : (placeholder ? '' : select.value);
}

// "me" is never assumed: it is only set by an explicit pick or by ticking "This is me" when creating a player.
function render() {
  const wanted = myId() || localStorage.getItem('me');
  fill($('me'), players, wanted, 'Choose yourself…');
  if (myId()) localStorage.setItem('me', myId()); else localStorage.removeItem('me');
  const others = players.filter(p => p.id !== myId());
  fill($('opponent'), others, $('opponent').value, others.length > 1 ? 'Choose opponent…' : null);
  $('me').disabled = players.length === 0;
  $('record-section').hidden = !myId() || others.length === 0;
  $('hint').textContent = players.length === 0 ? 'No players yet. Start by creating a player below: that is you.'
    : !myId() ? 'Choose who you are, or create yourself below, before recording a match.'
    : others.length === 0 ? 'You need a second player before you can record a match. Create your opponent below.' : '';

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
  suggestIsMe();
}

function suggestIsMe() { $('is-me').checked = !myId(); }
$('me').addEventListener('change', () => { render(); suggestIsMe(); });

$('player-form').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const player = await api('/api/players', { name: $('name').value });
    const makeMe = $('is-me').checked;
    $('name').value = '';
    await load();
    if (makeMe) { $('me').value = player.id; render(); suggestIsMe(); }
    say(`Player "${player.name}" created.`, false);
  } catch (error) { say(error.message); }
});

$('match-form').addEventListener('submit', async event => {
  event.preventDefault();
  const me = myId(), them = $('opponent').value;
  if (!me) return say('Choose who you are first.');
  if (!them) return say('Choose your opponent.');
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
