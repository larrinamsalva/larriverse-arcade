const cast = [
  'rabbit', 'fox', 'bear', 'owl', 'turtle',
  'panda', 'hedgehog', 'squirrel', 'raccoon', 'bird',
  'frog', 'butterfly', 'otter', 'tiger', 'penguin',
  'bee', 'giraffe', 'octopus', 'koala', 'parrot',
];

const props = [
  'ball', 'train', 'books', 'blocks',
  'paintbrush', 'pencils', 'notebook', 'phone',
  'scissors', 'model', 'lunchbox', 'balloons',
  'trophy', 'puzzle', 'radio', 'wheelchair',
];

// Use the campaign titles to keep the art with its situation when lessons move.
const scenes = new Map([
  ['A friend feels left out', ['playground', 'rabbit', 'fox', 'ball']],
  ['Your turn to set a boundary', ['clubhouse', 'rabbit', 'fox', 'train']],
  ['The team has two ideas', ['clubhouse', 'bear', 'rabbit', 'books', 'puzzle']],
  ['You made a mistake', ['clubhouse', 'owl', 'rabbit', 'blocks']],
  ['Someone needs backup', ['playground', 'turtle', 'hedgehog']],
  ['Two friends want the same turn', ['classroom', 'panda', 'fox', 'paintbrush']],
  ['A joke stops being funny', ['porch', 'hedgehog', 'squirrel']],
  ['You need quiet time', ['porch', 'squirrel']],
  ['A friend asks for help', ['clubhouse', 'raccoon', 'bear', 'phone']],
  ['A teammate is interrupted', ['porch', 'bird', 'fox', 'notebook']],
  ['You borrowed something and broke it', ['clubhouse', 'frog', 'panda', 'puzzle']],
  ['A new kid joins the table', ['classroom', 'butterfly', 'rabbit', 'puzzle']],
  ['Your friend says no', ['porch', 'otter', 'bear']],
  ['A group project feels uneven', ['classroom', 'tiger', 'bird', 'model']],
  ['You disagree with a friend', ['clubhouse', 'penguin', 'fox', 'puzzle']],
  ['Someone keeps changing the rules', ['classroom', 'bee', 'panda', 'puzzle']],
  ['A friend wants private space', ['clubhouse', 'giraffe', 'koala', 'notebook']],
  ['You are getting too frustrated', ['clubhouse', 'octopus', 'rabbit', 'puzzle']],
  ['A rumor starts spreading', ['porch', 'koala', 'hedgehog']],
  ['Someone apologizes', ['porch', 'parrot', 'turtle']],
  ['New student at lunch', ['playground', 'panda', 'rabbit', 'lunchbox']],
  ['Friend needs a break', ['playground', 'fox', 'bird', 'ball']],
  ['Borrowing without asking', ['classroom', 'rabbit', 'squirrel', 'pencils']],
  ['Missed teamwork task', ['classroom', 'turtle', 'tiger', 'model']],
  ['Different favorite game', ['clubhouse', 'bee', 'penguin', 'puzzle']],
  ['Photo before posting', ['playground', 'butterfly', 'fox', 'phone']],
  ['A hard apology', ['classroom', 'owl', 'rabbit', 'model']],
  ['Someone says no', ['clubhouse', 'otter', 'panda', 'train']],
  ['Quiet classroom', ['classroom', 'panda', 'bird', 'books']],
  ['Group chat teasing', ['clubhouse', 'fox', 'turtle', 'phone']],
  ['Lost a competition', ['playground', 'rabbit', 'tiger', 'ball']],
  ['Shy at the party', ['playground', 'turtle', 'bee', 'balloons']],
  ['Sharing craft supplies', ['classroom', 'bee', 'giraffe', 'scissors']],
  ['A friend breaks a promise', ['porch', 'butterfly', 'otter']],
  ['Someone needs help', ['classroom', 'owl', 'hedgehog', 'model']],
  ['Respecting pronouns', ['classroom', 'otter', 'panda']],
  ['Getting interrupted', ['clubhouse', 'panda', 'bird', 'books']],
  ["Another family's customs", ['porch', 'fox', 'penguin']],
  ['Invite without pressure', ['porch', 'rabbit', 'turtle']],
  ['Being excluded from teams', ['playground', 'turtle', 'tiger', 'ball']],
  ['Needing privacy', ['classroom', 'bee', 'squirrel', 'notebook']],
  ['A misunderstanding online', ['clubhouse', 'butterfly', 'parrot', 'phone']],
  ['Helping with a disability', ['classroom', 'owl', 'rabbit', 'wheelchair']],
  ['Family chores change', ['clubhouse', 'otter', 'frog', 'books']],
  ['Celebrating others', ['playground', 'panda', 'bear', 'trophy']],
  ['Unwelcome rough play', ['playground', 'fox', 'turtle', 'ball']],
  ['Sharing a secret safely', ['porch', 'rabbit', 'bear']],
  ['Including a younger player', ['playground', 'turtle', 'squirrel', 'ball']],
  ['Receiving feedback', ['classroom', 'bee', 'owl', 'model']],
  ['Apology accepted slowly', ['porch', 'butterfly', 'koala']],
  ['Different ways to learn', ['classroom', 'owl', 'octopus', 'pencils', 'books']],
  ['A cancelled playdate', ['porch', 'otter', 'rabbit', 'phone']],
  ['Asking before hugging', ['porch', 'panda', 'otter']],
  ['Fair classroom cleanup', ['classroom', 'fox', 'hedgehog', 'paintbrush', 'scissors']],
  ['Correcting your mistake', ['porch', 'rabbit', 'parrot', 'notebook']],
  ['Compromise on music', ['playground', 'turtle', 'bee', 'radio', 'balloons']],
  ['Food preferences', ['playground', 'bee', 'hedgehog', 'lunchbox']],
  ['Respect during debate', ['classroom', 'butterfly', 'frog', 'notebook']],
  ['Helping after a fall', ['playground', 'owl', 'frog']],
  ['Sharing leadership', ['classroom', 'otter', 'koala', 'model']],
]);

const artURL = name => new URL('./art/' + name, import.meta.url).href;

function spriteStyle(file, index, columns, rows) {
  const x = (index % columns) * 100 / (columns - 1);
  const y = Math.floor(index / columns) * 100 / (rows - 1);
  return `--sprite:url('${artURL(file)}');--sprite-size:${columns * 100}% ${rows * 100}%;--sprite-position:${x}% ${y}%`;
}

function actor(name, position) {
  const index = cast.indexOf(name);
  const file = index < 10 ? 'characters-a.png' : 'characters-b.png';
  return `<span class="kindness-actor" data-character="${name}" data-position="${position}">
    <span class="kindness-sprite" style="${spriteStyle(file, index % 10, 5, 2)}"></span>
  </span>`;
}

function prop(name, position) {
  return `<span class="kindness-prop" data-prop="${name}" data-position="${position}">
    <span class="kindness-sprite" style="${spriteStyle('props.png', props.indexOf(name), 4, 4)}"></span>
  </span>`;
}

export function kindnessScene(item) {
  const [setting, lead, friend, object, extra] = scenes.get(item.title) ?? ['clubhouse', 'rabbit', 'fox', 'books'];
  return `<div class="kindness-stage" aria-hidden="true" data-setting="${setting}" data-cast="${friend ? 'pair' : 'solo'}">
    <img class="kindness-backdrop" width="696" height="390" src="${artURL(setting + '.jpg')}" alt="">
    ${actor(lead, 'lead')}${friend ? actor(friend, 'friend') : ''}
    ${object ? prop(object, 'main') : ''}${extra ? prop(extra, 'extra') : ''}
  </div>`;
}
