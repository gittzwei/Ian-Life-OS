// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const cards = document.querySelectorAll('.card[data-target]');
const lastSavedEl = document.getElementById('lastSaved');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close');

// Initialize the app
function init() {
    // Set today's date
    document.getElementById('today').textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Load saved data
    loadData();
    
    // Set up weekly blueprint
    setupWeeklyBlueprint();
    
    // Set up monthly checklist
    setupMonthlyChecklist();
    
    // Event listeners
    setupEventListeners();
    
    // Update last saved time
    updateLastSaved();
    
    // Calculate completion percentages
    updateCompletionPercentages();
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });
    
    // Card navigation
    cards.forEach(card => {
        card.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            document.querySelector(`.tab[data-tab="${card.dataset.target}"]`).classList.add('active');
            document.getElementById(card.dataset.target).classList.add('active');
        });
    });
    
    // Save data on input changes
    document.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('change', saveData);
    });
    
    // Modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Quick actions
    document.getElementById('quickNote').addEventListener('click', () => {
        showModal('Quick Note', '<textarea placeholder="Enter your note" style="width:100%;min-height:100px;"></textarea><button style="margin-top:1rem;" class="print-btn">Save Note</button>');
    });
    
    document.getElementById('quickTask').addEventListener('click', () => {
        showModal('Quick Task', '<input type="text" placeholder="Task description" style="width:100%;margin-bottom:1rem;"><select style="width:100%;margin-bottom:1rem;"><option>Today</option><option>This Week</option><option>Someday</option></select><button style="margin-top:1rem;" class="print-btn">Add Task</button>');
    });
}

// Set up weekly blueprint
function setupWeeklyBlueprint() {
    const weekGrid = document.querySelector('.week-grid');
    const weekDays = [
        { day: 'Monday', theme: 'Mission Execution', work: 'Deep work', spiritual: 'Morning intention + Psalm' },
        { day: 'Tuesday', theme: 'Build & Connect', work: 'Outreach & team', spiritual: 'Gratitude journaling' },
        { day: 'Wednesday', theme: 'Wisdom & Learning', work: 'Read + refine', spiritual: 'Reflective journaling' },
        { day: 'Thursday', theme: 'Prototype & Publish', work: 'Build/share', spiritual: 'Breathwork before creating' },
        { day: 'Friday', theme: 'Review & Reset', work: 'Audit & plan', spiritual: 'Prayer + forgiveness' },
        { day: 'Saturday', theme: 'Rest & Belonging', work: 'Social time, nature', spiritual: 'Self-reflection' },
        { day: 'Sunday', theme: 'Spirit + Strategy', work: 'Spiritual + strategic visioning', spiritual: 'Scripture study + plan week' }
    ];
    
    weekGrid.innerHTML = '';
    
    weekDays.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-header">
                <h3>${day.day}</h3>
                <span class="theme">${day.theme}</span>
            </div>
            <div class="day-content">
                <p><strong>Core Work:</strong> ${day.work}</p>
                <p><strong>Spiritual Practice:</strong> ${day.spiritual}</p>
                <textarea placeholder="Notes for ${day.day}" class="day-notes" data-day="${day.day.toLowerCase()}"></textarea>
            </div>
        `;
        weekGrid.appendChild(dayCard);
    });
}

// Set up monthly checklist
function setupMonthlyChecklist() {
    const checklist = document.getElementById('monthlyChecklist');
    const items = [
        'Reflect on past month wins & lessons',
        'Reset goals for next month',
        'Review current alignment to purpose',
        'Add 1 new habit or ritual',
        'Take 1 day for silence, nature, or art'
    ];
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <label>
                <input type="checkbox" name="monthly" value="${item.toLowerCase().replace(/ /g, '-')}">
                ${item}
            </label>
        `;
        checklist.appendChild(div);
    });
}

// Load saved data from localStorage
function loadData() {
    const savedData = localStorage.getItem('lifeOSData');
    if (!savedData) return;
    
    const data = JSON.parse(savedData);
    
    // Load daily data
    if (data.daily) {
        if (data.daily.focusAreas) {
            data.daily.focusAreas.forEach(area => {
                const checkbox = document.querySelector(`input[name="focus"][value="${area}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        if (data.daily.tasks) {
            document.getElementById('task1').value = data.daily.tasks[0] || '';
            document.getElementById('task2').value = data.daily.tasks[1] || '';
            document.getElementById('task3').value = data.daily.tasks[2] || '';
        }
        
        if (data.daily.spiritualAnchor) {
            document.getElementById('spiritualAnchor').value = data.daily.spiritualAnchor;
        }
        
        if (data.daily.win) {
            document.getElementById('dailyWin').value = data.daily.win;
        }
    }
    
    // Load weekly data
    if (data.weekly) {
        document.querySelectorAll('.day-notes').forEach(textarea => {
            const day = textarea.dataset.day;
            if (data.weekly[day]) {
                textarea.value = data.weekly[day];
            }
        });
    }
    
    // Load monthly data
    if (data.monthly) {
        if (data.monthly.checklist) {
            document.querySelectorAll('#monthlyChecklist input[type="checkbox"]').forEach(checkbox => {
                const value = checkbox.value;
                if (data.monthly.checklist.includes(value)) {
                    checkbox.checked = true;
                }
            });
        }
        
        if (data.monthly.prompts) {
            document.querySelectorAll('.prompt-response').forEach((textarea, index) => {
                if (data.monthly.prompts[index]) {
                    textarea.value = data.monthly.prompts[index];
                }
            });
        }
    }
}

// Save data to localStorage
function saveData() {
    const data = {
        daily: {
            focusAreas: Array.from(document.querySelectorAll('input[name="focus"]:checked')).map(el => el.value),
            tasks: [
                document.getElementById('task1').value,
                document.getElementById('task2').value,
                document.getElementById('task3').value
            ],
            spiritualAnchor: document.getElementById('spiritualAnchor').value,
            win: document.getElementById('dailyWin').value
        },
        weekly: {},
        monthly: {
            checklist: Array.from(document.querySelectorAll('#monthlyChecklist input[type="checkbox"]:checked')).map(el => el.value),
            prompts: Array.from(document.querySelectorAll('.prompt-response')).map(el => el.value)
        }
    };
    
    // Save weekly notes
    document.querySelectorAll('.day-notes').forEach(textarea => {
        const day = textarea.dataset.day;
        data.weekly[day] = textarea.value;
    });
    
    localStorage.setItem('lifeOSData', JSON.stringify(data));
    updateLastSaved();
    updateCompletionPercentages();
}

// Update last saved time
function updateLastSaved() {
    const now = new Date();
    lastSavedEl.textContent = `Last saved: ${now.toLocaleTimeString()}`;
}

// Update completion percentages
function updateCompletionPercentages() {
    // Daily completion
    const dailyTasks = [
        document.getElementById('task1').value,
        document.getElementById('task2').value,
        document.getElementById('task3').value
    ].filter(t => t.trim() !== '').length;
    
    const dailyFocus = document.querySelectorAll('input[name="focus"]:checked').length;
    const dailySpiritual = document.getElementById('spiritualAnchor').value.trim() !== '' ? 1 : 0;
    const dailyWin = document.getElementById('dailyWin').value.trim() !== '' ? 1 : 0;
    
    const dailyTotal = dailyTasks + dailyFocus + dailySpiritual + dailyWin;
    const dailyMax = 3 + 5 + 1 + 1; // 3 tasks + 5 focus areas + 1 spiritual + 1 win
    const dailyPercent = Math.round((dailyTotal / dailyMax) * 100);
    
    document.getElementById('dailyCompletion').textContent = `${dailyPercent}%`;
    document.getElementById('dailyCompletion').style.background = getCompletionColor(dailyPercent);
    
    // Weekly completion (simplified)
    const weeklyNotes = Array.from(document.querySelectorAll('.day-notes')).filter(el => el.value.trim() !== '').length;
    const weeklyPercent = Math.round((weeklyNotes / 7) * 100);
    
    document.getElementById('weeklyCompletion').textContent = `${weeklyPercent}%`;
    document.getElementById('weeklyCompletion').style.background = getCompletionColor(weeklyPercent);
    
    // Monthly completion
    const monthlyChecked = document.querySelectorAll('#monthlyChecklist input[type="checkbox"]:checked').length;
    const monthlyPrompts = Array.from(document.querySelectorAll('.prompt-response')).filter(el => el.value.trim() !== '').length;
    const monthlyTotal = monthlyChecked + monthlyPrompts;
    const monthlyMax = 5 + 4; // 5 checklist items + 4 prompts
    const monthlyPercent = Math.round((monthlyTotal / monthlyMax) * 100);
    
    document.getElementById('monthlyCompletion').textContent = `${monthlyPercent}%`;
    document.getElementById('monthlyCompletion').style.background = getCompletionColor(monthlyPercent);
    
    // Spiritual completion (simplified)
    const spiritualPercent = dailySpiritual * 100;
    document.getElementById('spiritualCompletion').textContent = `${spiritualPercent}%`;
    document.getElementById('spiritualCompletion').style.background = getCompletionColor(spiritualPercent);
}

function getCompletionColor(percent) {
    if (percent < 30) return '#ffcdd2';
    if (percent < 70) return '#fff9c4';
    return '#c8e6c9';
}

// Show modal dialog
function showModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.style.display = 'flex';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}