const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// Shared navigation and demo community data.
$('.menu-toggle')?.addEventListener('click', () => $('.nav')?.classList.toggle('nav-open'));
const seedPosts = [
  { id: 'n1', category: '공지사항', title: '파도끝 커뮤니티에 오신 것을 환영합니다', author: '파도끝지기', date: '2026.11.06', views: 128, content: '바다를 좋아하는 분들의 공간, 파도끝에 오신 것을 환영합니다. 안전한 출조와 따뜻한 소통을 함께 만들어가요.' },
  { id: 'n2', category: '공지사항', title: '안전한 바다낚시를 위한 커뮤니티 이용 안내', author: '파도끝지기', date: '2026.11.06', views: 86, content: '출조 전 기상과 물때를 확인하고, 구명조끼를 꼭 착용해 주세요. 지역과 계절별 금어기 및 포획 제한은 최신 안내를 확인해 주세요.' },
  { id: 'n3', category: '조행기', title: '새벽 바다에서 만난 첫 입질', author: '파도친구', date: '2026.11.05', views: 42, content: '새벽 공기를 맞으며 방파제에 도착했어요. 해가 떠오를 무렵 전해진 첫 입질, 오래 기억에 남을 하루였습니다.' },
  { id: 'n4', category: '질문답변', title: '초보자 선상낚시 준비물 궁금해요', author: '푸른물결', date: '2026.11.04', views: 31, content: '멀미약과 모자, 선크림은 꼭 챙기세요. 낚싯대 대여 여부는 출조점에 미리 문의하면 편리합니다.' },
  { id: 'n5', category: '자유게시판', title: '이번 주말 어디로 출조하시나요?', author: '바다산책', date: '2026.11.03', views: 19, content: '날씨가 좋으면 남해 쪽으로 다녀올까 합니다. 모두 안전하고 즐거운 출조 되세요!' }
];
const getPosts = () => { const saved = read('padokeut-posts', null); if (saved) return saved; write('padokeut-posts', seedPosts); return seedPosts; };
const currentUser = () => read('padokeut-current-user', null);

if (document.body.dataset.page === 'account') {
  let mode = 'login';
  const form = $('#account-form'), message = $('#account-message'), nameField = $('#name-field');
  const renderAccount = () => {
    const user = currentUser();
    $('#account-logged-out').hidden = !!user; $('#account-logged-in').hidden = !user;
    if (user) $('#member-name').textContent = user.name;
  };
  const setMode = next => {
    mode = next; $$('.account-tab').forEach(b => b.classList.toggle('selected', b.dataset.mode === mode));
    nameField.hidden = mode !== 'signup'; $('#account-password').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
    $('.account-submit').innerHTML = `${mode === 'signup' ? '회원가입' : '로그인'} <span>↗</span>`; message.textContent = '';
  };
  $$('.account-tab').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  form.addEventListener('submit', e => {
    e.preventDefault(); const email = $('#account-email').value.trim().toLowerCase(), password = $('#account-password').value;
    const users = read('padokeut-users', []);
    if (mode === 'signup') {
      if (users.some(u => u.email === email)) { message.textContent = '이미 가입된 이메일입니다.'; return; }
      const user = { email, password, name: $('#account-name').value.trim() || email.split('@')[0] };
      users.push(user); write('padokeut-users', users); write('padokeut-current-user', { email, name: user.name }); renderAccount();
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) { message.textContent = '이메일 또는 비밀번호를 확인해 주세요.'; return; }
      write('padokeut-current-user', { email, name: user.name }); renderAccount();
    }
  });
  $('#logout-button').addEventListener('click', () => { localStorage.removeItem('padokeut-current-user'); renderAccount(); }); renderAccount();
}

if (document.body.dataset.page === 'board') {
  const list = $('#post-list'), detail = $('#post-detail'); let category = '전체';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const render = () => {
    const posts = getPosts().filter(p => category === '전체' || p.category === category);
    list.innerHTML = posts.map(p => `<tr><td><span class="category-chip ${p.category === '공지사항' ? 'chip-notice' : ''}">${esc(p.category)}</span></td><td><button class="post-title" data-post="${esc(p.id)}">${esc(p.title)}</button></td><td>${esc(p.author)}</td><td>${esc(p.date)}</td><td>${p.views}</td></tr>`).join('');
    $('#post-count').textContent = `게시글 ${posts.length}개`;
  };
  $$('.board-tab').forEach(btn => btn.addEventListener('click', () => { category = btn.dataset.category; $$('.board-tab').forEach(b => b.classList.toggle('selected', b === btn)); detail.hidden = true; render(); }));
  list.addEventListener('click', e => {
    const button = e.target.closest('[data-post]'); if (!button) return;
    const posts = getPosts(), post = posts.find(p => p.id === button.dataset.post); if (!post) return;
    post.views++; write('padokeut-posts', posts);
    detail.innerHTML = `<div class="detail-head"><span class="category-chip">${esc(post.category)}</span><h2>${esc(post.title)}</h2><p>${esc(post.author)} · ${esc(post.date)} · 조회 ${post.views}</p></div><div class="detail-body">${esc(post.content).replace(/\n/g, '<br>')}</div><button class="detail-close">목록으로 돌아가기</button>`;
    detail.hidden = false; detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); render();
  });
  detail.addEventListener('click', e => { if (e.target.closest('.detail-close')) detail.hidden = true; });
  const dialog = $('#post-dialog');
  $('#write-post').addEventListener('click', () => { if (!currentUser()) { location.href = 'account.html'; return; } dialog.showModal(); });
  $('#post-form').addEventListener('submit', e => {
    e.preventDefault(); const user = currentUser(); if (!user) return;
    const posts = getPosts(); posts.unshift({ id: `p${Date.now()}`, category: $('#post-category').value, title: $('#post-title').value.trim(), content: $('#post-content').value.trim(), author: user.name, date: new Date().toLocaleDateString('ko-KR').replaceAll('. ', '.').replace(/\.$/, ''), views: 0 });
    write('padokeut-posts', posts); e.target.reset(); dialog.close(); category = '전체'; $$('.board-tab').forEach(b => b.classList.toggle('selected', b.dataset.category === category)); detail.hidden = true; render();
  }); render();
}
