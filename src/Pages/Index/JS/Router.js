import { renderMyList } from '../../MyList/JS/MyList_BU.js';
import { renderOurPage } from '../../OurPage/JS/OurPage.js';

export function navigateTo(routeName, params = {}) {
    const hash = `#${routeName}${params.listId ? `?listId=${params.listId}` : ''}`;
    window.location.hash = hash;
    router(hash.slice(1));
}

export function router(route) {
    const [name, query] = route.split('?');
    const params = new URLSearchParams(query);

    const contentArea = document.getElementById('content');
    contentArea.innerHTML = ''; // 페이지 비우기

    switch (name) {
        case 'mylist':
            renderMyList(contentArea, parseInt(params.get('listId')) || 1);
            break;
        case 'ourpage':
            renderOurPage(contentArea);
            break;
        default:
            contentArea.innerHTML = '<p>페이지를 찾을 수 없습니다.</p>';
    }
}