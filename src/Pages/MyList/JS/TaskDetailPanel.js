import { GetTaskById, GetTasksByListId, UpdateTask, SaveDataToLocalStorage } from '../../../Assets/JS/TaskManager.js';
import { RenderTaskCards, RequestDeleteTask } from './MyList.js'
import { ConfirmPopup } from '../../../Assets/JS/PopupManager.js'

export const STATUS_LABELS = {
    'IDEA': '아이디어',
    'IN-PROGRESS': '진행 중',
    'DONE': '완료',
    'PASS': '지나가기',
    'NONE': '없음' // 혹시 대비.
};


let openTaskId = 0;

//클릭 시 우측 패널 구성 함수.
export function OpenTaskDetail(taskData, is_forceOpen = false) {

    //같은 태스크 더블태핑 + 강제 열기 거짓 => 탭 닫기.
    console.log(taskData);
    if (!is_forceOpen && openTaskId == taskData.id) {
        openTaskId = 0;
        CloseTaskDetail();
        return;
    }

    if (taskData == null) {
        //사이드 패널이 닫혀있는 상태, 업데이트 불필요.
        return;
    }
    openTaskId = taskData.id;
    const detailPanel = document.querySelector('.task_detail_panel');
    detailPanel.innerHTML = `
        <div class="task_detail_tag"></div>
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
            <div class="task_detail_category"><b>Category:</b> ${taskData.category || '없음'}</div>
            <div class="task_detail_deadline"><b>Deadline:</b> ${taskData.due_date || '없음'}</div>
            <div class="task_detail_status"><b>Status:</b> ${STATUS_LABELS[taskData.status] || taskData.status}</div>
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

    const tag = detailPanel.querySelector('.task_detail_tag');
    if (taskData.tag_color) {
        tag.style.backgroundColor = taskData.tag_color;
    }

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
        ClickTaskMenu(taskData.id);
    });

    detailPanel.querySelector('.detail_close_btn').addEventListener('click', () => {
        CloseTaskDetail();
    });

    detailPanel.classList.remove('hidden');
    void detailPanel.offsetWidth;
    detailPanel.classList.add('show');
}

function CloseTaskDetail() {
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

function ClickTaskMenu(taskId) {
    const menu = document.querySelector('.custom_select_options');
    menu.classList.toggle('hidden');

    const editBtn = menu.querySelector('[data-value="edit"]');
    const deleteBtn = menu.querySelector('[data-value="delete"]');

    // 이미 리스너가 등록된 경우 방지하기 위한 체크
    if (!editBtn.dataset.bound) {
        editBtn.addEventListener('click', () => {
            EditTaskDetail(taskId);
            menu.classList.add('hidden');
        });
        editBtn.dataset.bound = "true"; // 등록되었음을 표시
    }

    if (!deleteBtn.dataset.bound) {
        deleteBtn.addEventListener('click', () => {
            const title = GetTaskById(taskId).title;
            ConfirmPopup("태스크 삭제", `정말 [${title}] 태스크를 삭제하시겠습니까?`, () => {
                RequestDeleteTask(taskId);
                CloseTaskDetail();
            }, () => {
            }, document.querySelector('.content_area'));
        });
        deleteBtn.dataset.bound = "true"; // 중복 방지 플래그
    }
}

//#region EDIT_PANEL

function EditTaskDetail(taskId) {
    const taskData = GetTaskById(taskId);
    if (!taskData) return;

    // comment가 빈 경우 빈 배열로 초기화.
    taskData.comment = Array.isArray(taskData.comment) ? taskData.comment : [];

    const detailPanel = document.querySelector('.task_detail_panel');

    detailPanel.innerHTML = `
            <div class="task_detail_header">
                <input type="text" class="edit_title_input" value="${taskData.title}">
            </div>
            <div class="task_detail_body">
                <div class="task_detail_category"><b>Category:</b> <input class="edit_category_input" value="${taskData.category || ''}"></div>
                <div class="task_detail_deadline"><b>Deadline:</b> <input type="date" class="edit_deadline_input" value="${taskData.due_date || ''}"></div>
                <div class="task_detail_status"><b>Status:</b> 
                    <select class="edit_status_input">
                        ${Object.entries(STATUS_LABELS).map(([key, label]) =>
                        `<option value="${key}" ${taskData.status === key ? 'selected' : ''}>${label}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="task_detail_tag_color">
                    <b>Tag Color:</b>
                    <input type="color" class="edit_tag_color_input" value="${taskData.tag_color || '#70b4e5'}">
                </div>
            </div>
            <div class="task_detail_description "><b>Description:</b> <textarea class="edit_description_input scrollable_element">${taskData.description || ''}</textarea></div>

            <div class="task_detail_comment scrollable_element">
                <p class="comment_guide"><b>⁕ My Comment</b></p>
                <div class="task_comment_edit_area">
                    ${taskData.comment.map((comment_item, idx) => `
                        <div class="comment_row">
                            <textarea value="${comment_item}" data-index="${idx}" class="comment_input scrollable_element">${comment_item}</textarea>
                            <button class="delete_comment_btn" data-index="${idx}">×</button>
                        </div>
                    `).join('')}
                </div>
                <div class="comment_add_area">
                    <textarea class="new_comment_input" placeholder="새 댓글 입력..." ></textarea>
                    <button class="add_comment_btn">+</button>
                </div>
            </div>
            <div class ="edit_button_area">
            <button class="detail_cancle_btn">취소</button>
                <button class="detail_save_btn">저장</button>
            </div>
        `;

    // 저장 버튼 이벤트.
    detailPanel.querySelector('.detail_save_btn').addEventListener('click', () => {
        const updates = {
            title: detailPanel.querySelector('.edit_title_input').value.trim(),
            category: detailPanel.querySelector('.edit_category_input').value.trim(),
            due_date: detailPanel.querySelector('.edit_deadline_input').value,
            status: detailPanel.querySelector('.edit_status_input').value,
            tag_color: detailPanel.querySelector('.edit_tag_color_input').value,
            description: detailPanel.querySelector('.edit_description_input').value.trim(),
            comment: [...detailPanel.querySelectorAll('.comment_input')].map(input => input.value.trim())
        };

        RequestUpdateTask(taskData.todo_list_id, taskId, updates);
        //동일 태스크 패널 열기 => 강제로 열어두기 참.
        OpenTaskDetail(GetTaskById(taskId), true);
    });

    // 댓글 삭제 버튼 이벤트.
    detailPanel.querySelectorAll('.delete_comment_btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            taskData.comment.splice(idx, 1);
            EditTaskDetail(taskId);
        });
    });

    // 댓글 추가.
    detailPanel.querySelector('.add_comment_btn').addEventListener('click', () => {
        const newCommentInput = detailPanel.querySelector('.new_comment_input');
        const newComment = newCommentInput.value.trim();
        if (newComment !== '') {
            taskData.comment.push(newComment);
            newCommentInput.value = '';
            EditTaskDetail(taskId);
        }
    });

    // 닫기.
    detailPanel.querySelector('.detail_cancle_btn').addEventListener('click', () => {
        OpenTaskDetail(GetTaskById(taskId), taskId, true);
    });
}

export function RequestUpdateTask(listId, taskId, updates) {
    
    
    const updated = UpdateTask(taskId, updates);
    if (updated) {
        SaveDataToLocalStorage();
        console.log(`태스크 ${taskId} 업데이트 완료:`, updated);
        RenderTaskCards(GetTasksByListId(listId)); // 선택적으로 다시 그리기
    } else {
        console.warn(`태스크 ${taskId}는 발견 안 됨.`);
    }
}

//#endregion
