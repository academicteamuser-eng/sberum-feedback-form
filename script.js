// Конфигурация Google Sheets 
const SHEET_CONFIG = {
    // ВАЖНО: Замените этот URL на URL вашего Google Apps Script Web App
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbyOSwZEYPU9OD3HSjJ_nnD6Cg9K1VgjvjJMCdGym2kji3OvHD9pT2JiswSgqPbzSsQ/exec'
};

// ... (остальной код остается без изменений до функции submitToGoogleSheets)

// Функция для чтения файлов в base64
async function readFilesAsBase64(files) {
  const filePromises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Извлекаем base64 часть (убираем data:image/png;base64, префикс)
        const base64 = e.target.result.split(',')[1];
        resolve({
          filename: file.name,
          mimeType: file.type,
          base64: base64,
          size: file.size
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  
  return Promise.all(filePromises);
}

// Функция для отправки данных в Google Sheets (обновленная)
async function submitToGoogleSheets(formData, files) {
  try {
    // Подготавливаем файлы для отправки
    let filesData = [];
    if (files && files.length > 0) {
      filesData = await readFilesAsBase64(files);
    }
    
    // Добавляем файлы к данным формы
    const dataToSend = {
      ...formData,
      files: filesData
    };
    
    const response = await fetch(SHEET_CONFIG.WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(dataToSend)
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      return { success: true, data: result };
    } else {
      throw new Error(result.message || 'Ошибка при отправке данных');
    }
    
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    throw error;
  }
}

// Обновите обработчик отправки формы
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  // Сбор данных формы
  const formData = {
    timestamp: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    name: document.getElementById('name').value,
    platformSection: document.getElementById('platformSection').value,
    role: document.getElementById('role').value,
    type: document.getElementById('type').value,
    priority: document.getElementById('priority').value,
    problemDescription: document.getElementById('problemDescription').value || '',
    expectedActual: document.getElementById('expectedActual').value || '',
    improvementDescription: document.getElementById('improvementDescription').value || '',
    suggestion: document.getElementById('suggestion').value || '',
    purpose: document.getElementById('purpose').value || '',
    questionText: document.getElementById('questionText').value || '',
    mediaUrl: document.getElementById('mediaUrl').value || '',
    taskLink: document.getElementById('taskLink').value || ''
  };
  
  // Получаем выбранные файлы
  const filesInput = document.getElementById('screenshots');
  const files = filesInput.files;
  
  // Показать индикатор загрузки
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.innerHTML;
  submitBtn.classList.add('sending');
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
  submitBtn.disabled = true;
  
  try {
    // Отправка данных (передаем и файлы)
    const result = await submitToGoogleSheets(formData, files);
    
    // Показать успешное сообщение
    showModal(successModal);
    submitBtn.classList.remove('sending');
    submitBtn.classList.add('success');
    setTimeout(() => submitBtn.classList.remove('success'), 3000);
    
    // Сбросить форму
    form.reset();
    formChanged = false;
    hideAllConditionalFields();
    
    // Очистить поле файлов
    filesInput.value = '';
    
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
        console.log(`${files.length} файлов выбрано`);
    }
});

// ========== ИНФОРМАЦИОННЫЕ ИКОНКИ С ПОДСКАЗКАМИ ==========

 document.addEventListener('DOMContentLoaded', function() {
    // Создаем иконки с tooltip
    createInfoIcons();
    
    // Обработчики для tooltip
    setupTooltipInteractions();
});

function createInfoIcons() {
    // Массив полей и их подсказок
    const tooltips = [
        {
            fieldId: 'improvementGroup',
            tooltipText: 'Пример:\n1. Создать задание / войти в конструктор контента\n2. Добавить текстовый блок\n3. Написать текст\n4. Выделить текст в рамку'
        },
        {
            fieldId: 'suggestionGroup',
            tooltipText: 'Пример:\nОжидаемый: можно выбрать ширину рамки, либо, чтобы она заканчивалась сразу после текста, либо чтобы она была на всю ширину строки\nФактический: регулировать ширину нельзя, рамка растягивается на всю строку'
        },
        {
            fieldId: 'purposeGroup',
            tooltipText: 'Пример:\nЭто позволит снизить нагрузку на худредакцию, т.к. откроет больше возможностей для самостоятельного оформления контента на платформе'
        },
        {
            fieldId: 'bugDescriptionGroup',
            tooltipText: 'Пример:\n1. Создать задание / войти в конструктор заданий\n2. Создать вопрос с типом ответа "выбор варианта"\n3. В варианте ответа написать формулу\nИЛИ\nСгенерировать вопросы с выбором ответа по математике, предполагающие использование формул (например по запросу "формулы сокращенного умножения")'
        },
        {
            fieldId: 'resultsGroup',
            tooltipText: 'Пример:\nОжидаемый: доступно добавление формул вручную, работает преобразование формул из записи с $$\nФактический: не доступно добавление формул, не реализовано преобразование формул из записи с $$'
        }
    ];
    
    tooltips.forEach(({ fieldId, tooltipText }) => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        const label = field.querySelector('label');
        if (!label) return;
        
        // Удаляем существующую иконку, если есть
        const existingIcon = label.querySelector('.info-icon');
        if (existingIcon) existingIcon.remove();
        
        // Создаем контейнер для иконки
        const iconContainer = document.createElement('span');
        iconContainer.className = 'tooltip-container';
        iconContainer.style.display = 'inline-flex';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.marginLeft = '8px';
        
        // Создаем иконку
        const icon = document.createElement('span');
        icon.className = 'info-icon';
       icon.textContent = 'i';
        icon.setAttribute('aria-label', 'Информация');
        icon.setAttribute('role', 'button');
        icon.setAttribute('tabindex', '0');
        
        // Создаем tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip tooltip-top';
        tooltip.setAttribute('role', 'tooltip');
        
        // Добавляем контент в tooltip
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        tooltipContent.textContent = tooltipText;
        
        // Добавляем кнопку закрытия
        const closeButton = document.createElement('button');
        closeButton.className = 'tooltip-close';
        closeButton.innerHTML = '×';
        closeButton.setAttribute('aria-label', 'Закрыть подсказку');
        
        closeButton.addEventListener('click', function(e) {
           e.preventDefault();
    e.stopPropagation();

    tooltip.classList.remove('active');
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';

    icon.focus();

    console.log('Tooltip closed with cross button');
        });
        
        tooltip.appendChild(tooltipContent);
        tooltip.appendChild(closeButton);
        
       // ВАЖНО: Добавляем иконку и подсказку как СОСЕДЕЙ
        iconContainer.appendChild(icon);
        iconContainer.appendChild(tooltip);
        
        
        // Добавляем контейнер в label
        label.appendChild(iconContainer);
    });
}

function setupTooltipInteractions() {
  const infoIcons = document.querySelectorAll('.info-icon');

  infoIcons.forEach(icon => {
    const tooltip = icon.nextElementSibling; 
    const container = icon.closest('.tooltip-container');
    const closeBtn = tooltip.querySelector('.tooltip-close');

    function showTooltip() {
      tooltip.classList.add('active');
      if (container) container.classList.add('active-parent');
      adjustTooltipPosition(tooltip, icon);
    }
      
    function hideTooltip() {
      if (!tooltip.classList.contains('pinned')) {
        tooltip.classList.remove('active');
        if (container) container.classList.remove('active-parent');
      }
    }

    // Обработчик для иконки
    icon.addEventListener('mouseenter', showTooltip);
    icon.addEventListener('mouseleave', hideTooltip);

    icon.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      if (tooltip.classList.contains('pinned')) {
        tooltip.classList.remove('pinned', 'active');
        if (container) container.classList.remove('active-parent');
      } else {
        // Скрываем другие активные подсказки
        document.querySelectorAll('.tooltip.active').forEach(tip => {
          tip.classList.remove('pinned', 'active');
          const parent = tip.closest('.tooltip-container');
          if (parent) parent.classList.remove('active-parent');
        });

        tooltip.classList.add('pinned');
        showTooltip();
      }
    });

    // Обработчик для кнопки закрытия
    closeBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      tooltip.classList.remove('pinned', 'active');
      if (container) container.classList.remove('active-parent');
      icon.focus();
    });
  });

  // Клик вне подсказки
  document.addEventListener('click', () => {
    document.querySelectorAll('.tooltip.active').forEach(tip => {
      tip.classList.remove('pinned', 'active');
      const parent = tip.closest('.tooltip-container');
      if (parent) parent.classList.remove('active-parent');
    });
  });

    //Позиционирование подсказки
function adjustTooltipPosition(tooltip, icon) {
  const tooltipRect = tooltip.getBoundingClientRect();
  const iconRect = icon.getBoundingClientRect();
  const viewportHeight = window.innerHeight;

  // Проверяем доступное место снизу и сверху иконки
  const spaceBelow = viewportHeight - iconRect.bottom;
  const spaceAbove = iconRect.top;

  // Убираем классы позиционирования
  tooltip.classList.remove('tooltip-top', 'tooltip-bottom');

  // Выбираем позицию показывать сверху, если снизу мало места
  if (spaceBelow < tooltipRect.height + 10 && spaceAbove > tooltipRect.height + 10) {
    tooltip.classList.add('tooltip-top');
  } else {
    tooltip.classList.add('tooltip-bottom');
  }
}
    
}
