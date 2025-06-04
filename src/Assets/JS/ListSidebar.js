import { GetAllList } from '../JS/TaskManager.js';


export function InitSidebarEvent(callbacks = {}) {
    const {
        onListToggle,
        onListItemClick,
        onAddListClick,
        onOurPageClick,
        onMyPageClick,
        onLogoutClick
    } = callbacks;

    const mylist_btn = document.querySelector('.sidebar_mylist_btn');
    const ourpage_btn = document.querySelector('.sidebar_ourpage_btn');
    const mypage_btn = document.querySelector('.sidebar_mypage_btn');
    const logout_btn = document.querySelector('.sidebar_logout_btn');
    const mylist_menu = document.querySelector('.sidebar_mylist_menu');

    // 1. 리스트 토글 버튼
    if (mylist_btn && mylist_menu) {
        mylist_btn.addEventListener('click', () => {
            if (onListToggle) onListToggle(mylist_menu);
            else mylist_menu.classList.toggle('hidden'); // 기본 동작
        });
    }

    // 2. 버튼들
    if (ourpage_btn && onOurPageClick) {
        ourpage_btn.addEventListener('click', onOurPageClick);
    }
    if (mypage_btn && onMyPageClick) {
        mypage_btn.addEventListener('click', onMyPageClick);
    }
    if (logout_btn && onLogoutClick) {
        logout_btn.addEventListener('click', onLogoutClick);
    }

    // 3. 리스트 메뉴 초기화
    mylist_menu.innerHTML = '';

    const allLists = GetAllList();

    allLists.forEach(list => {
        const listItem = document.createElement('div');
        listItem.className = 'sidebar_mylist_item';
        listItem.dataset.id = list.id;

        const icon = document.createElement('div');
        icon.className = 'sun_list_icon';

        const title = document.createElement('p');
        title.textContent = list.title;

        listItem.appendChild(icon);
        listItem.appendChild(title);
        mylist_menu.appendChild(listItem);

        listItem.addEventListener('click', () => {
            if (onListItemClick) onListItemClick(list.id);
            else window.location.href = `MyList.html?listId=${list.id}`;
        });
    });

    // ✅ 4. "새 리스트 만들기" 버튼 추가 (클래스 유지)
    const addNewBtn = document.createElement('div');
    addNewBtn.className = 'sidebar_mylist_add_new';
    addNewBtn.id = 'add_new';

    const icon = document.createElement('div');
    icon.className = 'plus_list_icon';

    const title = document.createElement('p');
    title.textContent = '새 리스트 만들기';

    addNewBtn.appendChild(icon);
    addNewBtn.appendChild(title);
    mylist_menu.appendChild(addNewBtn);

    if (onAddListClick) {
        addNewBtn.addEventListener('click', onAddListClick);
    }
}