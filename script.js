// Конфигурация Google Sheets
const SHEET_CONFIG = {
    BUGS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1SbZTe312_i2cu7EpjOvExLS2lGWkk61UxT5cBG4s0h4/edit?gid=78323318#gid=78323318',
    FEATURES_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1SbZTe312_i2cu7EpjOvExLS2lGWkk61UxT5cBG4s0h4/edit?gid=0#gid=0',
    // Вам нужно создать Web App в Google Apps Script и вставить сюда URL
    WEB_APP_URL: 'ВАШ_GOOGLE_APPS_SCRIPT_WEB_APP_URL' // Замените на ваш URL
};

// DOM элементы
const form = document.getElementById('feedbackForm');
const typeSelect = document.getElementById('type');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');

// Группы полей для багов и фич
const bugFields = document.querySelectorAll('.bug-fields');
const featureFields = document.querySelectorAll('.feature-fields');

// Изначально скрываем все условные поля
function hideAllConditionalFields() {
    bugFields.forEach(field => {
        field.style.display = 'none';
    });
    featureFields.forEach(field => {
        field.style.display = 'none';
    });
}

// Показываем поля в зависимости от выбранного типа
function toggleFieldsBasedOnType() {
    const selectedType = typeSelect.value;
    
    hideAllConditionalFields();
    
    if (selectedType === 'баг') {
        bugFields.forEach(field => {
            field.style.display = 'flex';
        });
    } else if (selectedType === 'фича') {
        featureFields.forEach(field => {
            field.style.display = 'flex';
        });
    }
}

// Обработчик изменения типа
typeSelect.addEventListener('change', toggleFieldsBasedOnType);

// Инициализация полей при загрузке
document.addEventListener('DOMContentLoaded', () => {
    hideAllConditionalFields();
    
    // Проверяем, если уже выбран тип при перезагрузке
    if (typeSelect.value) {
        toggleFieldsBasedOnType();
    }
});

// Функции для работы с модальными окнами
function showModal(modal) {
    modal.style.display = 'flex';
}

function closeModal() {
    successModal.style.display = 'none';
    errorModal.style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', (event) => {
    if (event.target === successModal || event.target === errorModal) {
        closeModal();
    }
});

// Предупреждение при закрытии страницы с несохраненной формой
let formChanged = false;

form.addEventListener('input', () => {
    formChanged = true;
});

form.addEventListener('change', () => {
    formChanged = true;
});

window.addEventListener('beforeunload', (event) => {
    if (formChanged) {
        event.preventDefault();
        event.returnValue = 'Вы хотите закрыть страницу, данные в форме не сохраняются.';
    }
});

// Функция для отправки данных в Google Sheets
async function submitToGoogleSheets(formData) {
    const isBug = formData.type === 'баг';
    const endpoint = isBug ? SHEET_CONFIG.BUGS_SHEET_URL : SHEET_CONFIG.FEATURES_SHEET_URL;
    
    try {
        // Здесь вы должны использовать Google Apps Script Web App
        // Пример реализации с fetch:
        /*
        const response = await fetch(SHEET_CONFIG.WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
        */
        
        // Для демонстрации используем setTimeout
        return new Promise((resolve) => {
            setTimeout(() => {
                // Симуляция успешной отправки
                const success = Math.random() > 0.2; // 80% успеха
                if (success) {
                    resolve({ success: true });
                } else {
                    throw new Error('Ошибка отправки');
                }
            }, 1500);
        });
        
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        throw error;
    }
}

// Обработка отправки формы
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Сбор данных формы
    const formData = {
        timestamp: new Date().toISOString(),
        name: document.getElementById('name').value,
        platformSection: document.getElementById('platformSection').value,
        role: document.getElementById('role').value,
        type: document.getElementById('type').value,
        problemDescription: document.getElementById('problemDescription').value,
        expectedActual: document.getElementById('expectedActual').value,
        improvementDescription: document.getElementById('improvementDescription').value,
        suggestion: document.getElementById('suggestion').value,
        purpose: document.getElementById('purpose').value,
        priority: document.getElementById('priority').value,
        screenshots: document.getElementById('screenshots').files.length > 0 ? 
            Array.from(document.getElementById('screenshots').files).map(f => f.name).join(', ') : '',
        mediaUrl: document.getElementById('mediaUrl').value,
        taskLink: document.getElementById('taskLink').value
    };
    
    // Показать индикатор загрузки
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    
    try {
        // Отправка данных
        await submitToGoogleSheets(formData);
        
        // Показать успешное сообщение
        showModal(successModal);
        
        // Сбросить форму
        form.reset();
        formChanged = false;
        hideAllConditionalFields();
        
    } catch (error) {
        // Показать сообщение об ошибке
        showModal(errorModal);
        console.error('Submission error:', error);
        
    } finally {
        // Восстановить кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Обработка загрузки файлов
const fileInput = document.getElementById('screenshots');
fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
        // Можно добавить предпросмотр файлов
        console.log(`${files.length} файлов выбрано`);
    }
});
