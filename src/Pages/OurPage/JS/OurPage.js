import { InitSidebarEvent } from '../../../Assets/JS/ListSidebar.js'
import { LoadHTML } from '../../../Assets/JS/Common.js'


document.addEventListener('DOMContentLoaded', () => {
    LoadHTML('sidebar', '../../../Assets/HTML/ListSidebar.html', () => {
        InitSidebarEvent({
            // 리스트 열고 닫기 토글은 기본 구현 되어 있으므로 생략 가능

            onListItemClick: (listId) => {
                // selectedListId = parseInt(listId);
                // RenderMainList(GetListById(selectedListId));
                // RenderTaskCards(GetTasksByListId(selectedListId));

                window.location.href = `../../MyList/HTML/MyList.html?listId=${ parseInt(listId)}`;
            },

            onAddListClick: () => {
                const title = GetListById(selectedListId).title;
                ShowAddTaskPopup(title, () => {
                    RequestCreateTask();
                }, () => { }, document.querySelector('.content_area'));
            },

            onOurPageClick: () => {
                window.location.href = 'OurPage.html';
            },

            onMyPageClick: () => {
                window.location.href = 'MyPage.html';
            }
        });
    });
});

export function renderOurPage(container, listId) {
  
}