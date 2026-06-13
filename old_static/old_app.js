// ============================================================
// app.js — multi-page quiz, validation, API call, results
// ============================================================

// ------ CONFIG ------
var API_URL = '';  // empty = same origin (for Railway single-service deploy)
var MAX_SCANS = 2;
var TOTAL_PAGES = 7;
var currentPage = 1;

var MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
var ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];


// ============================================================
// SESSION TOKEN (anonymous, for rate limiting only)
// ============================================================

function getOrCreateToken() {
  var key = 'fe_session_token';
  var token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID ? crypto.randomUUID() :
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    localStorage.setItem(key, token);
  }
  return token;
}

function getLocalScanCount() {
  return parseInt(localStorage.getItem('fe_scan_count') || '0', 10);
}

function incrementLocalScanCount() {
  var c = getLocalScanCount() + 1;
  localStorage.setItem('fe_scan_count', String(c));
  return c;
}

function updateScansLeftUI() {
  var el = document.getElementById('scans-left');
  if (!el) return;
  var remaining = Math.max(0, MAX_SCANS - getLocalScanCount());
  el.textContent = remaining + ' of ' + MAX_SCANS + ' scans remaining';
  if (remaining <= 0) {
    var btn = document.getElementById('analyze-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'No Scans Remaining'; }
  }
}


// ============================================================
// DISCLAIMER
// ============================================================

var consentCheck = document.getElementById('consent-check');
var ageCheck = document.getElementById('age-check');
var consentBtn = document.getElementById('consent-btn');

function updateConsentBtn() {
  if (consentCheck.checked && ageCheck.checked) {
    consentBtn.classList.add('active');
  } else {
    consentBtn.classList.remove('active');
  }
}
consentCheck.addEventListener('change', updateConsentBtn);
ageCheck.addEventListener('change', updateConsentBtn);

consentBtn.addEventListener('click', function () {
  if (!consentCheck.checked || !ageCheck.checked) return;
  document.getElementById('disclaimer-overlay').style.display = 'none';
  showPage(1);
  updateScansLeftUI();
});


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(num) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('visible'); });
  var page = document.getElementById('page-' + num);
  if (page) {
    page.classList.add('visible');
    currentPage = num;
    window.scrollTo(0, 0);
  }
}

function showResults() {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('visible'); });
  document.getElementById('results-page').classList.add('visible');
  window.scrollTo(0, 0);
}


// ============================================================
// ERROR HELPERS
// ============================================================

function showError(fieldName, msg) {
  var el = document.getElementById(fieldName + '-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearError(fieldName) {
  var el = document.getElementById(fieldName + '-error');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function clearPageErrors(pageNum) {
  var page = document.getElementById('page-' + pageNum);
  if (!page) return;
  page.querySelectorAll('.field-error').forEach(function (el) {
    el.textContent = ''; el.style.display = 'none';
  });
}


// ============================================================
// SINGLE-SELECT OPTION CARDS
// ============================================================

function setupOptionGroup(groupId, hiddenId) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', function (e) {
    var card = e.target.closest('.option-card');
    if (!card) return;
    group.querySelectorAll('.option-card').forEach(function (c) { c.classList.remove('selected'); });
    card.classList.add('selected');
    document.getElementById(hiddenId).value = card.dataset.value;
    clearError(hiddenId);
  });
}

setupOptionGroup('routine-group', 'skincare_routine');
setupOptionGroup('bodytype-group', 'body_type');
setupOptionGroup('fitness-group', 'gym_fitness');


// ============================================================
// MULTI-SELECT OPTION CARDS (goal — max 2)
// ============================================================

(function () {
  var group = document.getElementById('goal-group');
  if (!group) return;

  group.addEventListener('click', function (e) {
    var card = e.target.closest('.option-card');
    if (!card) return;

    if (card.classList.contains('selected')) {
      card.classList.remove('selected');
    } else {
      var count = group.querySelectorAll('.option-card.selected').length;
      if (count >= 2) return;
      card.classList.add('selected');
    }

    var selected = [];
    group.querySelectorAll('.option-card.selected').forEach(function (c) { selected.push(c.dataset.value); });
    document.getElementById('primary_goal').value = selected.join(',');
    document.getElementById('goal-count').textContent = selected.length + '/2 selected';
    clearError('primary_goal');
  });
})();


// ============================================================
// CURRENCY TOGGLE + BUDGET SELECTION
// ============================================================

(function () {
  var currencyGroup = document.getElementById('currency-group');
  var inrGroup = document.getElementById('budget-group-inr');
  var aedGroup = document.getElementById('budget-group-aed');
  if (!currencyGroup || !inrGroup || !aedGroup) return;

  // Currency chip toggle
  currencyGroup.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    currencyGroup.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('selected'); });
    chip.classList.add('selected');
    var currency = chip.dataset.value;
    document.getElementById('currency').value = currency;

    // Show the right budget group, hide the other
    if (currency === 'aed') {
      inrGroup.style.display = 'none';
      aedGroup.style.display = 'flex';
    } else {
      inrGroup.style.display = 'flex';
      aedGroup.style.display = 'none';
    }

    // Clear any previous budget selection
    inrGroup.querySelectorAll('.option-card').forEach(function (c) { c.classList.remove('selected'); });
    aedGroup.querySelectorAll('.option-card').forEach(function (c) { c.classList.remove('selected'); });
    document.getElementById('monthly_budget').value = '';
  });

  // Budget card selection (wire both groups)
  [inrGroup, aedGroup].forEach(function (group) {
    group.addEventListener('click', function (e) {
      var card = e.target.closest('.option-card');
      if (!card) return;
      group.querySelectorAll('.option-card').forEach(function (c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      document.getElementById('monthly_budget').value = card.dataset.value;
      clearError('monthly_budget');
    });
  });
})();


// ============================================================
// SINGLE-SELECT CHIP GROUP (gender)
// ============================================================

function setupSingleChipGroup(groupId, hiddenId) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('selected'); });
    chip.classList.add('selected');
    document.getElementById(hiddenId).value = chip.dataset.value;
    clearError(hiddenId);
  });
}

setupSingleChipGroup('gender-group', 'gender');


// ============================================================
// MULTI-SELECT CHIP GROUP (skin issues — at least 1)
// ============================================================

(function () {
  var group = document.getElementById('skin-issues-group');
  if (!group) return;

  group.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;
    var val = chip.dataset.value;

    // "None" clears everything else
    if (val === 'none') {
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('selected'); });
      chip.classList.add('selected');
    } else {
      // deselect "none" if something else picked
      group.querySelector('[data-value="none"]').classList.remove('selected');
      chip.classList.toggle('selected');
    }

    // collect selected values
    var selected = [];
    group.querySelectorAll('.chip.selected').forEach(function (c) { selected.push(c.dataset.value); });
    document.getElementById('skin_issues').value = selected.join(',');
    clearError('skin_issues');
  });
})();


// ============================================================
// MULTI-SELECT CHIP GROUP (style — max 2)
// ============================================================

(function () {
  var group = document.getElementById('style-group');
  if (!group) return;

  group.addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip) return;

    if (chip.classList.contains('selected')) {
      chip.classList.remove('selected');
    } else {
      var count = group.querySelectorAll('.chip.selected').length;
      if (count >= 2) return; // max 2
      chip.classList.add('selected');
    }

    var selected = [];
    group.querySelectorAll('.chip.selected').forEach(function (c) { selected.push(c.dataset.value); });
    document.getElementById('style_type').value = selected.join(',');
    document.getElementById('style-count').textContent = selected.length + '/2 selected';
    clearError('style_type');
  });
})();


// ============================================================
// SLEEP CALCULATOR
// ============================================================

function updateSleepCalc() {
  var bed = document.getElementById('sleep_bed').value;
  var wake = document.getElementById('sleep_wake').value;
  if (!bed || !wake) return;

  var bParts = bed.split(':').map(Number);
  var wParts = wake.split(':').map(Number);
  var mins = (wParts[0] * 60 + wParts[1]) - (bParts[0] * 60 + bParts[1]);
  if (mins < 0) mins += 1440;

  var hrs = Math.floor(mins / 60);
  var rm = mins % 60;
  var quality = hrs < 6 ? '⚠️ Below recommended' : hrs <= 8 ? '✅ Good range' : '💤 Generous';
  document.getElementById('sleep-calc').textContent = hrs + 'h' + (rm > 0 ? ' ' + rm + 'm' : '') + ' — ' + quality;
}

document.getElementById('sleep_bed').addEventListener('change', updateSleepCalc);
document.getElementById('sleep_wake').addEventListener('change', updateSleepCalc);


// ============================================================
// PHOTO HANDLING
// ============================================================

var photoFiles = { front: null, left: null, right: null, body: null };
var photoKeys = ['front', 'left', 'right', 'body'];

photoKeys.forEach(function (key) {
  var input = document.getElementById('photo-' + key);
  if (!input) return;

  input.addEventListener('change', function () {
    var file = input.files[0];
    if (!file) return;

    if (ALLOWED_IMAGE_TYPES.indexOf(file.type) === -1) {
      alert('Only JPG and PNG files are allowed.');
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      alert('Image must be under 10 MB.');
      input.value = '';
      return;
    }

    photoFiles[key] = file;

    // show preview
    var box = document.getElementById('photo-box-' + key);
    var existing = box.querySelector('img');
    if (existing) existing.remove();

    var reader = new FileReader();
    reader.onload = function (ev) {
      var img = document.createElement('img');
      img.src = ev.target.result;
      box.appendChild(img);
      box.classList.add('has-photo');
    };
    reader.readAsDataURL(file);

    updatePhotoCount();
    clearError('photos');
  });
});

function updatePhotoCount() {
  var count = 0;
  photoKeys.forEach(function (k) { if (photoFiles[k]) count++; });
  document.getElementById('photo-count').textContent = count + ' of 4 photos taken';

  var btn = document.getElementById('analyze-btn');
  if (count >= 3 && getLocalScanCount() < MAX_SCANS) {
    btn.disabled = false;
  } else if (count < 3) {
    btn.disabled = true;
  }
}


// ============================================================
// PER-PAGE VALIDATION
// ============================================================

function validatePage(num) {
  clearPageErrors(num);
  var valid = true;

  switch (num) {
    case 1: {
      var age = parseInt(document.getElementById('age').value, 10);
      if (isNaN(age) || age < 18 || age > 50) {
        showError('age', 'Age must be between 18 and 50.');
        valid = false;
      }
      if (!document.getElementById('gender').value) {
        showError('gender', 'Please select your gender.');
        valid = false;
      }
      if (!document.getElementById('ethnicity').value) {
        showError('ethnicity', 'Please select your ethnicity.');
        valid = false;
      }
      break;
    }
    case 2: {
      if (!document.getElementById('city').value) {
        showError('city', 'Please select your city.');
        valid = false;
      }
      if (!document.getElementById('primary_goal').value) {
        showError('primary_goal', 'Please pick at least 1 goal.');
        valid = false;
      }
      break;
    }
    case 3: {
      if (!document.getElementById('skincare_routine').value) {
        showError('skincare_routine', 'Please select your current routine.');
        valid = false;
      }
      if (!document.getElementById('skin_issues').value) {
        showError('skin_issues', 'Please select at least one option.');
        valid = false;
      }
      break;
    }
    case 4: {
      if (!document.getElementById('body_type').value) {
        showError('body_type', 'Please select your body type.');
        valid = false;
      }
      var h = parseInt(document.getElementById('height').value, 10);
      if (isNaN(h) || h < 120 || h > 230) {
        showError('height', 'Height must be between 120 and 230 cm.');
        valid = false;
      }
      var w = parseInt(document.getElementById('weight').value, 10);
      if (isNaN(w) || w < 30 || w > 200) {
        showError('weight', 'Weight must be between 30 and 200 kg.');
        valid = false;
      }
      break;
    }
    case 5: {
      if (!document.getElementById('style_type').value) {
        showError('style_type', 'Please pick at least 1 style.');
        valid = false;
      }
      if (!document.getElementById('monthly_budget').value) {
        showError('monthly_budget', 'Please select a budget range.');
        valid = false;
      }
      break;
    }
    case 6: {
      if (!document.getElementById('gym_fitness').value) {
        showError('gym_fitness', 'Please select your fitness frequency.');
        valid = false;
      }
      // sleep always has a default value, no validation needed
      break;
    }
    case 7: {
      var count = 0;
      photoKeys.forEach(function (k) { if (photoFiles[k]) count++; });
      if (count < 3) {
        showError('photos', 'Please upload at least 3 photos.');
        valid = false;
      }
      break;
    }
  }

  return valid;
}


// ============================================================
// NEXT / BACK BUTTON WIRING
// ============================================================

for (var i = 1; i < TOTAL_PAGES; i++) {
  (function (pageNum) {
    var nextBtn = document.getElementById('next-' + pageNum);
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (validatePage(pageNum)) {
          showPage(pageNum + 1);
        }
      });
    }
  })(i);
}

for (var j = 2; j <= TOTAL_PAGES; j++) {
  (function (pageNum) {
    var backBtn = document.getElementById('back-' + pageNum);
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        showPage(pageNum - 1);
      });
    }
  })(j);
}


// ============================================================
// COLLECT ALL QUIZ DATA
// ============================================================

function collectQuizData() {
  var bed = document.getElementById('sleep_bed').value;
  var wake = document.getElementById('sleep_wake').value;
  var bParts = bed.split(':').map(Number);
  var wParts = wake.split(':').map(Number);
  var sleepMins = (wParts[0] * 60 + wParts[1]) - (bParts[0] * 60 + bParts[1]);
  if (sleepMins < 0) sleepMins += 1440;
  var sleepHours = Math.round((sleepMins / 60) * 10) / 10;

  var height = parseFloat(document.getElementById('height').value);
  var weight = parseFloat(document.getElementById('weight').value);
  var bmi = Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;

  return {
    age: parseInt(document.getElementById('age').value, 10),
    gender: document.getElementById('gender').value,
    ethnicity: document.getElementById('ethnicity').value,
    city: document.getElementById('city').value,
    primary_goal: document.getElementById('primary_goal').value,
    skincare_routine: document.getElementById('skincare_routine').value,
    skin_issues: document.getElementById('skin_issues').value,
    body_type: document.getElementById('body_type').value,
    height: height,
    weight: weight,
    bmi: bmi,
    style_type: document.getElementById('style_type').value,
    monthly_budget: document.getElementById('monthly_budget').value,
    currency: document.getElementById('currency').value,
    gym_fitness: document.getElementById('gym_fitness').value,
    sleep_bed: bed,
    sleep_wake: wake,
    sleep_hours: sleepHours,
  };
}


// ============================================================
// API CALL
// ============================================================

document.getElementById('analyze-btn').addEventListener('click', function () {
  if (getLocalScanCount() >= MAX_SCANS) {
    document.getElementById('status').textContent = 'You have used all your available scans.';
    return;
  }
  if (!validatePage(7)) return;
  performAnalysis();
});

async function performAnalysis() {
  var token = getOrCreateToken();
  var quizData = collectQuizData();

  var formData = new FormData();
  formData.append('quiz_data', JSON.stringify(quizData));

  // Append whichever photos exist
  photoKeys.forEach(function (key) {
    if (photoFiles[key]) {
      formData.append('images', photoFiles[key], key + '.jpg');
    }
  });

  var btn = document.getElementById('analyze-btn');
  var status = document.getElementById('status');
  btn.disabled = true;
  btn.textContent = 'Analysing...';
  status.textContent = 'Sending to server — this may take a moment...';

  try {
    var response = await fetch(API_URL + '/scan', {
      method: 'POST',
      headers: { 'X-Session-Token': token },
      body: formData,
    });

    if (response.status === 429) {
      localStorage.setItem('fe_scan_count', String(MAX_SCANS));
      updateScansLeftUI();
      status.textContent = 'You have used all your available scans. Thank you for testing!';
      return;
    }

    if (!response.ok) {
      try {
        var errData = await response.json();
        throw new Error(errData.error || errData.detail || 'Server returned ' + response.status);
      } catch (parseErr) {
        if (parseErr.message) throw parseErr;
        throw new Error('Server returned ' + response.status);
      }
    }

    var data = await response.json();
    console.log('Server response:', data);

    incrementLocalScanCount();
    updateScansLeftUI();
    displayResults(data);

  } catch (err) {
    status.textContent = 'Error: ' + err.message;
    console.error('API error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Perform Analysis';
    updatePhotoCount(); // re-check button state
    if (getLocalScanCount() >= MAX_SCANS) {
      btn.disabled = true;
      btn.textContent = 'No Scans Remaining';
    }
  }
}


// ============================================================
// RESULTS
// ============================================================

function displayResults(data) {
  document.getElementById('status').textContent = '';
  var output = '';

  if (typeof data === 'string') {
    output = data;
  } else if (data.report) {
    // Walk through report keys
    Object.keys(data.report).forEach(function (key) {
      var value = data.report[key];
      var label = key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      output += '--- ' + label + ' ---\n';
      if (Array.isArray(value)) {
        output += value.join('\n') + '\n\n';
      } else if (typeof value === 'object') {
        // handle structured tool output like {observation, suggestion}
        Object.keys(value).forEach(function (subKey) {
          output += subKey.charAt(0).toUpperCase() + subKey.slice(1) + ': ' + value[subKey] + '\n';
        });
        output += '\n';
      } else {
        output += value + '\n\n';
      }
    });
  } else if (data.skin || data.eyes || data.hydration || data.overall) {
    // Direct tool output from Claude (wellness_analysis tool response)
    var sections = ['skin', 'eyes', 'hydration', 'overall'];
    sections.forEach(function (key) {
      if (data[key]) {
        var label = key.charAt(0).toUpperCase() + key.slice(1);
        output += '--- ' + label + ' ---\n';
        if (data[key].observation) output += data[key].observation + '\n';
        if (data[key].suggestion) output += data[key].suggestion + '\n';
        output += '\n';
      }
    });
    if (data.disclaimer) {
      output += '---\n' + data.disclaimer + '\n';
    }
  } else {
    output = JSON.stringify(data, null, 2);
  }

  document.getElementById('results-content').textContent = output;
  showResults();
}


// ============================================================
// RESULTS BACK BUTTON
// ============================================================

document.getElementById('back-btn').addEventListener('click', function () {
  showPage(1);
  updateScansLeftUI();
});