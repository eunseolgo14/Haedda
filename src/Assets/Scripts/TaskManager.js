// 더미 TodoList.
export const TodoListData = [
    {
        id: 1,
        user_id: 1,
        title: "더이상 미룰 수 없는 집안일 리스트 두글자가 되면 얼마나 길어질지 확인해볼까요",
        description: "해야 할 집안일",
        created_at: "2025-05-15",
        is_important: false,
        is_public: false
    }
];

// 더미 Task.
export const TaskData = [
    {
        id: 1,
        todo_list_id: 1,
        sort_order: 1,
        title: "1.집 가서 빨래 널기",
        category: "집안일",
        description: "세탁기 돌린 빨래를 널자. 이렇게 미루다가는 걸칠 거적대기도 없는 암울한 미래가 나를 기다린다는 것을 명심하라.",
        status: "IN PROGRESS",
        is_important: true,
        due_date: "2025-06-01",
        created_at: "2025-05-15",
        comment: [
            "인생이란 무엇일까",
            "난 왜 설거지를 해야하는걸까 인생 참 힘들다...",
            "학교에서 급식을 먹었ㄴ을떄가 참 좋았던 것 같아"
        ]
    },
    {
        id: 2,
        todo_list_id: 1,
        sort_order: 2,
        title: "2.설거지 하기",
        category: "집안일",
        description: "저녁 먹고 바로 설거지하자.",
        status: "TO DO",
        is_important: false,
        due_date: "2025-06-01",
        created_at: "2025-05-15",
        comment: [
            "인생이란 무엇일까",
            "난 왜 설거지를 해야하는걸까 인생 참 힘들다...",
            "학교에서 급식을 먹었을떄가 참 좋았던 것 같아"
        ]
    },
    {
        id: 3,
        todo_list_id: 1,
        sort_order: 3,
        title: "3.설거지 하기",
        category: "집안일",
        description: "저녁 먹고 바로 설거지하자.",
        status: "TO DO",
        is_important: false,
        due_date: "2025-06-01",
        created_at: "2025-05-15",
        comment: [
            "인생이란 무엇일까",
            "난 왜 설거지를 해야하는걸까 인생 참 힘들다...",
            "학교에서 급식을 먹었을떄가 참 좋았던 것 같아"
        ]
    },
    {
        id: 4,
        todo_list_id: 1,
        sort_order: 4,
        title: "4.설거지 하기",
        category: "집안일",
        description: "저녁 먹고 바로 설거지하자.",
        status: "TO DO",
        is_important: false,
        due_date: "2025-06-01",
        created_at: "2025-05-15",
        comment: [
            "인생이란 무엇일까",
            "난 왜 설거지를 해야하는걸까 인생 참 힘들다...",
            "학교에서 급식을 먹었을떄가 참 좋았던 것 같아"
        ]
    }
];

//#region [CRUD TASK]
// Task 생성 함수.
export function CreateTask({ todo_list_id, title, description = "", status = "idea", due_date = null }) {
    const task = {
        id: Date.now(),
        todo_list_id,
        title,
        description,
        status,
        due_date,
        created_at: new Date().toISOString().split('T')[0]
    };
    TaskData.push(task);
    return task;
}

// 특정 아이디 Task 수정 함수.
export function UpdateTask(taskId, updates) {
    const task = TaskData.find(t => t.id === taskId);
    if (task) Object.assign(task, updates);
    return task;
}

// 특정 아이디 Task 삭제 함수.
export function DeleteTask(taskId) {
    const index = TaskData.findIndex(t => t.id === taskId);
    if (index !== -1) TaskData.splice(index, 1);
}

// 특정 아이디의 태스크 가져오기 함수.
export function GetTaskById(taskId) {
    return TaskData.filter(t => t.id === taskId);
}
// 특정 아이디의 "리스트의" 태스크들 가져오기 함수.
export function GetTasksByListId(listId) {
    return TaskData.filter(t => t.todo_list_id === listId);
}

// 특정 상태의 테스크 가져오기 함수.
export function FilterTasksByStatus(listId, status) {
    return TaskData.filter(t => t.todo_list_id === listId && t.status === status);
}
//#endregion

//#region [CRUD LIST]
// 리스트 생성 함수.
export function CreateTodoList({ user_id, title, description = "", is_public = false }) {
    const list = {
        id: Date.now(),
        user_id,
        title,
        description,
        created_at: new Date().toISOString().split('T')[0],
        is_public
    };
    TodoListData.push(list);
    return list;
}

// 특정 아이디의 투두 리스트 가져오기 함수.
export function GetListById(listId) {
    return TodoListData.find(tl => tl.id === listId);
}

export function UpdateTodoList(listId, updates) {
    const list = TodoListData.find(l => l.id === listId);
    if (list) Object.assign(list, updates);
    return list;
}
//#endregion

//#region [LOCAL STORAGE]
// 테스크 데이터 로컬 스토리지 저장 함수.
export function SaveDataToLocalStorage() {
    localStorage.setItem("TaskData", JSON.stringify(TaskData));
    localStorage.setItem("TodoListData", JSON.stringify(TodoListData));
}

// 테스크 데이터, 리스트 데이터 로컬 스토리지 로드 함수.
export function LoadDataFromLocalStorage() {
    const tasks = JSON.parse(localStorage.getItem("TaskData") || "[]");
    const lists = JSON.parse(localStorage.getItem("TodoListData") || "[]");
    TaskData.length = 0;
    TodoListData.length = 0;
    TaskData.push(...tasks);
    TodoListData.push(...lists);
}
//#endregion