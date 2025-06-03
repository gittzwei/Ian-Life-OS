// Life OS - Main Application Controller
class LifeOS {
  constructor() {
    // DOM Elements
    this.tabs = document.querySelectorAll('.tab');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.cards = document.querySelectorAll('.card[data-target]');
    this.lastSavedEl = document.getElementById('lastSaved');
    this.modal = document.getElementById('modal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    
    // State
    this.data = {
      daily: {},
      weekly: {},
      monthly: {},
      reading: [],
      people: []
    };
  }

  // Initialize the application
  init() {
    this.setTodayDate();
    this.loadData();
    this.setupEventListeners();
    this.setupWeeklyBlueprint();
    this.setupMonthlyChecklist();
    this.setupReadingVault();
    this.setupPeopleTracker();
    this.updateLastSaved();
    this.updateCompletionPercentages();
  }

  // Core Methods
  setTodayDate() {
    document.getElementById('today').textContent = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  setupEventListeners() {
    // Tab switching
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab));
    });
    
    // Card navigation
    this.cards.forEach(card => {
      card.addEventListener('click', () => this.navigateToCardTarget(card));
    });
    
    // Save data on input changes
    document.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('change', () => this.saveData());
    });
    
    // Modal
    document.querySelector('.close').addEventListener('click', () => this.closeModal());
    window.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    
    // Quick actions
    document.getElementById('quickNote').addEventListener('click', () => this.showQuickNoteModal());
    document.getElementById('quickTask').addEventListener('click', () => this.showQuickTaskModal());
    document.getElementById('addBookBtn').addEventListener('click', () => this.addBook());
    document.getElementById('addPersonBtn').addEventListener('click', () => this.addPerson());
  }

  // Tab Navigation
  switchTab(tab) {
    this.tabs.forEach(t => t.classList.remove('active'));
    this.tabContents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  }

  navigateToCardTarget(card) {
    this.tabs.forEach(t => t.classList.remove('active'));
    this.tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${card.dataset.target}"]`).classList.add('active');
    document.getElementById(card.dataset.target).classList.add('active');
  }

  // Weekly Blueprint
  setupWeeklyBlueprint() {
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
    weekDays.forEach(day => this.createDayCard(day, weekGrid));
  }

  createDayCard(day, container) {
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
    container.appendChild(dayCard);
  }

  // Monthly Checklist
  setupMonthlyChecklist() {
    const checklist = document.getElementById('monthlyChecklist');
    const items = [
      'Reflect on past month wins & lessons',
      'Reset goals for next month',
      'Review current alignment to purpose',
      'Add 1 new habit or ritual',
      'Take 1 day for silence, nature, or art'
    ];
    
    items.forEach(item => this.createChecklistItem(item, checklist));
  }

  createChecklistItem(item, container) {
    const div = document.createElement('div');
    div.className = 'checklist-item';
    div.innerHTML = `
      <label>
        <input type="checkbox" name="monthly" value="${item.toLowerCase().replace(/ /g, '-')}">
        ${item}
      </label>
    `;
    container.appendChild(div);
  }

  // Reading Vault
  setupReadingVault() {
    const savedBooks = this.data.reading || [];
    savedBooks.forEach(book => this.renderBook(book));
  }

  addBook() {
    const book = {
      title: document.getElementById('bookTitle').value,
      theme: document.getElementById('bookTheme').value,
      takeaways: document.getElementById('bookTakeaways').value,
      insights: document.getElementById('bookInsights').value,
      dateAdded: new Date().toISOString()
    };

    if (!book.title) return;

    this.data.reading.push(book);
    this.saveData();
    this.renderBook(book);
    this.clearBookForm();
  }

  renderBook(book) {
    const bookList = document.getElementById('bookList');
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
      <span class="book-theme">${book.theme}</span>
      <h3>${book.title}</h3>
      <p><strong>Key Takeaways:</strong> ${book.takeaways}</p>
      <p><strong>Actionable Insights:</strong> ${book.insights}</p>
      <small>Added: ${new Date(book.dateAdded).toLocaleDateString()}</small>
    `;
    bookList.appendChild(bookCard);
  }

  clearBookForm() {
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookTakeaways').value = '';
    document.getElementById('bookInsights').value = '';
  }

  // People Tracker
  setupPeopleTracker() {
    const savedPeople = this.data.people || [];
    savedPeople.forEach(person => this.renderPerson(person));
  }

  addPerson() {
    const person = {
      name: document.getElementById('personName').value,
      role: document.getElementById('personRole').value,
      lastContact: document.getElementById('lastContact').value,
      notes: document.getElementById('personNotes').value,
      followUpDate: document.getElementById('followUpDate').value,
      dateAdded: new Date().toISOString()
    };

    if (!person.name) return;

    this.data.people.push(person);
    this.saveData();
    this.renderPerson(person);
    this.clearPersonForm();
  }

  renderPerson(person) {
    const peopleList = document.getElementById('peopleList');
    const personCard = document.createElement('div');
    personCard.className = 'person-card';
    personCard.innerHTML = `
      <h3>${person.name}</h3>
      <div class="person-meta">
        <span>${person.role}</span>
        <span>Last contact: ${person.lastContact || 'N/A'}</span>
      </div>
      <p><strong>Notes:</strong> ${person.notes}</p>
      ${person.followUpDate ? `<p><strong>Follow up:</strong> ${person.followUpDate}</p>` : ''}
    `;
    peopleList.appendChild(personCard);
  }

  clearPersonForm() {
    document.getElementById('personName').value = '';
    document.getElementById('personRole').value = '';
    document.getElementById('lastContact').value = '';
    document.getElementById('personNotes').value = '';
    document.getElementById('followUpDate').value = '';
  }

  // Data Management
  loadData() {
    const savedData = localStorage.getItem('lifeOSData');
    if (!savedData) return;
    
    this.data = JSON.parse(savedData);
    
    // Load daily data
    if (this.data.daily) {
      if (this.data.daily.focusAreas) {
        this.data.daily.focusAreas.forEach(area => {
          const checkbox = document.querySelector(`input[name="focus"][value="${area}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      ['task1', 'task2', 'task3'].forEach((id, index) => {
        if (this.data.daily.tasks && this.data.daily.tasks[index]) {
          document.getElementById(id).value = this.data.daily.tasks[index];
        }
      });
      
      if (this.data.daily.spiritualAnchor) {
        document.getElementById('spiritualAnchor').value = this.data.daily.spiritualAnchor;
      }
      
      if (this.data.daily.win) {
        document.getElementById('dailyWin').value = this.data.daily.win;
      }
    }
    
    // Load weekly data
    if (this.data.weekly) {
      document.querySelectorAll('.day-notes').forEach(textarea => {
        const day = textarea.dataset.day;
        if (this.data.weekly[day]) {
          textarea.value = this.data.weekly[day];
        }
      });
    }
    
    // Load monthly data
    if (this.data.monthly) {
      if (this.data.monthly.checklist) {
        document.querySelectorAll('#monthlyChecklist input[type="checkbox"]').forEach(checkbox => {
          if (this.data.monthly.checklist.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });
      }
      
      if (this.data.monthly.prompts) {
        document.querySelectorAll('.prompt-response').forEach((textarea, index) => {
          if (this.data.monthly.prompts[index]) {
            textarea.value = this.data.monthly.prompts[index];
          }
        });
      }
    }
  }

  saveData() {
    // Update current state
    this.data.daily = {
      focusAreas: Array.from(document.querySelectorAll('input[name="focus"]:checked')).map(el => el.value),
      tasks: [
        document.getElementById('task1').value,
        document.getElementById('task2').value,
        document.getElementById('task3').value
      ],
      spiritualAnchor: document.getElementById('spiritualAnchor').value,
      win: document.getElementById('dailyWin').value
    };
    
    this.data.weekly = {};
    document.querySelectorAll('.day-notes').forEach(textarea => {
      this.data.weekly[textarea.dataset.day] = textarea.value;
    });
    
    this.data.monthly = {
      checklist: Array.from(document.querySelectorAll('#monthlyChecklist input[type="checkbox"]:checked')).map(el => el.value),
      prompts: Array.from(document.querySelectorAll('.prompt-response')).map(el => el.value)
    };
    
    localStorage.setItem('lifeOSData', JSON.stringify(this.data));
    this.updateLastSaved();
    this.updateCompletionPercentages();
  }

  // UI Helpers
  updateLastSaved() {
    const now = new Date();
    this.lastSavedEl.textContent = `Last saved: ${now.toLocaleTimeString()}`;
  }

  updateCompletionPercentages() {
    this.updateDailyCompletion();
    this.updateWeeklyCompletion();
    this.updateMonthlyCompletion();
    this.updateSpiritualCompletion();
  }

  updateDailyCompletion() {
    const tasksComplete = [
      document.getElementById('task1').value,
      document.getElementById('task2').value,
      document.getElementById('task3').value
    ].filter(t => t.trim() !== '').length;
    
    const focusComplete = document.querySelectorAll('input[name="focus"]:checked').length;
    const spiritualComplete = document.getElementById('spiritualAnchor').value.trim() !== '' ? 1 : 0;
    const winComplete = document.getElementById('dailyWin').value.trim() !== '' ? 1 : 0;
    
    const total = tasksComplete + focusComplete + spiritualComplete + winComplete;
    const max = 3 + 5 + 1 + 1; // 3 tasks + 5 focus areas + 1 spiritual + 1 win
    const percent = Math.round((total / max) * 100);
    
    this.updateCompletionElement('dailyCompletion', percent);
  }

  updateWeeklyCompletion() {
    const notesComplete = Array.from(document.querySelectorAll('.day-notes')).filter(el => el.value.trim() !== '').length;
    const percent = Math.round((notesComplete / 7) * 100);
    this.updateCompletionElement('weeklyCompletion', percent);
  }

  updateMonthlyCompletion() {
    const checked = document.querySelectorAll('#monthlyChecklist input[type="checkbox"]:checked').length;
    const prompts = Array.from(document.querySelectorAll('.prompt-response')).filter(el => el.value.trim() !== '').length;
    const total = checked + prompts;
    const max = 5 + 4; // 5 checklist items + 4 prompts
    const percent = Math.round((total / max) * 100);
    this.updateCompletionElement('monthlyCompletion', percent);
  }

  updateSpiritualCompletion() {
    const percent = document.getElementById('spiritualAnchor').value.trim() !== '' ? 100 : 0;
    this.updateCompletionElement('spiritualCompletion', percent);
  }

  updateCompletionElement(id, percent) {
    const element = document.getElementById(id);
    element.textContent = `${percent}%`;
    element.style.background = this.getCompletionColor(percent);
  }

  getCompletionColor(percent) {
    if (percent < 30) return '#ffcdd2';
    if (percent < 70) return '#fff9c4';
    return '#c8e6c9';
  }

  // Modal Methods
  showModal(title, content) {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = content;
    this.modal.style.display = 'flex';
  }

  closeModal() {
    this.modal.style.display = 'none';
  }

  showQuickNoteModal() {
    this.showModal('Quick Note', `
      <textarea placeholder="Enter your note" style="width:100%;min-height:100px;"></textarea>
      <button style="margin-top:1rem;" class="print-btn">Save Note</button>
    `);
  }

  showQuickTaskModal() {
    this.showModal('Quick Task', `
      <input type="text" placeholder="Task description" style="width:100%;margin-bottom:1rem;">
      <select style="width:100%;margin-bottom:1rem;">
        <option>Today</option>
        <option>This Week</option>
        <option>Someday</option>
      </select>
      <button style="margin-top:1rem;" class="print-btn">Add Task</button>
    `);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new LifeOS();
  app.init();
  
  // Service Worker Registration for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
});