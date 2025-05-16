function loadHTML(target_id, file_path, callback) {
    fetch(file_path)
        .then((result) => result.text())
        .then((data) => {
            document.getElementById(target_id).innerHTML = data;
            if (callback) callback(); // 콜백 실행
        });
}
