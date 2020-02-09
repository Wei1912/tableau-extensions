'use strict';

let parameterDict = {};

(function () {
    tableau.extensions.initializeDialogAsync().then(function (openPayload) {
      let dashboard = tableau.extensions.dashboardContent.dashboard;

      // filter source, sheet
      let sheet1Select = document.getElementById('sheet1');
      initSheetSelect(sheet1Select, dashboard.worksheets, 'sheet1');
      // filter source, filter
      let filter1Select = document.getElementById('filter1');
      initFilterSelect(filter1Select, sheet1Select, dashboard.worksheets, 'filter1');

      // filter target, sheet
      let sheet2Select = document.getElementById('sheet2');
      initSheetSelect(sheet2Select, dashboard.worksheets, 'sheet2');
      // filter source, field
      let field2Select = document.getElementById('field2');
      initFieldSelect(field2Select, sheet2Select, dashboard.worksheets, 'field2');


      let cancelButton = document.getElementById('button-cancel');
      cancelButton.addEventListener('click', onClickCancleButton)
      let okButton = document.getElementById('button-ok');
      okButton.addEventListener('click', onClickOKButton);

    });
})();


function initSheetSelect(obj, sheets, saveKey) {
  let defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.innerText = 'Select a worksheet';
  obj.appendChild(defaultOption);

  sheets.forEach(function (sheet) {
    let o = document.createElement('option');
    o.value = sheet.name;
    o.innerText = sheet.name;
    obj.appendChild(o);
  });

  let savedValue = tableau.extensions.settings.get(saveKey);
  if (savedValue) {
    obj.value = savedValue;
  }
}

function initFilterSelect(obj, relatedSheetSelect, sheets, saveKey) {
  let defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.innerText = 'Select a filter';
  obj.appendChild(defaultOption);

  if (relatedSheetSelect.value) {
    sheets.find(w => w.name === relatedSheetSelect.value).getFiltersAsync().then(filters => {
      filters.forEach(f => {
        let o = document.createElement('option');
        o.value = f.fieldName;
        o.innerHTML = f.fieldName;
        obj.appendChild(o);
      });

      let savedValue = tableau.extensions.settings.get(saveKey);
      console.log('savedValue ' + saveKey + ':' + savedValue);
      if (savedValue) {
        obj.value = savedValue;
      }
    });
  }

  // set filter options by selected sheet
  relatedSheetSelect.addEventListener('change', function() {
    for (let i = obj.options.length - 1; i > 0; i--) {
      obj.remove(i);
    }
    let v = this.options[this.selectedIndex].value.trim();
    if (v) {
      sheets.find(w => w.name === v).getFiltersAsync().then(filters => {
        filters.forEach(f => {
          let o = document.createElement('option');
          o.value = f.fieldName;
          o.innerHTML = f.fieldName;
          obj.appendChild(o);
        });
      });
    }
  });
}

function initFieldSelect(obj, relatedSheetSelect, sheets, saveKey) {
  let defaultOption = document.createElement('option');
  defaultOption.innerText = 'Select a field';
  obj.appendChild(defaultOption);

  if (relatedSheetSelect.value) {
    sheets.find(w => w.name === relatedSheetSelect.value).getSummaryDataAsync().then(sumdata => {
      sumdata.columns.forEach(col => {
        let o = document.createElement('option');
        o.value = col.fieldName;
        o.innerText = col.fieldName;
        obj.appendChild(o);
      });

      let savedValue = tableau.extensions.settings.get(saveKey);
      if (savedValue) {
        obj.value = savedValue;
      }
    });
  }

  // set field options by selected sheet
  relatedSheetSelect.addEventListener('change', function() {
    for (let i = obj.options.length - 1; i > 0; i--) {
      obj.remove(i);
    }
    let v = this.options[this.selectedIndex].value.trim();
    if (v) {
      sheets.find(w => w.name === v).getSummaryDataAsync().then(sumdata => {
        sumdata.columns.forEach(col => {
          let o = document.createElement('option');
          o.value = col.fieldName;
          o.innerText = col.fieldName;
          obj.appendChild(o);
        });
      });
    }
  });
}

function onClickCancleButton() {
  tableau.extensions.ui.closeDialog('');
}
function onClickOKButton() {
  tableau.extensions.settings.set('configured', 'true');
  tableau.extensions.settings.set('sheet1', document.getElementById('sheet1').value);
  tableau.extensions.settings.set('filter1', document.getElementById('filter1').value);
  tableau.extensions.settings.set('sheet2', document.getElementById('sheet2').value);
  tableau.extensions.settings.set('field2', document.getElementById('field2').value);

  tableau.extensions.settings.saveAsync().then(result => {
    console.log(result);
  });
  tableau.extensions.ui.closeDialog('');
 }
