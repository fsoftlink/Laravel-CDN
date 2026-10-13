function smsTable(resData = {}, divId = '') {
    const thead = resData.thead || null;
    const tbody = resData.tbody || [];
    const checkbox = resData.checkbox ?? false;
    const skipKeys = resData.skip_keys || [];

    if (!thead || !tbody.length) {
        document.getElementById(divId).innerHTML =
            "<div class='text-center p-3 fw-bold'>No data available</div>";
        return;
    }

    // Detect Primary Key
    let pk = '';
    if ('pk' in thead) pk = 'pk';
    else if ('user_id' in thead) pk = 'user_id';
    else if ('email' in thead) pk = 'email';
    else if ('username' in thead) pk = 'username';
    else if ('id' in thead) pk = 'id';
    else if ('sl' in thead) pk = 'sl';

    const alignMap = {c: 'text-center',  l: 'text-start', r: 'text-end'};

    const keys = Object.keys(thead);

    let html = `<div class="table-responsive">
                    <table class="smsTbl table table-striped table-sm table-bordered align-middle">
                        <thead>
                            <tr> `;
    if (checkbox) {     html += `<th class="text-center">Select</th>`;    }

    // Header
    keys.forEach(key => {
        if (skipKeys.includes(key)) return;

        const config = thead[key];
        const align = alignMap[config.align] || 'text-start';

        html += `<th class="${align}" data-key="${key}" style="cursor:pointer"> ${config.label} </th> `;
    });
    html += `</tr> </thead> <tbody>`;

    // Body
    tbody.forEach(row => {
        const pkv = row[pk] ?? '';
        html += '<tr>';

        if (checkbox) {
            html += `<td class="text-center">
                        <input type="checkbox" class="row-checkbox" value="${pkv}">
                    </td>`;
        }

        keys.forEach(key => {
            if (skipKeys.includes(key)) return;

            let rowVal = row[key] ?? '';
            const align = alignMap[thead[key]?.align] || 'text-start';

            let payload = '';
            let funcName = 'na';
            let inputType = 'text';
            let inputVal = '';
            let selectOption = [];

            if (typeof rowVal === 'object' && rowVal !== null) {
                payload = rowVal.payload ?? '';
                funcName = rowVal.func ?? 'na';
                inputType = rowVal.type ?? 'text';
                inputVal = rowVal.value ?? '';
                selectOption = rowVal.option ?? [];
            }

            // Delete Button
            if (key.endsWith('_del')) {
                rowVal = `
                    <button class="btn btn-sm btn-danger" data-payload='${JSON.stringify(payload)}' data-func="${funcName}">
                        Delete
                    </button>`;
            }

            // Edit Button
            else if (key.endsWith('_edit')) {
                rowVal = `
                    <button class="btn btn-sm btn-primary" data-payload='${JSON.stringify(payload)}' data-func="${funcName}">
                        Edit
                    </button>`;
            }

            // Input
            else if (key.endsWith('_input')) {
                rowVal = `<input type="${inputType}" class="form-control" value="${inputVal}" data-payload='${JSON.stringify(payload)}'
                 data-func="${funcName}" style="width:100px;">  `;
            }

            // Select
            else if (key.endsWith('_select')) {
                let optionHtml = `<option value="">-Select-</option>`;

                selectOption.forEach(option => {
                    optionHtml += `<option value="${option.value}" ${option.selected ? 'selected' : ''}> ${option.label}</option> `;
                });

                rowVal = `<select class="form-select form-select-sm" data-payload='${JSON.stringify(payload)}'
                            data-func="${funcName}" style="width:100px;"> ${optionHtml} </select> `;
            }

            html += ` <td class="${align}" nowrap="nowrap"> ${rowVal}</td> `;
        });
        html += '</tr>';
    });

    html += ` </tbody> </table> </div> `;
    document.getElementById(divId).innerHTML = html;
}
