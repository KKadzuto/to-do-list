document.addEventListener('DOMContentLoaded', () => {
    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarDates = document.getElementById('calendar-dates');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTaskInput = document.getElementById('new-task');
    const taskDateInput = document.getElementById('task-date');
    const tasksList = document.getElementById('tasks');
    const urgentTasksList = document.getElementById('urgent-tasks-list');
    const progressBar = document.getElementById('progress-bar');
    const modal = document.getElementById('day-tasks-modal');
    const closeModal = document.getElementById('close-modal');
    const modalDateTitle = document.getElementById('modal-date-title');
    const modalTasksList = document.getElementById('modal-tasks-list');

    let today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    function saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    function loadTasks() {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
    }

    let tasks = loadTasks();

    function renderTasks() {
        tasksList.innerHTML = '';
        tasks.forEach((task, idx) => {
            const li = document.createElement('li');
            li.textContent = `${task.text} (${task.date})`;
            if (task.completed) {
                li.classList.add('completed');
            }
            li.style.cursor = 'pointer';
            li.addEventListener('click', () => {
                tasks[idx].completed = !tasks[idx].completed;
                saveTasks(tasks);
                renderTasks();
                renderProgressBar();
                renderCalendar(currentMonth, currentYear);
                renderUrgentTasks();
                if (tasks[idx].completed) {
                    launchConfetti();
                }
            });
            tasksList.appendChild(li);
        });
    }

    addTaskBtn.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        const date = taskDateInput.value;
        if (!text || !date) return;
        tasks.push({ text, date, completed: false });
        saveTasks(tasks);
        newTaskInput.value = '';
        taskDateInput.value = '';
        renderTasks();
        renderProgressBar();
        renderCalendar(currentMonth, currentYear);
        renderUrgentTasks();
    });

    function renderProgressBar() {
        if (tasks.length === 0) {
            progressBar.style.width = '0%';
            return;
        }
        const completed = tasks.filter(t => t.completed).length;
        const percent = Math.round((completed / tasks.length) * 100);
        progressBar.style.width = percent + '%';
    }

    function renderUrgentTasks() {
        urgentTasksList.innerHTML = '';
        const now = new Date();
        const upcoming = tasks
            .filter(t => !t.completed && t.date >= now.toISOString().slice(0,10))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 3);
        if (upcoming.length === 0) {
            urgentTasksList.innerHTML = '<li>Нет срочных задач</li>';
            return;
        }
        upcoming.forEach(task => {
            const li = document.createElement('li');
            li.textContent = `${task.text} (${task.date})`;
            urgentTasksList.appendChild(li);
        });
    }

    function renderCalendar(month, year) {
        calendarDates.innerHTML = '';
        calendarMonthYear.textContent = `${monthNames[month]} ${year}`;

        let firstDay = new Date(year, month, 1).getDay();
        let startDay = firstDay === 0 ? 6 : firstDay - 1;
        let daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            calendarDates.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('div');
            dateCell.textContent = day;
            const cellDate = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

            const hasTask = tasks.some(t => t.date === cellDate && !t.completed);
            if (hasTask) dateCell.classList.add('has-task');

            if (
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear()
            ) {
                dateCell.classList.add('today');
            }

            dateCell.addEventListener('click', () => {
                showDayTasks(cellDate);
            });

            calendarDates.appendChild(dateCell);
        }
    }

    function showDayTasks(dateStr) {
        modal.style.display = 'block';
        modalDateTitle.textContent = `Задачи на ${dateStr}`;
        modalTasksList.innerHTML = '';
        const dayTasks = tasks.filter(t => t.date === dateStr);
        if (dayTasks.length === 0) {
            modalTasksList.innerHTML = '<li>Нет задач на этот день</li>';
        } else {
            dayTasks.forEach((task, idx) => {
                const li = document.createElement('li');
                li.textContent = task.text + (task.completed ? ' (выполнено)' : '');
                li.style.textDecoration = task.completed ? 'line-through' : '';
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => {
                    const globalIdx = tasks.findIndex(t => t.text === task.text && t.date === task.date);
                    if (globalIdx !== -1) {
                        tasks[globalIdx].completed = !tasks[globalIdx].completed;
                        saveTasks(tasks);
                        renderTasks();
                        renderProgressBar();
                        renderCalendar(currentMonth, currentYear);
                        renderUrgentTasks();
                        showDayTasks(dateStr);
                        if (tasks[globalIdx].completed) {
                            launchConfetti();
                        }
                    }
                });
                modalTasksList.appendChild(li);
            });
        }
    }
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    function launchConfetti() {
        if (window.confetti) {
            confetti({
                particleCount: 120,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    }

    renderTasks();
    renderProgressBar();
    renderCalendar(currentMonth, currentYear);
    renderUrgentTasks();
});