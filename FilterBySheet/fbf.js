'use strict';

(function () {

  tableau.extensions.initializeAsync({'configure': configure}).then(function () {
    const settings = window.tableau.extensions.settings.getAll();
    if (settings.configured !== 'true') {
        configure();
    }
    setListener();
  });

  function configure() {
    let currentUrl = location.href;
    let url = currentUrl.substring(0, currentUrl.lastIndexOf('/')) + '/config.html';
    tableau.extensions.ui.displayDialogAsync(url,'',{ height: 400, width: 500 }).then((closePayload) => {

    }).catch((err) => {
      switch (err.errorCode) {
        case tableau.ErrorCodes.DialogClosedByUser:
          console.log("Dialog was closed by user.");
          break;
        default:
          console.error('Error while configuring: ' + err.toString());
      }
    });
  }
})();

function setListener() {
    let dashboard = tableau.extensions.dashboardContent.dashboard;
    let sheet2 = dashboard.worksheets.find(w => w.name === tableau.extensions.settings.get('sheet2'));
    sheet2.removeEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
    sheet2.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
}

function filterChangedHandler(evt) {
    let field2 = tableau.extensions.settings.get('field2');
    let newValues = new Set();
    evt.sheet.getSummaryDataAsync().then(sumdata => {
        if (sumdata.data.length > 0) {
            let idx = sumdata.columns.find(c => c.fieldName === field2).index;
            sumdata.data.forEach(row => {
                newValues.add(row[idx].formattedValue);
            });
        }

        let sheet1 = tableau.extensions.dashboardContent.dashboard.worksheets.find(
            w => w.name === tableau.extensions.settings.get('sheet1'));
        sheet1.applyFilterAsync(tableau.extensions.settings.get('filter1'),
            Array.from(newValues),
            tableau.FilterUpdateType.Replace,
            false
        );
    });
}
