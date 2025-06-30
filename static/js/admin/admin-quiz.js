// Quiz Configurator View Handler
window.loadQuizContent = function() {
    const container = document.getElementById('quiz-content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h3>📋 Quiz-Kategorien verwalten</h3>
            <button onclick="showUploadForm()" class="btn-primary">
                📤 Quiz hochladen
            </button>
        </div>
        
        <div id="quiz-categories" class="content-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
            <div class="content-card" style="text-align: center; padding: 3rem;">
                Lade Quiz-Kategorien...
            </div>
        </div>
        
        <!-- Upload Form (initially hidden) -->
        <div id="upload-form" class="content-card" style="display: none;">
            <h3>📤 Quiz hochladen</h3>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <button onclick="setUploadType('csv')" id="csv-tab" class="btn-primary">
                    📄 CSV
                </button>
                <button onclick="setUploadType('excel')" id="excel-tab" class="btn-secondary">
                    📊 Excel
                </button>
            </div>
            
            <div id="csv-instructions" class="content-card" style="background: rgba(255, 255, 255, 0.05); margin-bottom: 1.5rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">📋 CSV Format-Regeln:</h4>
                <ul style="color: var(--text-gray); margin: 0; padding-left: 1rem;">
                    <li>• Dateiname wird als Kategorie-Name verwendet</li>
                    <li>• Erste Zeile: Header (Frage,Antwort A,Antwort B,Antwort C,Antwort D,Richtige Antwort)</li>
                    <li>• Richtige Antwort: A, B, C oder D</li>
                    <li>• UTF-8 Encoding verwenden</li>
                    <li>• <a href="/example-quiz.csv" download style="color: var(--primary-color);">example-quiz.csv herunterladen</a></li>
                </ul>
            </div>
            
            <div id="excel-instructions" class="content-card" style="background: rgba(255, 255, 255, 0.05); margin-bottom: 1.5rem; display: none;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">📋 Excel Format-Regeln:</h4>
                <ul style="color: var(--text-gray); margin: 0; padding-left: 1rem;">
                    <li>• Erste Spalte (A): Frage</li>
                    <li>• Spalten B-E: Antwortoptionen</li>
                    <li>• Spalte F: Richtige Antwort (A, B, C oder D)</li>
                    <li>• Zeile 1: Header</li>
                    <li>• Arbeitsblatt-Name wird als Kategorie verwendet</li>
                </ul>
            </div>
            
            <div style="border: 2px dashed rgba(255, 255, 255, 0.3); border-radius: 10px; padding: 2rem; text-align: center; margin-bottom: 1.5rem; transition: all 0.3s ease;" id="drop-zone">
                <input type="file" id="file-input" accept=".csv,.xlsx,.xls" style="display: none;" onchange="handleFileUpload(event)">
                <label for="file-input" style="cursor: pointer; color: var(--text-light); font-size: 1.1rem;">
                    📁 Datei auswählen oder hierher ziehen
                </label>
            </div>
            
            <div id="upload-preview" style="display: none;">
                <h4>👀 Vorschau:</h4>
                <div id="preview-content"></div>
            </div>
            
            <div class="btn-group">
                <button onclick="saveUploadedQuiz()" id="save-quiz-btn" class="btn-primary" style="display: none;">
                    💾 Quiz speichern
                </button>
                <button onclick="hideUploadForm()" class="btn-secondary">
                    ❌ Schließen
                </button>
            </div>
        </div>
    `;
    
    loadQuizCategories();
};

let currentUploadType = 'csv';
let previewData = null;

async function loadQuizCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        const container = document.getElementById('quiz-categories');
        if (data.success && data.data) {
            const categories = Object.entries(data.data);
            if (categories.length > 0) {
                container.innerHTML = categories.map(([key, quiz]) => `
                    <div class="content-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h3 style="margin: 0;">${quiz.title}</h3>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="editCategory('${key}')" class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                                    ✏️ Bearbeiten
                                </button>
                                <button onclick="deleteCategory('${key}')" class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; background: rgba(255, 107, 107, 0.2);">
                                    🗑️ Löschen
                                </button>
                            </div>
                        </div>
                        <p style="color: var(--text-gray); margin: 0;">${quiz.questions?.length || 0} Fragen</p>
                        <div style="margin-top: 1rem;">
                            <span class="status-indicator status-active">
                                <span>●</span> Aktiv
                            </span>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = `
                    <div class="content-card" style="text-align: center; padding: 3rem; color: var(--text-gray);">
                        Noch keine Quiz-Kategorien vorhanden
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Failed to load quiz categories:', error);
    }
}

function showUploadForm() {
    document.getElementById('upload-form').style.display = 'block';
}

function hideUploadForm() {
    document.getElementById('upload-form').style.display = 'none';
    document.getElementById('upload-preview').style.display = 'none';
    document.getElementById('save-quiz-btn').style.display = 'none';
    document.getElementById('file-input').value = '';
    previewData = null;
}

function setUploadType(type) {
    currentUploadType = type;
    
    // Update tab buttons
    document.getElementById('csv-tab').className = type === 'csv' ? 'btn-primary' : 'btn-secondary';
    document.getElementById('excel-tab').className = type === 'excel' ? 'btn-primary' : 'btn-secondary';
    
    // Update instructions
    document.getElementById('csv-instructions').style.display = type === 'csv' ? 'block' : 'none';
    document.getElementById('excel-instructions').style.display = type === 'excel' ? 'block' : 'none';
    
    // Update file input accept
    document.getElementById('file-input').accept = type === 'csv' ? '.csv' : '.xlsx,.xls';
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            if (currentUploadType === 'csv') {
                parseCSV(e.target.result, file.name);
            } else {
                showNotificationIfPossible('Info', 'Excel-Upload wird in der nächsten Version unterstützt');
            }
        } catch (error) {
            showNotificationIfPossible('Fehler', 'Datei konnte nicht gelesen werden');
        }
    };
    
    if (currentUploadType === 'csv') {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function parseCSV(content, filename) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        showNotificationIfPossible('Fehler', 'CSV-Datei muss mindestens Header und eine Frage enthalten');
        return;
    }
    
    const categoryName = filename.replace('.csv', '').replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '');
    const questions = [];
    
    for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length >= 6) {
            const correctAnswerLetter = cols[5].trim().toUpperCase();
            const correctIndex = correctAnswerLetter.charCodeAt(0) - 65;
            
            if (correctIndex >= 0 && correctIndex < 4) {
                questions.push({
                    question: cols[0].trim(),
                    options: [cols[1].trim(), cols[2].trim(), cols[3].trim(), cols[4].trim()],
                    correct: correctIndex
                });
            }
        }
    }
    
    previewData = {
        category: categoryName,
        questions: questions
    };
    
    showPreview();
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function showPreview() {
    if (!previewData) return;
    
    const previewContainer = document.getElementById('preview-content');
    previewContainer.innerHTML = `
        <div class="content-card" style="background: rgba(255, 255, 255, 0.05);">
            <h5 style="color: var(--primary-color);">Kategorie: ${previewData.category}</h5>
            <p style="color: var(--text-gray);">${previewData.questions.length} Fragen gefunden</p>
            
            <div style="max-height: 300px; overflow-y: auto;">
                ${previewData.questions.slice(0, 3).map((q, index) => `
                    <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                        <p><strong>Frage ${index + 1}:</strong> ${q.question}</p>
                        <ul style="margin: 0.5rem 0; padding-left: 1rem;">
                            ${q.options.map((option, optIndex) => `
                                <li style="color: ${optIndex === q.correct ? 'var(--success-color)' : 'var(--text-gray)'};">
                                    ${String.fromCharCode(65 + optIndex)}: ${option}
                                    ${optIndex === q.correct ? ' ✅' : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
                ${previewData.questions.length > 3 ? `<p style="text-align: center; color: var(--text-gray);">... und ${previewData.questions.length - 3} weitere Fragen</p>` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('upload-preview').style.display = 'block';
    document.getElementById('save-quiz-btn').style.display = 'inline-block';
}

async function saveUploadedQuiz() {
    if (!previewData) return;
    
    try {
        const response = await fetch('/api/admin/upload-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(previewData)
        });
        
        const data = await response.json();
        if (data.success) {
            showNotificationIfPossible('Erfolg!', 'Quiz-Kategorie wurde gespeichert!');
            hideUploadForm();
            loadQuizCategories();
        } else {
            showNotificationIfPossible('Fehler', data.message || 'Speichern fehlgeschlagen');
        }
    } catch (error) {
        showNotificationIfPossible('Fehler', 'Quiz konnte nicht gespeichert werden');
    }
}

function editCategory(key) {
    showNotificationIfPossible('Info', 'Quiz-Editor wird in der nächsten Version verfügbar sein');
}

async function deleteCategory(key) {
    if (!confirm('Quiz-Kategorie wirklich löschen?')) return;
    
    try {
        const response = await fetch(`/api/admin/categories/${key}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
            showNotificationIfPossible('Erfolg!', 'Kategorie wurde gelöscht');
            loadQuizCategories();
        } else {
            showNotificationIfPossible('Fehler', data.message || 'Löschen fehlgeschlagen');
        }
    } catch (error) {
        showNotificationIfPossible('Fehler', 'Löschen fehlgeschlagen');
    }
}

function showNotificationIfPossible(title, message) {
    try {
        const appElement = document.querySelector('[x-data]');
        if (appElement && appElement._x_dataStack) {
            const component = appElement._x_dataStack[0];
            if (component.showNotification) {
                component.showNotification(title, message);
                return;
            }
        }
    } catch (error) {
        console.log(`${title}: ${message}`);
    }
}