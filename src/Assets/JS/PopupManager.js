function CreateDefaultPopup({
    title = "알림",
    message = "내용 없음",
    showCancel = false,
    onConfirm = () => { },
    onCancel = null,
    container = document.body, // ⭐ 디폴트는 body지만 타겟도 가능
}) {
    const overlay = document.createElement("div");
    overlay.className = "modal_overlay";

    overlay.innerHTML = `
    <div class="modal_window">
      <h3>${title}</h3>
      <div class="popup_divider"></div>
      <p>${message}</p>
      <div class="popup_divider"></div>
      <div class="popup_buttons">
        ${showCancel ? '<button class="cancel_btn">취소</button>' : ""}
        <div class="popup_divider_btn"></div>
        <button class="confirm_btn">확인</button>
      </div>
    </div>
  `;

    // 이벤트 연결
    overlay.querySelector(".confirm_btn").addEventListener("click", () => {
        onConfirm();
        container.removeChild(overlay);
    });

    if (showCancel && onCancel) {
        overlay.querySelector(".cancel_btn").addEventListener("click", () => {
            onCancel();
            container.removeChild(overlay);
        });
    }

    //모달 밖 배경 클릭 시 팝업 지우기.
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            onCancel?.();
            container.removeChild(overlay);
        }
    });

    // 🔽 append 위치는 전달된 타겟
    container.appendChild(overlay);
}

// 외부 공개용 함수
export function AlertPopup(title, message, onConfirm, container = document.body) {
    CreateDefaultPopup({ title, message, showCancel: false, onConfirm, container });
}

export function ConfirmPopup(title, message, onConfirm, onCancel, container = document.body) {
    CreateDefaultPopup({ title, message, showCancel: true, onConfirm, onCancel, container });
}

function CreateAddTaskPopup({
    category = "카테고리",
    allowEscape = false,
    onConfirm = () => { },
    onCancel = null,
    container = document.body, // ⭐ 디폴트는 body지만 타겟도 가능
}) {
    console.log(category);

    const overlay = document.createElement("div");
    overlay.className = "modal_overlay";

    overlay.innerHTML = `
    <div class="modal_window">
        <div class="add_task_header">
            <h3>테스크 추가하기</h3>
            <button class="add_task_cancel_btn">×</button>
        </div>
        <div class="popup_divider"></div>
        <div class="add_info_area">
            <div class="add_task_input">
                <b>할 일 제목:</b>
                <input id="task_title" class="add_task_title" type="text"></input>
            </div>
            <div class="add_task_input description_box">
                <b>할 일 설명글:</b>
                <textarea id="task_desc" class="add_task_desc" placeholder="Write your task here."></textarea>
            </div>
            <div class="add_task_input">
                <b>할 일 목록:</b>
                <span id="task_parent_list">${category}</span>
            </div>
            <div class="add_task_input">
                <b>카테고리:</b>
                <input id="task_category" class="add_task_category" type="text"></input>
            </div>
            <div class="add_task_input">
                <b>태그 색상:</b>
                <input id="task_color" class="add_task_color" type="color"></input>
            </div>
            <div class="add_task_input">
                <b>마감일:</b>
                <input id="is_task_deadline" type="checkbox">
                <div class="hidden">
                    <input id="task_deadline_date" type="date"></input>
                </div>
            </div>
            <div class="add_task_input">
                <b>상태:</b>
                <select id="task_status" class="add_task_status">TO DO
                    <option value="IDEA">아이디어</option>
                    <option value="IN-PROGRESS" >진행 중</option>
                    <option value="DONE">완료</option>
                    <option value="PASS">지나가기</option>
                </select>
            </div>
        </div>
        <div class="popup_divider"></div>
        <div class="popup_buttons">
            <button class="add_task_confirm_btn">확인</button>
        </div>
    </div>
`;

    // 이벤트 연결
    overlay.querySelector(".add_task_confirm_btn").addEventListener("click", () => {
        onConfirm();
        container.removeChild(overlay);
    });

    overlay.querySelector(".add_task_cancel_btn").addEventListener("click", () => {
        onCancel();
        container.removeChild(overlay);
    });

    if (allowEscape) {
        //모달 밖 배경 클릭 시 팝업 지우기.
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                onCancel?.();
                container.removeChild(overlay);
            }
        });
    }


    // 🔽 append 위치는 전달된 타겟
    container.appendChild(overlay);
}

export function ShowAddTaskPopup(category, onConfirm, onCancel, container = document.body) {
    CreateAddTaskPopup({ category, allowEscape: false, onConfirm, onCancel, container });
}