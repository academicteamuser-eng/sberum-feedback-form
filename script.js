// Конфигурация Google Sheets
const SHEET_CONFIG = {
    BUGS_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1SbZTe312_i2cu7EpjOvExLS2lGWkk61UxT5cBG4s0h4/edit?gid=78323318#gid=78323318',
    FEATURES_SHEET_URL: 'https://docs.google.com/spreadsheets/d/1SbZTe312_i2cu7EpjOvExLS2lGWkk61UxT5cBG4s0h4/edit?gid=0#gid=0',
    // Вам нужно создать Web App в Google Apps Script и вставить сюда URL
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbxwv-g4iMPyRfbuyu2ojPaL-oxMuKlDJaVnYb62mmYUiReAQYc11uXU40fn7SDctzk97Q/exec' // Замените на ваш URL
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
    try {
        // ВАЖНО: Замените этот URL на URL вашего Google Apps Script Web App
        // После того как создадите скрипт и развернете его как веб-приложение
        const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxwv-g4iMPyRfbuyu2ojPaL-oxMuKlDJaVnYb62mmYUiReAQYc11uXU40fn7SDctzk97Q/exec';
        
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors', // Важно для Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // При mode: 'no-cors' мы не можем проверить статус ответа,
        // но если не будет ошибок сети, считаем успешным
        return { success: true };
        
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
    submitBtn.classList.add('sending'); //анимация
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;
    
    try {
        // Отправка данных
        await submitToGoogleSheets(formData);
        
        // Показать успешное сообщение
        showModal(successModal);
        submitBtn.classList.remove('sending');
submitBtn.classList.add('success');
setTimeout(() => submitBtn.classList.remove('success'), 3000);
        
        // Сбросить форму
        form.reset();
        formChanged = false;
        hideAllConditionalFields();
        
    } catch (error) {
        // Показать сообщение об ошибке
        showModal(errorModal);
        console.error('Submission error:', error);
        submitBtn.classList.remove('sending');
submitBtn.classList.add('error');
setTimeout(() => submitBtn.classList.remove('error'), 3000);
        
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

// ========== ИНФОРМАЦИОННЫЕ ИКОНКИ С ПОДСКАЗКАМИ ==========

document.addEventListener('DOMContentLoaded', function() {
    createInfoIcons();
    setupTooltipInteractions();
    fixTooltipPositions();
});

function createInfoIcons() {
    const tooltips = [
        {
            fieldId: 'improvementGroup',
            tooltipText: '1. Создать задание / войти в конструктор контента\n2. Добавить текстовый блок\n3. Написать текст\n4. Выделить текст в рамку\n\nСценарий 1\n\nОпишите по шагам путь, который необходимо пройти, чтобы дойти до описываемой функции.\n1. ...\n2. ...'
        },
        {
            fieldId: 'suggestionGroup',
            tooltipText: 'Ожидаемый: можно выбрать ширину рамки, либо, чтобы она заканчивалась сразу после текста, либо чтобы она была на всю ширину строки\nФактический: регулировать ширину нельзя, рамка растягивается на всю строку'
        },
        {
            fieldId: 'purposeGroup',
            tooltipText: 'Это позволит снизить нагрузку на худредакцию, т.к. откроет больше возможностей для самостоятельного оформления контента на платформе'
        },
        {
            fieldId: 'bugDescriptionGroup',
            tooltipText: '1. Создать задание / войти в конструктор заданий\n2. Создать вопрос с типом ответа "выбор варианта"\n3. В варианте ответа написать формулу\n\nИЛИ\n\nСгенерировать вопросы с выбором ответа по математике, предполагающие использование формул (например по запросу "формулы сокращенного умножения")'
        },
        {
            fieldId: 'resultsGroup',
            tooltipText: 'Ожидаемый: доступно добавление формул вручную, работает преобразование формул из записи с $$\nФактический: не доступно добавление формул, не реализовано преобразование формул из записи с $$'
        }
    ];
    
    tooltips.forEach(({ fieldId, tooltipText }) => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const label = field.querySelector('label');
        if (!label) return;
        
        // Проверяем, не добавлена ли уже иконка
        if (label.querySelector('.info-icon')) return;
        
        // Создаем контейнер
        const iconContainer = document.createElement('span');
        iconContainer.className = 'tooltip-container';
        
        // Создаем иконку
        const icon = document.createElement('span');
        icon.className = 'info-icon';
        icon.innerHTML = 'ℹ️';
        icon.setAttribute('title', 'Показать подсказку');
        icon.setAttribute('aria-label', 'Информация');
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        
        // Создаем tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        
        // Добавляем контент
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        tooltipContent.textContent = tooltipText;
        
        // Добавляем кнопку закрытия
        const closeButton = document.createElement('button');
        closeButton.className = 'tooltip-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Закрыть подсказку');
        
        tooltip.appendChild(tooltipContent);
        tooltip.appendChild(closeButton);
        icon.appendChild(tooltip);
        iconContainer.appendChild(icon);
        
        // Добавляем в label
        label.appendChild(iconContainer);
    });
}

function fixTooltipPositions() {
    // Исправляем позиционирование всех tooltip
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        // Убеждаемся, что tooltip позиционируется относительно viewport
        tooltip.style.left = '50%';
        tooltip.style.right = 'auto';
        tooltip.style.transform = 'translateX(-50%)';
    });
}

function setupTooltipInteractions() {
    // Показать/скрыть tooltip
    document.addEventListener('mouseover', function(e) {
        const icon = e.target.closest('.info-icon');
        if (icon) {
            const tooltip = icon.querySelector('.tooltip');
            if (tooltip) {
                // Закрываем другие
                document.querySelectorAll('.tooltip').forEach(t => {
                    t.style.opacity = '0';
                    t.style.visibility = 'hidden';
                    t.classList.remove('active');
                });
                
                // Показываем текущий
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                tooltip.classList.add('active');
                
                // Исправляем позицию
                setTimeout(() => {
                    const rect = tooltip.getBoundingClientRect();
                    if (rect.left < 10) {
                        tooltip.style.left = 'calc(50% + ' + Math.abs(rect.left) + 'px)';
                    }
                    if (rect.right > window.innerWidth - 10) {
                        tooltip.style.left = 'calc(50% - ' + (rect.right - window.innerWidth + 10) + 'px)';
                    }
                }, 10);
            }
        }
    });
    
    // Клик по иконке
    document.addEventListener('click', function(e) {
        const icon = e.target.closest('.info-icon');
        const closeBtn = e.target.closest('.tooltip-close');
        
        if (closeBtn) {
            const tooltip = closeBtn.closest('.tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.classList.remove('active');
            }
            return;
        }
        
        if (icon) {
            e.preventDefault();
            e.stopPropagation();
            
            const tooltip = icon.querySelector('.tooltip');
            if (tooltip) {
                const isActive = tooltip.classList.contains('active');
                
                // Закрываем все
                document.querySelectorAll('.tooltip').forEach(t => {
                    t.style.opacity = '0';
                    t.style.visibility = 'hidden';
                    t.classList.remove('active');
                });
                
                // Открываем текущий, если был закрыт
                if (!isActive) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                    tooltip.classList.add('active');
                    
                    // Исправляем позицию
                    setTimeout(() => {
                        const rect = tooltip.getBoundingClientRect();
                        if (rect.left < 10) {
                            tooltip.style.left = 'calc(50% + ' + (10 - rect.left) + 'px)';
                        }
                        if (rect.right > window.innerWidth - 10) {
                            tooltip.style.left = 'calc(50% - ' + (rect.right - window.innerWidth + 10) + 'px)';
                        }
                    }, 10);
                }
            }
        } else {
            // Клик вне tooltip - закрываем все
            document.querySelectorAll('.tooltip').forEach(tooltip => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.classList.remove('active');
            });
        }
    });
    
    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.tooltip').forEach(tooltip => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.classList.remove('active');
            });
        }
    });
}
