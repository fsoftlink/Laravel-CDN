const apiAxios = axios.create({ withCredentials: true });

const statusCodeHandlers = {
  // 2xx Success (type: 'info' ya default 'log')
  200: (data) => onConsole({ msg: "200 OK: Successful.", data }),
  201: (data) => onConsole({ msg: "201 Created: Successfully created.", data }),
  204: (data) => onConsole({ msg: "204 No Content: Processed, but no content.", data }),

  // 3xx Redirection (type: 'warn')
  301: (data) => onConsole({ msg: "301 Moved Permanently: Resource moved.", data, type: "warn" }),
  302: (data) => onConsole({ msg: "302 Found: Resource temporarily elsewhere.", data, type: "warn" }),
  304: (data) => onConsole({ msg: "304 Not Modified: Cached resource used.", data, type: "warn" }),

  // 4xx Client Errors (type: 'error' / 'warn')
  400: (data) => onConsole({ msg: "400 Bad Request: Bad syntax.", data, type: "error" }),
  401: (data) => onConsole({ msg: "401 Unauthorized: Authentication required.", data, type: "warn" }),
  403: (data) => onConsole({ msg: "403 Forbidden: Access denied.", data, type: "warn" }),
  404: (data) => onConsole({ msg: "404 Not Found: Resource not found.", data, type: "error" }),
  405: (data) => onConsole({ msg: "405 Method Not Allowed: HTTP method invalid.", data, type: "error" }),
  408: (data) => onConsole({ msg: "408 Request Timeout: Server timed out.", data, type: "error" }),
  409: (data) => onConsole({ msg: "409 Conflict: Request conflict.", data, type: "error" }),
  410: (data) => onConsole({ msg: "410 Gone: Resource no longer available.", data, type: "error" }),

  // 5xx Server Errors (type: 'error')
  500: (data) => onConsole({ msg: "500 Internal Server Error: Server error.", data, type: "error" }),
  501: (data) => onConsole({ msg: "501 Not Implemented: Server method unrecognized.", data, type: "error" }),
  502: (data) => onConsole({ msg: "502 Bad Gateway: Invalid response from upstream.", data, type: "error" }),
  503: (data) => onConsole({ msg: "503 Service Unavailable: Server temporarily down.", data, type: "error" }),
  504: (data) => onConsole({ msg: "504 Gateway Timeout: Response timeout.", data, type: "error" })
};

const handleStatus = (status, data = null) => {
  if (statusCodeHandlers[status]) {   statusCodeHandlers[status](data);  } 
  else {  onConsole({ msg: `Unhandled Status Code: ${status}`,  data: data, type: 'warn' });  }
};

// Request Interceptor
apiAxios.interceptors.request.use(function(config) {

    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = 'Bearer ' + token;
    }

    const page_no = localStorage.getItem('page_no');
    if (page_no) {
        config.headers['page_no'] = page_no;
        localStorage.removeItem('page_no');
    }

    const admin_domain_key = localStorage.getItem('admin_domain_key');
    if (admin_domain_key) {
        config.headers['admin_domain_key'] = admin_domain_key;
    }

    return config;
}, function(error) {
    return Promise.reject(error);
});

// Response Interceptor
apiAxios.interceptors.response.use(
    function(response) {
        handleStatus(response.status,response);
        const newToken = response.headers['x-new-token'];
        if (newToken) {
            localStorage.setItem('jwt_token', newToken);
        }
        return response;
    },
    function(error) {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('jwt_token');    window.location.href = 'login.html';
            }
            handleStatus(error.response.status, error);
        } else if (error.request) {  
            onConsole({msg:`🚨 [Network Error]: No response received from server.`,data: error});
        } else {
            onConsole({msg:`🚨 [Axios Setup Error]:`, data: error});
        }
        return Promise.reject(error);
    }
);

async function axiosSubmit(requestObject, path, method = "POST", onProgress = null) {
    try {
		btnsLoading(false);  // disable buttons

        let formData = await getFormData(requestObject); // compress image also
		if(formData == null){	 return { status: "error", message: "Form Data is null at Axios Submit" };		}
		const action = formData.get("action") || 'na';
	    const _method = (formData.get("_method") || method).toUpperCase();	

        let _guest_id = localStorage.getItem('_guest_id');
        if(!_guest_id){   
            localStorage.setItem('_guest_id', Date.now().toString()); 
            _guest_id = localStorage.getItem('_guest_id');
        }
        formData.append('_guest_id', _guest_id);

        let newPath = path;		//<meta name="nodejs" content="true">
        const nodejs = (document.querySelector('meta[name="nodejs"]')?.getAttribute('content') === "true");
        if (nodejs) {    newPath = `${path}/${action}`;      }
		
        let csrfToken = null;
		const laravel = (document.querySelector('meta[name="laravel"]')?.getAttribute('content') === "true");
		if (laravel) {  
            newPath = action;
            csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            if (!csrfToken) {   return { status: "error", message: `CSRF token missing in head <meta name="csrf-token" content="{{ csrf_token() }}">` };     }
        }
		if(action === 'na'){	 return { status: "error", message: `Please add action in Form : ${action}` };		}
		
        // Decide payload type
        let payload = null;
        let headers = {};
        if(csrfToken){     headers['X-CSRF-TOKEN'] = csrfToken;    }
      
        const methodLower = _method.toLowerCase();
        if (["post", "put", "patch"].includes(methodLower)) {
            // 1. Check karein ki FormData me koi bhi File object hai ya nahi
            let hasFile = false;
            for (let value of formData.values()) {
                if (value instanceof File && value.name) {   hasFile = true;    break;    }
            }

            if (hasFile) {
                payload = formData;
                delete headers["Content-Type"];   // Browser isko boundary ke sath khud set karega
            } else {
                payload = Object.fromEntries(formData);
                headers["Content-Type"] = "application/json";
            }
        }
        

        const config = {
            method: _method.toLowerCase(),
            url: newPath,
            headers,
            data: payload,
            onUploadProgress: function (progressEvent) {
                if (progressEvent.lengthComputable && typeof onProgress === 'function') {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percent);
                }
            }
        };
        const response = await apiAxios(config);
        return response.data; // ✅ return clean data

    } catch (error) {
        let myMsg = error.response?.data?.message || error.message || 'Request failed';
        let axiosMsg = error.message || 'Request failed';
        onConsole({msg:"Axios Request Error:", data: axiosMsg});
        return { status: "error", message: `Axios Error Message: ${myMsg}` };
    } finally {
        // ✅ Always runs
        onConsole({msg:"Axios Request finished"});
		btnsLoading(true); // enable buttons
    }
}

/***************************** CLICK FUNC ACTION **********************************/
$(document).on("click", "button[type='submit'], input[type='submit']", async function (e) {

    let btn = this;
    let form = $(btn).closest("form");
    if (form.data("ajax") !== true) { return; }
	e.preventDefault();

	let onProgress = null;
	const progress = form.data("onProgress");
	if (progress && typeof window[progress] === "function") {
		onProgress = progress;
	}

    let form_id = form.attr("id");
    if (!form_id) {  onConsole({msg:"No form ID found, stopping submit inside auto onclick submit"}); return;  }

    let isValid = true;
    let firstError = '';

    form.find("[required]").each(function () {
        let value = $(this).val().trim();
        let fieldName = $(this).attr("name") || "This field";

        if (!value) {
            isValid = false;
            firstError = fieldName + " is required";
            $(this).focus();
            return false; // break loop
        }
    });

    if (!isValid) {   goMsg({ status: "warning", msg: firstError });    return;    }

    const askSubmit = form.data("ask");
	if (askSubmit == true) {
		const result = await dsAlert.question('Are you sure to proceed..??');
        if (result != 'yes') {   return;   } 
	}

    //let formData = new FormData(form[0]);
    let dataObj = { form_id }; // form data auto get by id
	
	//actionPath is a global variable
    try {
		const response = await axiosSubmit(dataObj, actionPath, "POST", onProgress);
		if(response.status === 'success' || response.status === true){
			const callbackName = form.data("callback");
			if (callbackName && typeof window[callbackName] === "function") {
				window[callbackName](response);  
				return; // stop propagation
			}
		}
		showError(form, response) // show error on form
		goMsg(response, dataObj);
	} catch (error) {
		onConsole(`Auto submit error : ${error.message}`);
		goMsg({ status: "error", message: "Opps!!! Something went wrong inside auto onclick submit " });
	} finally {
		//onConsole("Auto Request finished");
	}
});

// 1. CLICK EVENT (Only for Buttons, Links, Checkboxes, and Radios)
document.addEventListener('click', function (e) {
    if (!(e.target instanceof Element)) return;
    const element = e.target.closest('.smsTbl button, .smsTbl a, .smsTbl input[type="checkbox"], .smsTbl input[type="radio"]');
    if (element) {     handleElementAction(element, 'click');    }
});

// 2. CHANGE EVENT (For Select Dropdowns and File Inputs)
document.addEventListener('change', function (e) {
    if (!(e.target instanceof Element)) return;
    const element = e.target.closest('.smsTbl select');
    if (element) {      handleElementAction(element, 'change');    }
});

// 3. BLUR EVENT (For Text Inputs, Textareas, Email, Passwords etc.)
// Note: Blur event bubble nahi hota, isliye 3rd argument 'true' (event capture phase) zaroori hai!
document.addEventListener('blur', function (e) {
    if (!(e.target instanceof Element)) return;
    const element = e.target.closest('.smsTbl input:not([type="checkbox"]):not([type="radio"]), .smsTbl textarea');
    if (element) {      handleElementAction(element, 'blur');    }
}, true); // 👈 Capturing phase active karta hai


function handleElementAction(element, eventType) {
    let payload = {};
    try {
        payload = JSON.parse(element.dataset.payload || '{}');
    } catch (err) {
        payload = element.dataset.payload || {};
    }
    const funName = element.dataset.func || 'na';

    // Current Element Value & Event Info Payload me Merge Karein
    payload._val = element.value;
    payload._type = eventType;
    
    if (element.type === 'checkbox' || element.type === 'radio') {
        payload._checked = element.checked;
    }

    let selectedText = '';
    if (element.tagName === 'SELECT') {
        selectedText = element.options[element.selectedIndex]?.text;
        payload.value = element.value;
    }
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        // Normal Inputs (Text, Email, Number, Hidden, etc.)
        //payload._id = element.id || '';
        //payload._name = element.name || '';
        payload.value = element.value;
        //payload._type = element.type; // 'text', 'email', 'number', etc.
        //payload._length = element.value.length; // Characters length check karne ke liye
    } 

    onConsole({ msg: `[${eventType.toUpperCase()}] Function Triggered: ${funName}` });
    onConsole({ msg: "Payload Data:", data: payload });

    if (funName !== 'na' && typeof window[funName] === 'function') {
        window[funName](payload, element);
    } else if (funName === 'na') {
        alert(`Invalid data-fun: ${funName}. Please correct.`);
    }
}

/***************************** HELPING FUNC BELOW **********************************/

function onConsole({ msg, data = null, type = 'log' }) {
    if (typeof console[type] === 'function') {
        console[type](`${msg}:`, data);
    } else {
        console.log(`${msg}:`, data);
    }
}

function showError(form, response, reload = false) {
    let $form =$(form); 

    $form.find('.error').removeClass('invalid-feedback').html('');
	$form.find('input, select, textarea').removeClass('is-invalid');

    if (response.status === 'success' || response.status === true) {
        
    } else if (response.errors) {
        let errors = response.errors;

        $.each(errors, function (key, value) {
            // Escape special characters in key (like dots in array validation)
            let fieldKey = key.replace(/(:|\.\[\vert{}\]|,|=|@)/g, "\\$1");
            let $input =$form.find(`#${fieldKey}`);

            // Agar ID se na mile toh name attribute se search karein
            if ($input.length === 0) {    $input = $form.find(`[name="${key}"]`);     }

            $input.addClass('is-invalid').siblings('.error').addClass('invalid-feedback')
			.html(Array.isArray(value) ? value[0] : value);
        });
    }
	if (reload) {	window.location.reload();	}
}

function btnsLoading(action) {
  const btnsElements = document.getElementsByClassName("btns");
  const loadingElements = document.getElementsByClassName("loading");
  if (btnsElements) {
    for (let element of btnsElements) {
      element.style.display = action ? "none" : "block"; // Hide if action is true, show otherwise
    }
  }
  if (loadingElements) {
    for (let element of loadingElements) {
      element.style.display = action ? "block" : "none"; // Show if action is false, hide otherwise
    }
  }
}

function pubHref(params) {
    // Default values for href, target, and method
    const href = params.href || '';
    const target = params.target || '_self'; // _self is default to open in the same window
    const method = params.method || 'POST'; // Default method is POST
    const queryParams = params.queryParams || {}; // Ensure queryParams is an empty object if not in params
    const bodyParams = params.bodyParams || {};
    //alert(target);
    // Construct the query string from queryParams object if exists
    let queryString = '';
    if (Object.keys(queryParams).length > 0 && method === 'GET') {
        queryString = '?' + new URLSearchParams(queryParams).toString();
    }

    // Construct the full URL with query string for GET requests
    const fullUrl = href + queryString;

    if (method === 'GET') {
        // For GET request, just open the URL
        window.open(fullUrl, target);
    } else if (method === 'POST') {
        // For POST request, create a form dynamically and submit it
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = fullUrl;
        form.target = target;

        // Add bodyParams as hidden fields in the form
        Object.keys(bodyParams).forEach(key => {
        //Object.keys(queryString).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = bodyParams[key];
            form.appendChild(input);
        });

        // Append the form to the body and submit
        document.body.appendChild(form);
        form.submit();
    } else {
        console.error('Unsupported HTTP method');
    }
}

function goMsg(res, array = {}) {
    //if (res.reload) setTimeout(() => location.reload());
    //if (res.url) setTimeout(() => location.href = res.url);

    if(!res){    onConsole({msg: "No Response data in goMsg :", data: res});    return;  }
    //else{     onConsole({msg: "Response has data in goMsg :", data: res});    }

    if (res.alert === 'swal') {
		if(res.status === 'html' || res.status === 'data'){
			onConsole({msg: "Response data in goMsg :", data: res});
			return;
		}else{
            if (res.status === 'success' || res.status === true ) {   res.status = 'success';     }
            if (!['info', 'warning', 'error'].includes(res.status)) {     res.status = "error";    }
			Swal.fire({
				title: res.title || (res.status === 'success' ? 'Success!' : 'Alert'),
				text: res.message || res.msg || '',
				icon: res.status || 'info', // success, error, warning, info
				//timer: res.timer || 3000
			});
			
			// Agar reload true hai toh swal ke baad reload karein
			if (res.reload === "reload") {     setTimeout(() => location.reload(), res.timer || 1500);    }
			return; // Swal dikhane ke baad function yahan se exit ho jaye
		}
    }

    // Normal Logic
    if (res.status === 'html') {
        if (array.div) {      document.getElementById(array.div).innerHTML = res.html;      }
    } 
    else if (res.status === 'success' || res.status === true ) {
        res.status = 'success';
        toastalert.showToast(res);
        //if (res.reload === "reload") {      setTimeout(() => location.reload(), 1500);     }
    } 
    else if (res.status === 'data') {     onConsole({msg:"Response status data in goMsg:",data: res});   } 
    else if (res.status === 'redirect') {     
        setTimeout(() => location.href = res.url, 500);
    }
    else if (res.status === 'reload') {     
        setTimeout(() => location.reload(),  500); 
    } 
    else { 
        if (!['info', 'warning', 'error'].includes(res.status)) {     res.status = "error";    }
         toastalert.showToast(res);
    }
}

async function getFormData(array) {
    let formData;

    if (array instanceof FormData) {
        formData = array;
    } else if ('form_id' in array) {
        const form = document.getElementById(array['form_id']);
        formData = new FormData(form);
    } else if (typeof array === 'object') {
        formData = new FormData();
        for (const key in array) {
            if (array.hasOwnProperty(key)) {
                formData.append(key, array[key]);
            }
        }
    } else {
        goMsg({status: "error", message: "Unable to create FormData"});
        return null;
    }
	//Jab aap await compressImages(formData) call karte ho,
	//Woh andar se formData.delete(key) karke purane image files hata deta hai,
	//Fir compressed versions ko formData.append(key, file, file.name) se dobara add kar deta hai.
	//Isliye jab aap return formData; likhte ho, aapko wahi updated FormData object milta hai jisme compressed images replace ho chuke hote hain.
    await compressImages(formData);
    // await Promise.resolve();
    //console.log(formData);
    return formData;
}

function compressImages(formData) {
    //ensureCompressorLoaded(); // 🚫 stops execution if missing
    const filesToCompress = {};
    for (let [key, value] of formData.entries()) {
        if (value instanceof File && value.type.startsWith("image/")) {
            (filesToCompress[key] ??= []).push(value);
        }
    }

    if (!Object.keys(filesToCompress).length) {      return Promise.resolve();    }
    const compressionPromises = [];

    Object.entries(filesToCompress).forEach(([key, files]) => {
        files.forEach(file => {
            compressionPromises.push(
                new Promise((resolve, reject) => {
                    try {
                        new Compressor(file, {
                            quality: 0.5,
                            success(result) {
                                const compressedFile = new File( [result], file.name, {type: result.type}	);
                                resolve({key, file: compressedFile});
                            },
                            error(err) {
                                const msg = `CompressorJS is not loaded.Include any valid CompressorJS CDN: https://cdn.jsdelivr.net/npm/compressorjs/dist/compressor.min.js`;
                                goMsg({ status: "error",  message: msg});
                                reject(err);
                            }
                        });
                    } catch (err) {
                        const msg = `CompressorJS is not loaded.Include any valid CompressorJS CDN: https://cdn.jsdelivr.net/npm/compressorjs/dist/compressor.min.js`;
                        goMsg({ status: "error",  message: msg});
                        reject(err);
                    }
                })
            );
        });
    });

    return Promise.all(compressionPromises).then(compressedFiles => {
        Object.keys(filesToCompress).forEach(key => formData.delete(key));
        compressedFiles.forEach(({ key, file }) => {
            formData.append(key, file, file.name);
        });
    });
}

async function myPostAsk(arr, path = '') {
    const result = await dsAlert.question('Are you sure to proceed..??');
    if (result === 'yes') {
        myPost(arr, path = '');
    } else if (result === 'no') {
       // dsAlert.warning('User cancelled action');
    } else {
      //  dsAlert.info('Action cancelled.');
    }
}

async function myPostCheck(data = {}, path = '') {

    const checked = $('.check:checked')
        .map(function () {
            return $(this).val();
        })
        .get();

    if (!checked.length) {
        goMsg({
            status: 'info',
            msg: 'Please select at least one record'
        });

        throw new Error('No records selected');
    }

    data.checked = checked.join(',');

    return myPost(data, path);
}

async function myPostPass(data = {}, path = '') {

    const result = await Swal.fire({
        title: 'Warning',
        text: 'Enter Password',
        input: 'password',
        icon: 'success',
        showCancelButton: true,
    });

    if (!result.isConfirmed || !result.value?.trim()) {
        throw new Error('User cancelled or empty input.');
    }

    data.password = result.value;

    return myPost(data, path);
}


async function myPostInput(data = {}, path = "") {

    const result = await Swal.fire({
        title: "Warning",
        text: "Enter Remarks",
        input: "text",
        icon: "success",
        showCancelButton: true,
    });

    if (!result.isConfirmed || !result.value?.trim()) {
        throw new Error("User cancelled or empty input.");
    }

    data.remarks = result.value.trim();

    return myPost(data, path);
}



async function myPostDate(data = {}, path = "") {

    const today = new Date().toISOString().split('T')[0];

    const result = await Swal.fire({
        title: "Select Date",
        text: "Choose a date",
        input: "date",
        inputValue: today,
        icon: "success",
        showCancelButton: true,
    });

    if (!result.value) {
        throw new Error("User cancelled or no date selected.");
    }

    data.date = result.value;

    return await myPost(data, path);
}

async function myPost(arr, path = '') {
    const finalPath = path === '' ? actionPath : path;
    //console.log('myPost called with arr:', arr, 'finalPath:', finalPath);
    try {
        const response = await axiosSubmit(arr, finalPath);
        // Check if response status is 'success' or true
        const isSuccess = response?.status === 'success' || response?.status === true;
        if (isSuccess && arr?.callback && typeof window[arr.callback] === "function") {
            window[arr.callback](response);
        } else {
            goMsg(response, arr);
        }
        // Return the response from the function
        return response;

    } catch (error) {
        const errorMsg = { status: "error", msg: "Opps!!! Something went wrong in myPost" };
        goMsg(errorMsg);
        // Return error object or rethrow as needed
        return errorMsg;
    }
}
