// src/Pages/MyList/MyListView.js

import {
    TaskData,
    SaveDataToLocalStorage,
    LoadDataFromLocalStorage,
    GetTasksByListId,
    GetListById,
    GetTaskById,
    DeleteTask,
    CreateTask,
    UpdateTodoList
} from '../../../Assets/JS/TaskManager.js';

import { ShowAddTaskPopup } from '../../../Assets/JS/PopupManager.js';
import { IsHexColor } from '../../../Assets/JS/Common.js';

let selectedListId = 0;
let draggedId = null;

export function renderMyList(container, listId) {
    LoadDataFromLocalStorage();
    selectedListId = listId;
    const list = GetListById(listId);

    if (!list) {
        container.innerHTML = '<p>리스트를 찾을 수 없습니다.</p>';
        return;
    }

    container.innerHTML = `
    <div class="list_container">
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
          <div class="task_list_wrapper">
                <div class="top_scroll_gradient"></div>
                <div class="task_list scrollable_element"></div>
                <div class="bottom_scroll_gradient"></div>
          <div>

          
        </div>

        <div class="task_detail_panel hidden"></div>
      </div>

      <div class="popup create-list-popup hidden">
        <h3>Your list name is...</h3>
        <textarea placeholder="Type your list name here."></textarea>
        <button class="btn create-list-btn">CREATE</button>
        <button class="close-btn">×</button>
      </div>
    </div>
  `;

    const taskList = container.querySelector('.task_list');
    renderTaskCards(taskList, GetTasksByListId(selectedListId));

    document.addEventListener('click', (e) => {
        closeOutside(e);
    });

    const listMenuBtn = container.querySelector('.list_menu_btn');
    listMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        container.querySelector('.list_menu_option')?.classList.toggle('hidden');
    });

    container.querySelector('[data-value="add"]')?.addEventListener('click', () => {
        const title = GetListById(selectedListId).title;
        ShowAddTaskPopup(title, () => {
            RequestCreateTask();
        }, () => { }, container);
        container.querySelector('.list_menu_option').classList.add('hidden');
    });

    ['share', 'edit', 'delete'].forEach(key => {
        container.querySelector(`[data-value="${key}"]`)?.addEventListener('click', () => {
            container.querySelector('.list_menu_option').classList.add('hidden');
        });
    });
}

function closeOutside(event) {
    const list_menu = document.querySelector('.list_menu_option');
    const detail_menu = document.querySelector('.custom_select_options');

    if (list_menu && !list_menu.contains(event.target)) {
        list_menu.classList.add('hidden');
    }
    if (detail_menu && !detail_menu.contains(event.target)) {
        detail_menu.classList.add('hidden');
    }
}

function renderTaskCards(container, taskArray) {
    container.innerHTML = '';

    const sortedArray = [...taskArray].sort((a, b) => a.sort_order - b.sort_order);

    sortedArray.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task_card';
        card.id = `task-${task.id}`;

        card.innerHTML = `
        <div class="task_tag"></div>
        <div class="task_main">
            <div class="task_left">
            <div class="drag_handle" draggable="true" data-id="${task.id}">☰</div>
            <div class="task_col">
                <div class="task_title"><b>• ${task.title}</b></div>
                <p class="category_label">⟪Category: ${task.category || '없음'}⟫</p>
            </div>
            </div>
            <div class="task_right">
            <div class="task_btn_right">
                <select class="status_select">
                <option value="IDEA" ${task.status === 'IDEA' ? 'selected' : ''}>아이디어</option>
                <option value="IN-PROGRESS" ${task.status === 'IN-PROGRESS' ? 'selected' : ''}>진행 중</option>
                <option value="DONE" ${task.status === 'DONE' ? 'selected' : ''}>완료</option>
                <option value="PASS" ${task.status === 'PASS' ? 'selected' : ''}>지나가기</option>
                </select>
                <button class="important_btn">${task.is_important ? '★' : '☆'}</button>
            </div>
            <span class="task_deadline">⟪Deadline: ${task.due_date || '없음'}⟫</span>
            </div>
        </div>
        `;

        card.addEventListener('click', () => openTaskDetailPanel(task));

        card.querySelector('.important_btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const newStar = !task.is_important;
            RequestUpdateTask(task.todo_list_id, task.id, { is_important: newStar });
        });

        const statusSelect = card.querySelector('.status_select');
        statusSelect.addEventListener('click', e => e.stopPropagation());
        statusSelect.addEventListener('change', (e) => {
            RequestUpdateTask(task.todo_list_id, task.id, { status: e.target.value });
            openTaskDetailPanel(GetTaskById(task.id), true);
        });

        const tag = card.querySelector('.task_tag');
        tag.style.backgroundColor = IsHexColor(task.tag_color) ? task.tag_color : '#ffffff';

        const handle = card.querySelector('.drag_handle');
        handle.addEventListener('dragstart', (e) => {
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
            if (draggedId !== droppedId) reorderTask(draggedId, droppedId);
        });

        container.appendChild(card);
    });
}

function openTaskDetailPanel(task, preserveScroll = false) {
    const panel = document.querySelector('.task_detail_panel');
    if (!panel) return;

    panel.classList.remove('hidden');
    panel.classList.add('show');

    panel.innerHTML = `
    <div class="task_detail_header">
      <div class="task_title">${task.title}</div>
      <button class="close-btn">×</button>
    </div>
    <div class="task_detail_body">
      <div class="task_detail_category"><b>Category:</b> ${task.category || ''}</div>
      <div class="task_detail_deadline"><b>Deadline:</b> ${task.due_date || ''}</div>
      <div class="task_detail_status"><b>Status:</b> ${task.status}</div>
      <div class="task_detail_description"><b>Description:</b><p>${task.description || ''}</p></div>
      <div class="task_detail_comment">
        <p>${task.comment?.join('<br>') || ''}</p>
      </div>
    </div>
  `;

    panel.querySelector('.close-btn').addEventListener('click', () => {
        panel.classList.remove('show');
    });
}

function reorderTask(fromId, toId) {
    const fromIndex = TaskData.findIndex(t => t.id === fromId);
    const toIndex = TaskData.findIndex(t => t.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = TaskData.splice(fromIndex, 1);
    TaskData.splice(toIndex, 0, moved);

    TaskData.forEach((task, i) => task.sort_order = i + 1);

    TaskData.forEach(task => {
        RequestUpdateTask(task.todo_list_id, task.id, { sort_order: task.sort_order });
    });

    SaveDataToLocalStorage();
    renderTaskCards(document.querySelector('.task_list'), GetTasksByListId(selectedListId));
}

function RequestCreateTask() {
    const title = document.querySelector('#task_title').value.trim();
    const description = document.querySelector('#task_desc').value.trim();
    const todo_list_id = selectedListId;
    const category = document.querySelector('#task_category').value.trim();
    const tag_color = document.querySelector('#task_color').value;
    const is_deadline = document.querySelector('#is_task_deadline').checked;
    const due_date = is_deadline ? document.querySelector('#task_deadline_date').value : "";
    const status = document.querySelector('#task_status').value;

    const save = CreateTask({
        todo_list_id, title, tag_color, category, description, status, due_date
    });

    if (save) {
        SaveDataToLocalStorage();
        renderTaskCards(document.querySelector('.task_list'), GetTasksByListId(todo_list_id));
    } else {
        console.warn(`태스크 저장 오류!`);
    }
}

export function RequestDeleteTask(taskId) {
    DeleteTask(taskId);
    SaveDataToLocalStorage();
    renderTaskCards(document.querySelector('.task_list'), GetTasksByListId(selectedListId));
}

function RequestUpdateTodoList(listId, updates) {
    const updated = UpdateTodoList(listId, updates);
    if (updated) {
        SaveDataToLocalStorage();
        renderMyList(document.querySelector('#content_area'), updated.id);
    }
}
