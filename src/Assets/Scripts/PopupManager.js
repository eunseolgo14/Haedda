function CreatePopup({
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
    CreatePopup({ title, message, showCancel: false, onConfirm, container });
}

export function ConfirmPopup(title, message, onConfirm, onCancel, container = document.body) {
    CreatePopup({ title, message, showCancel: true, onConfirm, onCancel, container });
}