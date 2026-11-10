const assert = require('node:assert/strict');
class Element {
 constructor(){this.children=[];this.value='';this.dataset={};this.style={};this.events={};this.classList={add(){},remove(){}};}
 replaceChildren(){this.children=[];} append(...items){this.children.push(...items);}
 setAttribute(){} addEventListener(name, fn){this.events[name]=fn;} focus(){}
}
const elements = {};
const document = {querySelector(s){return elements[s] ||= new Element();},createElement(){return new Element();}};
let saved;
const localStorage = {getItem(){return null;},setItem(k,v){saved=JSON.parse(v);}};

    const KEY = "codyssey-activity-04-v2";
    const LEVELS = ['S', 'A', 'B', 'C', 'pool'];
    const TITLES = ["기생충","인터스텔라","라라랜드","센과 치히로의 행방불명","어벤져스: 엔드게임","범죄도시","타이타닉","토이 스토리"];
    const COLORS = ["#f2e6dc","#e3eee7","#ede7f6","#fcefd9","#e2ecf4","#f6e3e3"];
    const initial = () => ({ nextId: TITLES.length + 1, items: TITLES.map((title,index) => ({ id: 'm' + (index + 1), title, tier: 'pool' })) });
    let state = initial();
    let selected = null;
    let searchQuery = '';
    function matchesSearch(item) { return item.title.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()); }
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (stored && Number.isSafeInteger(stored.nextId) && Array.isArray(stored.items)
          && stored.items.every(item => typeof item.id === 'string' && typeof item.title === 'string' && LEVELS.includes(item.tier))) state = stored;
    } catch {}
    function showMessage(message) { document.querySelector('#message').textContent = message; }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch { showMessage('이 브라우저에서는 저장하지 못했어요. 현재 화면에서 확인한 내용과 다시 열어 확인한 내용을 구분해 주세요.'); }
    }
    function move(id,tier) {
      const item = state.items.find(item => item.id === id);
      if (!item || !LEVELS.includes(tier)) return;
      item.tier = tier; selected = null; save(); render();
      showMessage((item.title || '영화') + '를 옮겼어요.');
    }
    function card(item,index) {
      const element = document.createElement('button');
      element.type = 'button'; element.className = 'card'; element.draggable = true;
      element.textContent = item.title || ' '; element.dataset.id = item.id;
      element.style.backgroundColor = COLORS[index % COLORS.length];
      element.setAttribute('aria-label',item.title || '영화 카드');
      element.setAttribute('aria-pressed',String(selected === item.id));
      element.addEventListener('click',event => {
        event.stopPropagation(); selected = selected === item.id ? null : item.id; render();
        showMessage(selected ? (item.title || '영화') + '를 선택했어요.' : '선택을 해제했어요.');
      });
      element.addEventListener('dragstart',event => { event.dataTransfer.setData('text/plain',item.id); });
      return element;
    }
    function wireDrop(element,tier) {
      element.addEventListener('dragover',event => { event.preventDefault(); element.closest('.row')?.classList.add('over'); });
      element.addEventListener('dragleave',() => element.closest('.row')?.classList.remove('over'));
      element.addEventListener('drop',event => { event.preventDefault(); move(event.dataTransfer.getData('text/plain'),tier); });
      element.onclick = () => { if (selected) move(selected,tier); };
    }
    function render() {
      const matches = state.items.filter(matchesSearch).length;
      document.querySelector('#search-result').textContent = searchQuery.trim()
        ? (matches ? '검색 결과 ' + matches + '개 / 전체 ' + state.items.length + '개' : '일치하는 영화가 없습니다. 검색어를 바꿔 보세요.')
        : '전체 영화 ' + state.items.length + '개';
      const tiers = document.querySelector('#tiers'); tiers.replaceChildren();
      for (const tier of LEVELS.filter(value => value !== 'pool')) {
        const row = document.createElement('div'); row.className = 'row ' + tier;
        const label = document.createElement('button'); label.type = 'button'; label.className = 'label';
        label.textContent = tier; label.setAttribute('aria-label',tier + '등급으로 옮기기');
        label.addEventListener('click',() => { if (selected) move(selected,tier); else showMessage('먼저 영화 카드를 선택해 주세요.'); });
        
        const drop = document.createElement('div'); drop.className = 'drop'; drop.dataset.tier = tier;
        state.items.forEach((item,index) => { if (item.tier === tier && matchesSearch(item)) drop.append(card(item,index)); });
        wireDrop(drop,tier); row.append(label,drop); tiers.append(row);
      }
      const pool = document.querySelector('#pool'); pool.replaceChildren();
      state.items.forEach((item,index) => { if (item.tier === 'pool' && matchesSearch(item)) pool.append(card(item,index)); });
      
    }
    document.querySelector('#search').addEventListener('input',event => {
      searchQuery = event.target.value; selected = null; render();
    });
    document.querySelector('#clear-search').addEventListener('click',() => {
      searchQuery = ''; document.querySelector('#search').value = ''; selected = null; render();
      document.querySelector('#search').focus();
    });
    wireDrop(document.querySelector('#pool'),'pool');
    document.querySelector('#pool-label').addEventListener('click',() => { if (selected) move(selected,'pool'); else showMessage('먼저 영화 카드를 선택해 주세요.'); });
    document.querySelector('#add-form').addEventListener('submit',event => {
      event.preventDefault(); const input = document.querySelector('#title'); const title = input.value.trim();
      if (!title) { showMessage('영화 제목을 입력해 주세요.'); input.focus(); return; }
      if (state.items.some(item => item.title === title)) { showMessage('이미 있는 영화 제목이에요. 다른 제목을 넣어 주세요.'); return; }
      state.items.push({ id: 'm' + state.nextId++, title, tier: 'pool' });
      save(); render(); input.value = ''; showMessage('영화를 추가했어요.'); input.focus();
    });
    document.querySelector('#reset').addEventListener('click',() => {
      state = initial(); selected = null; searchQuery = ''; document.querySelector('#search').value = ''; document.querySelector('#title').value = ''; save(); render(); showMessage('처음 목록으로 돌아왔어요.');
    });
    render();
  
const visible = () => elements['#tiers'].children.flatMap(row=>row.children[1].children).concat(elements['#pool'].children);
assert.equal(visible().length,8);
searchQuery = TITLES[0].slice(0,1); render(); assert.equal(visible().length,1);
move('m1','S'); assert.equal(saved.items[0].tier,'S'); assert.equal(visible().length,1);
searchQuery='no matching title'; render(); assert.equal(visible().length,0);
assert.ok(elements['#search-result'].textContent.includes('없습니다'));
elements['#clear-search'].events.click(); assert.equal(visible().length,8);
document.querySelector('#title').value='Test Movie'; elements['#add-form'].events.submit({preventDefault(){}});
searchQuery='  TEST movie  ';render(); assert.equal(visible().length,1);
document.querySelector('#title').value='  '; elements['#add-form'].events.submit({preventDefault(){}}); assert.equal(state.items.length,9);
elements['#reset'].events.click(); assert.equal(searchQuery,''); assert.equal(state.items.length,8); assert.ok(state.items.every(i=>i.tier==='pool')); assert.equal(visible().length,8);
console.log('PASS: initial cards, partial search, movement/save, no results, clear, add, case/space handling, empty title, reset');

