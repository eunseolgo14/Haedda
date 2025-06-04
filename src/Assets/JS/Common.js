export function LoadHTML(target_id, file_path, callback) {
    fetch(file_path)
        .then((result) => result.text())
        .then((data) => {
            document.getElementById(target_id).innerHTML = data;
            if (callback) callback(); // 콜백 실행
        });
}

export function IsHexColor(str) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str);
}
