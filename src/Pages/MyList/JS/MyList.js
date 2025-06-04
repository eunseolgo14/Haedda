import {
    TaskData, TodoListData, GetAllList, SaveDataToLocalStorage, LoadDataFromLocalStorage,
    GetTasksByListId, GetListById, GetTaskById, DeleteTask, CreateTask
} from '../../../Assets/JS/TaskManager.js';
import { AlertPopup, ShowAddTaskPopup } from '../../../Assets/JS/PopupManager.js'
import { LoadHTML, IsHexColor } from '../../../Assets/JS/Common.js'
import { InitSidebarEvent } from '../../../Assets/JS/ListSidebar.js'
import { OpenTaskDetail, RequestUpdateTask } from './TaskDetailPanel.js'


export function renderMyList(container, listId) {
    LoadDataFromLocalStorage();

    const list = GetListById(listId);
    if (!list) {
        container.innerHTML = `<p>리스트를 찾을 수 없습니다.</p>`;
        return;
    }

    // 기존 MyList.html의 주요 구조를 innerHTML로 구현
    container.innerHTML = `
    <div class="checkered_bg"></div>
    <div class="list-and-detail-wrap">
      <div class="list_block">
        <div class="list_header">
          <div class="list_title"><h2>${list.title}</h2></div>
          <div class="list_btn_controls">
            <select class="status_filter" id="list_statue_select">
              <option>IN-PROGRESS</option>
              <option>DONE</option>
              <option>PASS</option>
            </select>
            <button class="list_star_btn">★</button>
            <div class="list_menu_wrapper">
              <button class="list_menu_btn">≡</button>
              <ul class="list_menu_option hidden">
                <li data-value="share">공유하기</li>
                <div class="list_menu_divider"></div>
                <li data-value="add">추가하기</li>
                <div class="list_menu_divider"></div>
                <li data-value="edit">수정하기</li>
                <div class="list_menu_divider"></div>
                <li data-value="delete">삭제하기</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="task-list scrollable_element"></div>
      </div>
      <div class="task_detail_panel hidden"></div>
    </div>
  `;

    // 이후 task list 그리기
    const tasks = GetTasksByListId(listId);
    renderTaskCards(container.querySelector('.task-list'), tasks);
}

let selectedListId = 0;
let draggedId = null;

document.addEventListener('DOMContentLoaded', () => {
    LoadDataFromLocalStorage();
    const queryListId = parseInt(getQueryParam("listId"));

    selectedListId = isNaN(queryListId) ? 1 : queryListId;

    LoadHTML('sidebar', '../../../Assets/HTML/ListSidebar.html', () => {
        InitSidebarEvent({
            // 리스트 열고 닫기 토글은 기본 구현 되어 있으므로 생략 가능

            onListItemClick: (listId) => {
                selectedListId = parseInt(listId);
                RenderMainList(GetListById(selectedListId));
                RenderTaskCards(GetTasksByListId(selectedListId));
            },

            onAddListClick: () => {
                const title = GetListById(selectedListId).title;
                ShowAddTaskPopup(title, () => {
                    RequestCreateTask();
                }, () => { }, document.querySelector('.content_area'));
            },

            onOurPageClick: () => {
                window.location.href = '../../OurPage/HTML/OurPage.html';
            },

            onMyPageClick: () => {
                window.location.href = 'MyPage.html';
            }
        });
    });

    document.addEventListener("click", (e) => {
        closeOutside(e);
    });
    const list_menu = document.querySelector('.list_menu_option');
    document.querySelector('.list_menu_btn').addEventListener('click', (e) => {
        e.stopPropagation();
        ClickListMenu();
    });

    list_menu.querySelector(' [data-value="share"]').addEventListener('click', () => {
        list_menu.classList.add('hidden');
    });
    list_menu.querySelector(' [data-value="add"]').addEventListener('click', () => {

        const title = GetListById(selectedListId).title;
        ShowAddTaskPopup(title, () => {
            RequestCreateTask();
        }, () => {
        }, document.querySelector('.content_area'));
        list_menu.classList.add('hidden');
    });
    list_menu.querySelector(' [data-value="edit"]').addEventListener('click', () => {
        list_menu.classList.add('hidden');
    });
    list_menu.querySelector(' [data-value="delete"]').addEventListener('click', () => {
        list_menu.classList.add('hidden');
    });


    RenderMainList(GetListById(selectedListId));
    RenderTaskCards(GetTasksByListId(selectedListId));
});

function closeOutside(event) {

    //닫을 것들: 리스트 메뉴, 디테일 메뉴, 태스크 카드 메뉴.
    const list_menu = document.querySelector('.list_menu_option');
    const detail_menu = document.querySelector('.custom_select_options');

    if (list_menu != null && !list_menu.contains(event.target)) {
        list_menu.classList.add("hidden");
    }

    if (detail_menu != null && !detail_menu.contains(event.target)) {
        detail_menu.classList.add("hidden");
    }
}



function RenderMainList(listnode) {
    const listTitle = document.querySelector('.list_title');
    const listStar = document.querySelector('.list_star_btn');
    const listStatus = document.querySelector('.status_filter');
    listTitle.innerHTML = `<h2>${listnode.title}</h2>`;
}

//목록 내 테스크 카드 생성 함수.
export function RenderTaskCards(taskArray) {
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
        <div class="task_tag"></div>
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
                        <option value="IDEA" ${task.status === 'IDEA' ? 'selected' : ''}>아이디어</option>
                        <option value="IN-PROGRESS" ${task.status === 'IN-PROGRESS' ? 'selected' : ''}>진행 중</option>
                        <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>완료</option>
                        <option value="PASS" ${task.status === 'PASS' ? 'selected' : ''}>지나가기</option>

                    </select>
                    <button class="task_star_btn">★</button>
                </div>
                <span class="task_deadline">⟪Deadline: ${task.due_date || '없음'}⟫</span>
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
            RequestUpdateTask(task.todo_list_id, task.id, { is_important: newStar });
        });

        //진행 상태 select 이벤트 등록.
        card.querySelector('.task_status_select').addEventListener('click', (e) => {
            e.stopPropagation();
        });
        card.querySelector('.task_status_select').addEventListener('change', (e) => {
            const newStatus = e.target.value;
            RequestUpdateTask(task.todo_list_id, task.id, { status: newStatus });
            OpenTaskDetail(GetTaskById(task.id), true);
            // RenderTaskCards(GetTasksByListId(selectedListId));

        });

        const tag = card.querySelector('.task_tag');
        if (IsHexColor(task.tag_color)) {
            tag.style.backgroundColor = task.tag_color;
        } else {
            tag.style.backgroundColor = "#ffffff";
        }


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
        RequestUpdateTask(task.todo_list_id, task.id, { sort_order: task.sort_order });
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


function RequestCreateTask() {
    const title = document.querySelector('#task_title').value.trim();
    const description = document.querySelector('#task_desc').value.trim();
    const todo_list_id = selectedListId;
    const category = document.querySelector('#task_category').value.trim(); // (만약 필요하다면)
    const tag_color = document.querySelector('#task_color').value;
    const is_deadline = document.querySelector('#is_task_deadline').checked;
    const due_date = is_deadline ? document.querySelector('#task_deadline_date').value : "";
    const status = document.querySelector('#task_status').value;

    const save = CreateTask({
        todo_list_id,
        title,
        tag_color,
        category,
        description,
        status,
        due_date
    });

    if (save) {
        SaveDataToLocalStorage();
        console.log(`태스크 저장 완료:`, save);
        RenderTaskCards(GetTasksByListId(todo_list_id));
    } else {
        console.warn(`태스크 저장 오류!`);
    }
}

export function RequestDeleteTask(taskId) {
    DeleteTask(taskId);
    SaveDataToLocalStorage();
    RenderTaskCards(GetTasksByListId(selectedListId));
}

function ClickListMenu() {
    const menu = document.querySelector('.list_menu_option');
    menu.classList.toggle('hidden');
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}