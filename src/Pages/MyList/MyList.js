import { TaskData, TodoListData, SaveDataToLocalStorage, LoadDataFromLocalStorage, GetTasksByListId, GetListById, UpdateTask }
    from '../../Assets/Scripts/TaskManager.js';

let selectedListId = 0;
let draggedId = null;
let openTaskId = 0;

document.addEventListener('DOMContentLoaded', () => {
    LoadDataFromLocalStorage();

    loadHTML('sidebar', 'ListSideBar.html', () => {
        InitSidebarEvent();
    });

    selectedListId = 1; // 지금은 고정 리스트 ID

    RenderMainList(GetListById(selectedListId));
    RenderTaskCards(GetTasksByListId(selectedListId));
});

function InitSidebarEvent() {
    const mylist_btn = document.querySelector('.sidebar_mylist_btn');
    const ourpage_btn = document.querySelector('.sidebar_ourpage_btn');
    const mypage_btn = document.querySelector('.sidebar_mypage_btn');
    const logout_btn = document.querySelector('.sidebar_logout_btn');

    const mylist_menu = document.querySelector('.sidebar_mylist_menu');

    if (mylist_btn && mylist_menu) {
        mylist_btn.addEventListener('click', () => {
            mylist_menu.classList.toggle('hidden');
        });
    }
}

function RenderMainList(listnode) {
    const listTitle = document.querySelector('.list_title');
    const listStar = document.querySelector('.list_star_btn');
    const listStatus = document.querySelector('.status_filter');
    listTitle.innerHTML = `<h2>${listnode.title}</h2>`;
}

//목록 내 테스크 카드 생성 함수.
function RenderTaskCards(taskArray) {
    const taskListContainer = document.querySelector('.task-list');
    taskListContainer.innerHTML = '';

    //sort_order에 따른 오름차순 정렬.
    const sortedArray = [...taskArray].sort((a, b) => a.sort_order - b.sort_order);

    //task 데이터 html태그 내 동적 삽입.
    sortedArray.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.id = `task-${task.id}`;

        card.innerHTML = `
        <div class="task_main">
            <div class="task_left">
                <div class="task_handle" draggable="true" data-id="${task.id}">☰</div>
                <div class="task_col">
                    <div class="task_title">
                        <b>• ${task.title}</b>
                    </div>
                    <p class="task_category">⟪Category: ${task.category || '없음'}⟫</p>
                </div>
            </div>
            <div class="task_right">
                <div class="task_btn_right">
                    <select class="task_status_select">
                        <option ${task.status === 'TO DO' ? 'selected' : ''}>TO DO</option>
                        <option ${task.status === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                        <option ${task.status === 'PASS' ? 'selected' : ''}>PASS</option>
                    </select>
                    <button class="task_star_btn">★</button>
                </div>
                <span class="task_deadline">⟪Deadline: ${task.due_date || 'NONE'}⟫</span>
            </div>
        </div>
        `;

        //태스크 카드 클릭 이벤트 등록.
        card.addEventListener('click', () => {
            OpenTaskDetail(task);
        });

        //즐겨찾기/중요 버튼 ui업데이트.
        const star_btn = card.querySelector('.task_star_btn');
        if (task.is_important) {
            star_btn.innerHTML = "★";
        } else {
            star_btn.innerHTML = "☆";
        }
        star_btn.addEventListener('click', (e) => {
            e.stopPropagation();

            //즐겨찾기 업데이트.
            let newStar = (star_btn.innerHTML == "★") ? false : true;
            RequestUpdateTask(task.id, { is_important: newStar });
        });

        //진행 상태 select 이벤트 등록.
        card.querySelector('.task_status_select').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        card.querySelector('.task_status_select').addEventListener('change', (e) => {
            const newStatus = e.target.value;
            RequestUpdateTask(task.id, { status: newStatus });
        });


        //카드별 재정렬 핸들 이벤트 등록.
        card.querySelector('.task_handle').addEventListener('dragstart', (e) => {
            //전역 변수 draggedId에 드래그 대상 ID 저장.
            draggedId = parseInt(e.target.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
        });
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.classList.add('drag_over');
        });
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag_over');
        });
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag_over');
            const droppedId = task.id;
            if (draggedId === droppedId) return;

            //sort-id 업데이트, 다시 랜더링.
            ReorderTask(draggedId, droppedId);
        });

        taskListContainer.appendChild(card);
    });

    function CloseTaskDetail() {
        openTaskId = 0;
        const detailPanel = document.querySelector('.task_detail_panel');

        //우측 등장 애니메이션.
        if (detailPanel.classList.contains('show')) {
            detailPanel.classList.remove('show');
            setTimeout(() => {
                detailPanel.classList.add('hidden');
            }, 25);
            return;
        }
    }
    //클릭 시 우측 패널 구성 함수.
    function OpenTaskDetail(taskData) {

        //같은 태스크 더블태핑 => 탭 닫기.
        if (openTaskId == taskData.id) {
            CloseTaskDetail();
            return;
        }
        openTaskId = taskData.id;
        const detailPanel = document.querySelector('.task_detail_panel');


        detailPanel.innerHTML = `
        <div class="task_detail_header">
            <div class="task_title">• ${taskData.title}</div>
            <div class="btn_area">
                <button class="detail_edit_btn">≡</button>
                <ul class="custom_select_options hidden">
                    <li data-value="share">공유하기</li>
                    <div class="option_divider"></div>
                    <li data-value="edit">수정하기</li>
                    <div class="option_divider"></div>
                    <li data-value="delete">삭제하기</li>
                </ul>
                <button class="detail_close_btn">×</button>
            </div>
        </div>
        <div class="task_detail_body">
            <div class="task_detail_category"><b>Category:</b> ${taskData.category}</div>
            <div class="task_detail_deadline"><b>Deadline:</b> ${taskData.due_date || 'NONE'}</div>
            <div class="task_detail_status"><b>Status:</b> ${taskData.status}</div>
            <div class="task_detail_description">
                <b>Description:</b> 
                <p>${taskData.description}</p>
            </div>
            <div class="task_detail_comment">
                <p class="comment_guide"><b>⁕ My Comment</b></p>
                <div class="task_comment"></div>
            </div>
        </div>
        `;

        //댓글 영역 댓글 노드 동적 구성.
        const detailComment = detailPanel.querySelector('.task_comment');
        if (Array.isArray(taskData.comment) && taskData.comment.length > 0) {
            for (let comment of taskData.comment) {
                const span = document.createElement('span');
                span.textContent = comment;
                detailComment.appendChild(span);
            }
        } else {
            detailComment.innerHTML = `<span>No comments yet.</span>`;
        }

       
        detailPanel.querySelector('.detail_edit_btn').addEventListener('click', (e) => {
            e.stopPropagation();
            ClickTaskMenu();
        });

        detailPanel.querySelector('.detail_close_btn').addEventListener('click', () => {
            CloseTaskDetail();
        });

        detailPanel.classList.remove('hidden');
        void detailPanel.offsetWidth;
        detailPanel.classList.add('show');
    }



    //드래그 후 태스크 카드 재정렬 함수.
    function ReorderTask(fromId, toId) {
        // 이동할 태스크 ID 추출(몇번 녀석을 몇번으로 보낼건지).
        const fromIndex = TaskData.findIndex(t => t.id === fromId);
        const toIndex = TaskData.findIndex(t => t.id === toId);

        if (fromIndex === -1 || toIndex === -1) return;

        // fromIndex에 있는 테스크 1개를 잘라내어 moved에 저장, 뒷 녀석들 앞으로 댕겨오기.
        const removedItems = TaskData.splice(fromIndex, 1);

        //주의 =>splice는 배열로 반환, [0]으로 접근해야함.
        const moved = removedItems[0];

        //위에서 담아둔 moved를 toIndex에 끼워넣기.
        TaskData.splice(toIndex, 0, moved);

        //배열 전체 순서대로 sort_order 값 재설정 (1부터 시작!).
        TaskData.forEach((task, index) => {
            task.sort_order = index + 1;
        });

        //태스크의 변경사항 업데이트.
        TaskData.forEach(task => {
            RequestUpdateTask(task.id, { sort_order: task.sort_order });
        });

        //로컬 스토리지에 저장, 카드 재렌더링.
        SaveDataToLocalStorage();
        RenderTaskCards(GetTasksByListId(selectedListId));
    }


    function RequestUpdateTodoList(listId, updates) {
        const updated = UpdateTodoList(listId, updates);
        if (updated) {
            SaveDataToLocalStorage();
            console.log(`리스트 ${listId} 업데이트 완료:`, updated);
            RenderMainList(updated); // 선택적으로 리렌더
        } else {
            console.warn(`리스트 ${listId}는 발견 안 됨.`);
        }
    }

    function RequestUpdateTask(taskId, updates) {
        const updated = UpdateTask(taskId, updates);
        if (updated) {
            SaveDataToLocalStorage();
            console.log(`태스크 ${taskId} 업데이트 완료:`, updated);
            RenderTaskCards(GetTasksByListId(selectedListId)); // 선택적으로 다시 그리기
        } else {
            console.warn(`태스크 ${taskId}는 발견 안 됨.`);
        }
    }

    function ClickTaskMenu() {
        const selectBox = document.querySelector('.custom_select_options');
        selectBox.classList.toggle('hidden');
    }

    function ClickListMenu() {

    }
}