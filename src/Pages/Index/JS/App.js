import { LoadHTML } from '../../../Assets/JS/Common.js';
import { InitSidebarEvent } from '../../../Assets/JS/ListSidebar.js';
import { router, navigateTo } from './Router.js';

document.addEventListener('DOMContentLoaded', () => {
    LoadHTML('sidebar', '/src/Assets/HTML/ListSidebar.html', () => {
        InitSidebarEvent({
            onListItemClick: (listId) => navigateTo('mylist', { listId }),
            onAddListClick: () => console.log('➕ Add List Clicked'),
            onOurPageClick: () => navigateTo('ourpage'),
            onMyPageClick: () => navigateTo('mylist'),
        });

        const hash = window.location.hash.slice(1); // #mylist?listId=2
        router(hash || 'mylist');
    });
});