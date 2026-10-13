
class dsAlert {
    constructor() {
		this.icons = {
		  success: `
			<svg width="22" viewBox="0 0 24 24" fill="none" stroke="#2f855a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M20 6L9 17l-5-5"/>
			</svg>`,

		  error: `
			<svg width="22" viewBox="0 0 24 24" fill="none" stroke="#c53030" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <circle cx="12" cy="12" r="10"></circle>
			  <line x1="15" y1="9" x2="9" y2="15"></line>
			  <line x1="9" y1="9" x2="15" y2="15"></line>
			</svg>`,

		  warning: `
			<svg width="22" viewBox="0 0 24 24" fill="none" stroke="#b7791f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <path d="M10.29 3.86l-8 14A1 1 0 003 19h18a1 1 0 00.86-1.5l-8-14a1 1 0 00-1.72 0z"></path>
			  <line x1="12" y1="9" x2="12" y2="13"></line>
			  <line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>`,
			
		question:`❓`,

		  info: `
			<svg width="22" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			  <circle cx="12" cy="12" r="10"></circle>
			  <line x1="12" y1="16" x2="12" y2="12"></line>
			  <line x1="12" y1="8" x2="12.01" y2="8"></line>
			</svg>`
		};
        this.gradients = {
			  success: "linear-gradient(135deg,#d4f7df,#b3f0c5)",
			  error: "linear-gradient(135deg,#ffd4d4,#ffb3b3)",
			  warning: "linear-gradient(135deg,#fff2d4,#ffe3b3)",
			  info: "linear-gradient(135deg,#d4e7ff,#c2dbff)"
		};
        this.alertShown = false;
        this.currentResolve = null;
        this.initStyles();
        this.types = {
            success: {
                icon: '✅',
                bgColor: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                btnColor: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                defaultTitle: 'Success'
            },
            error: {
                icon: '❌',
                bgColor: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
                btnColor: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
                defaultTitle: 'Error'
            },
            warning: {
                icon: '⚠️',
                bgColor: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                btnColor: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                defaultTitle: 'Warning'
            },
            info: {
                icon: 'ℹ️',
                bgColor: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                btnColor: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
                defaultTitle: 'Information'
            },
            question: {
                icon: '❓',
                bgColor: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)',
                btnColor: 'linear-gradient(135deg, #9C27B0 0%, #6A1B9A 100%)',
                defaultTitle: 'Confirm'
            }
        };
    }
    // inside class
    initStyles() {
        // Remove any existing style element
        const existingStyle = document.getElementById('dsalert-styles');
        if (existingStyle) existingStyle.remove();

        // Create and inject styles
        const style = document.createElement('style');
        style.id = 'dsalert-styles';
        style.textContent = `
            .dsalert-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                animation: dsalertFadeIn 0.3s ease forwards;
                backdrop-filter: blur(3px);
            }
            
            .dsalert-box {
                /*background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);*/
                background: linear-gradient(135deg,#d4f7df,#b3f0c5);
                border-radius: 20px;
                width: 90%;
                max-width: 400px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                transform: scale(0.8) translateY(-50px);
                animation: dsalertPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards 0.1s;
                /*border: 1px solid rgba(255,255,255,0.2);*/
            }
            
            .dsalert-header {
                padding: 10px;
                text-align: center;
                position: relative;
                overflow: hidden;
                color: white;
            }
            
            .dsalert-title {
                font-size: 24px;
                font-weight: 600;
                margin: 0;
                position: relative;
                z-index: 1;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            
            .dsalert-body {
                padding: 20px 10px;
                text-align: center;
                font-size: 18px;
                color: #333;
                line-height: 1.5;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            
            .dsalert-body img {
                max-width: 100%;
                max-height: 200px;
                border-radius: 10px;
                margin-bottom: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
			.dsalert-buttons {
				  text-align: center;
				  padding: 0 20px 25px 20px;
				  width: 100%;
				  margin: auto;
				}
            .dsalert-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 5px;
                /*font-size: 16px;*/
				font-size: clamp(0.8rem, 1vw, 2rem);
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Segoe UI', Arial, sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                position: relative;
                overflow: hidden;
                color: white;
				display: inline-block;
				margin: 0 6px;
				min-width: 70px;
            }
            
            .dsalert-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .dsalert-btn:active {
                transform: translateY(0);
            }
            
            .dsalert-btn-yes {
                background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
            }
            
            .dsalert-btn-yes:hover {
                background: linear-gradient(135deg, #43A047 0%, #1B5E20 100%);
            }
            
            .dsalert-btn-no {
                background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
            }
            
            .dsalert-btn-no:hover {
                background: linear-gradient(135deg, #e53935 0%, #b71c1c 100%);
            }
            
            .dsalert-btn-ok {
                background: linear-gradient(135deg, #2196F3 0%, #0D47A1 100%);
            }
            
            .dsalert-btn-ok:hover {
                background: linear-gradient(135deg, #1E88E5 0%, #0D47A1 100%);
            }
            
            .dsalert-btn-cancel {
                background: linear-gradient(135deg, #757575 0%, #424242 100%);
            }
            
            .dsalert-btn-cancel:hover {
                background: linear-gradient(135deg, #616161 0%, #212121 100%);
            }
            
            .dsalert-icon {
                font-size: 30px;
                margin-bottom: 0px;
                animation: dsalertIconBounce 0.6s ease;
                display: inline-block;
            }
            
            @keyframes dsalertFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes dsalertPopIn {
                from { 
                    transform: scale(0.8) translateY(-50px);
                    opacity: 0;
                }
                to { 
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes dsalertPopOut {
                from { 
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }
                to { 
                    transform: scale(0.8) translateY(-50px);
                    opacity: 0;
                }
            }
            
            @keyframes dsalertIconBounce {
                0% { transform: scale(0); }
                60% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .dsalert-icon-shake {
                animation: dsalertIconShake 0.5s ease;
            }
            
            @keyframes dsalertIconShake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            .dsalert-closing {
                animation: dsalertPopOut 0.3s ease forwards !important;
            }
            
            @media (max-width: 480px) {
                .dsalert-box {
                    width: 90%;
                    border-radius: 10px;
                }
                
                .dsalert-title {
                    font-size: 16px;
                }
                
                .dsalert-body {
                    font-size: 14px;
                    padding: 20px 15px;
                }
				
                .dsalert-buttons {
				  text-align: center;
				  padding: 0 20px 25px 0px;
				  width: 100%;
				  margin: auto;
				}

				.dsalert-btn {
				  display: inline-block;
				  margin: 0 6px;
				  min-width: 70px;
				  padding: 16px 24px;
				}
                /*.dsalert-buttons {
                    flex-direction: column;
                    gap: 5px;
                    padding: 0 75px 20px 75px;
                }*/
                
                .dsalert-btn {
                    padding: 5px;
                }
                
                .dsalert-icon {
                    font-size: 30px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    // inside class
    show(message, options = {}) {
        if (this.alertShown) return Promise.reject("Alert already showing");
        this.alertShown = true;

        return new Promise((resolve) => {
            this.currentResolve = resolve;

            // Extract options
            const {
                type = 'info',
                title = null,
                showButtons = true,
                buttons = [],
                imageUrl = null,
                html = false,
                autoClose = false,
                closeTime = 3000
            } = options;

            // Get type configuration
            const typeConfig = this.types[type] || this.types.info;
            const alertTitle = title || typeConfig.defaultTitle;

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'dsalert-overlay';
            
            // Create alert box
            const alertBox = document.createElement('div');
            alertBox.className = 'dsalert-box';
			//alertBox.id = 'dsalert-box';
			alertBox.style.background = this.gradients[type];
            
			
            // Create header with type-based background
            const header = document.createElement('div');
            header.className = 'dsalert-header';
            header.style.background = typeConfig.bgColor;
            
			const titleEl = document.createElement('h2');
            titleEl.className = 'dsalert-title';
            titleEl.textContent = alertTitle;
			//titleEl.innerHTML = `${this.icons[type]} ${alertTitle}`;
            
            header.appendChild(titleEl);
            
            // Create body
            const body = document.createElement('div');
            body.className = 'dsalert-body';
            
            // Add icon
            const icon = document.createElement('div');
            icon.className = 'dsalert-icon';
            //if (type === 'error') {     icon.classList.add('dsalert-icon-shake');       }
            icon.innerHTML = typeConfig.icon;
            
            body.appendChild(icon);
            
            // Add message or HTML
            if (html) {
                const htmlContainer = document.createElement('div');
                htmlContainer.innerHTML = message;
                body.appendChild(htmlContainer);
            } else if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = 'Alert Image';
                img.onload = () => {
                    img.style.animation = 'dsalertPopIn 0.3s ease';
                };
                body.appendChild(img);
                
                if (message) {
                    const messageEl = document.createElement('div');
                    messageEl.textContent = message;
                    messageEl.style.marginTop = '15px';
                    body.appendChild(messageEl);
                }
            } else {
                const messageEl = document.createElement('div');
                messageEl.textContent = message;
				//messageEl.innerHTML = `${this.icons[type]} ${message}`;
                body.appendChild(messageEl);
            }
            
            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'dsalert-buttons';
            
            // Add buttons based on type
            if (showButtons) {
                if (buttons.length > 0) {
                    // Custom buttons
                    buttons.forEach(btn => {
                        const button = document.createElement('button');
                        button.className = `dsalert-btn dsalert-btn-${btn.type || 'ok'}`;
                        button.textContent = btn.text;
                        button.onclick = () => this.closeAlert(alertBox, overlay, btn.value || btn.text.toLowerCase());
                        buttonsContainer.appendChild(button);
                    });
                } else if (type === 'question') {
                    // Yes/No/Cancel for question type
                    const yesBtn = this.createButton('Yes', 'yes', alertBox, overlay, 'yes');
                    const noBtn = this.createButton('No', 'no', alertBox, overlay, 'no');
                    const cancelBtn = this.createButton('Cancel', 'cancel', alertBox, overlay, 'cancel');
                    
                    buttonsContainer.appendChild(yesBtn);
                    buttonsContainer.appendChild(noBtn);
                    //buttonsContainer.appendChild(cancelBtn);
                } else {
                    // OK button for other types
                    const okBtn = this.createButton('OK', 'ok', alertBox, overlay, 'ok');
                    buttonsContainer.appendChild(okBtn);
                }
            }
            
            // Assemble alert box
            alertBox.appendChild(header);
            alertBox.appendChild(body);
            if (showButtons) {
                alertBox.appendChild(buttonsContainer);
            }
            
            // Add to overlay
            overlay.appendChild(alertBox);
            
            // Add to document
            document.body.appendChild(overlay);
            
            // Close on overlay click (only if not question type)
            if (type !== 'question') {
                overlay.onclick = (e) => {
                    if (e.target === overlay) {
                        this.closeAlert(alertBox, overlay, 'cancel');
                    }
                };
            }
            
            // Auto close if enabled
            if (autoClose && showButtons) {
                setTimeout(() => {
                    this.closeAlert(alertBox, overlay, 'auto_close');
                }, closeTime);
            }
        });
    }
    //inside class
    createButton(text, type, alertBox, overlay, returnValue) {
        const button = document.createElement('button');
        button.className = `dsalert-btn dsalert-btn-${type}`;
        button.textContent = text;
        button.onclick = () => this.closeAlert(alertBox, overlay, returnValue);
        return button;
    }
    // inside class
    closeAlert(alertBox, overlay, value) {
        alertBox.classList.add('dsalert-closing');
        
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            this.alertShown = false;
            if (this.currentResolve) {
                this.currentResolve(value);
                this.currentResolve = null;
            }
        }, 300);
    }

    // Shortcut methods for different alert types inside class
    success(message, title = null, options = {}) {
        return this.show(message, { ...options, type: 'success', title });
    }

    error(message, title = null, options = {}) {
        return this.show(message, { ...options, type: 'error', title });
    }

    warning(message, title = null, options = {}) {
        return this.show(message, { ...options, type: 'warning', title });
    }

    info(message, title = null, options = {}) {
        return this.show(message, { ...options, type: 'info', title });
    }

    question(message, title = null, options = {}) {
        return this.show(message, { ...options, type: 'question', title });
    }

    image(message, imageUrl, title = null, options = {}) {
        return this.show(message, { ...options, type: 'info', title, imageUrl });
    }

    html(htmlContent, title = null, options = {}) {
        return this.show(htmlContent, { ...options, type: 'info', title, html: true });
    }
    // class close here 
}

const alertInstance = new dsAlert();
window.dsAlert = alertInstance;  // window.dsAlert के रूप में
dsAlert = alertInstance;         // dsAlert के रूप में (global variable)

function dailog(params) {
    // 👉 If params is string → treat as error message
    if (typeof params === 'string') {	return dsAlert.error(params, 'Error');		}

    // 👉 If params is array → [message, title, status]
    if (Array.isArray(params)) {
            const [message, title = 'Alert', status = 'error'] = params;
            return dsAlert[status]?.(message, title) || dsAlert.error(message, title);
    }

    // 👉 Must be object
    if (!params || typeof params !== 'object') {
            return dsAlert.info('Invalid parameters provided', 'Alert');
    }

    const { status = 'info', message = '', msg = '', title = 'Alert' } = params;

    //const joinWithSpace = (...parts) =>    parts.flat().filter(Boolean).join(' ');	
    //const finalMessage = `${message} ${msg}`.trim();
    //const finalMessage = joinWithSpace(message, msg);

    const finalMessage = [message, msg].flat().filter(Boolean).join(' ');
    dsAlert[status]?.(finalMessage || 'No message provided', title);
}


// video modal code start here
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('view-video')) {
        e.preventDefault();
        showVideoModal(e.target.currentSrc || e.target.src);
    }
});

function showVideoModal(videoUrl) {

    // Remove existing modal
    const existing = document.querySelector('.video-modal-overlay');
    if (existing) existing.remove();

    // Add CSS once
    if (!document.getElementById('video-modal-style')) {

        const style = document.createElement('style');
        style.id = 'video-modal-style';

        style.textContent = `
        .video-modal-overlay{
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.9);
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:999999;
        }

        .video-modal-content{
            position:relative;
            width:90%;
            max-width:1000px;
            background:#000;
            border-radius:10px;
            overflow:hidden;
        }

        .video-modal-content video{
            width:100%;
            height:auto;
            max-height:90vh;
            background:#000;
        }

        .video-modal-close{
            position:absolute;
            top:10px;
            right:15px;
            color:#fff;
            font-size:35px;
            cursor:pointer;
            z-index:2;
        }

        .fullscreen-btn{
            position:absolute;
            bottom:15px;
            right:15px;
            z-index:2;
            background:rgba(255,255,255,0.2);
            color:#fff;
            border:none;
            padding:8px 12px;
            border-radius:5px;
            cursor:pointer;
        }
        `;

        document.head.appendChild(style);
    }

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'video-modal-overlay';

    // Modal
    const modal = document.createElement('div');
    modal.className = 'video-modal-content';

    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'video-modal-close';
    closeBtn.innerHTML = '&times;';

    // Video
    const video = document.createElement('video');
    video.src = videoUrl;
    video.controls = true;
    video.autoplay = true;

    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fullscreen-btn';
    fullscreenBtn.innerText = 'Fullscreen';

    fullscreenBtn.onclick = function () {

        if (video.requestFullscreen) {
            video.requestFullscreen();
        } 
        else if (video.webkitRequestFullscreen) {
            video.webkitRequestFullscreen();
        } 
        else if (video.msRequestFullscreen) {
            video.msRequestFullscreen();
        }
    };

    // Close function
    function closeModal() {
        video.pause();
        overlay.remove();
    }

    closeBtn.onclick = closeModal;

    // ESC key close
    document.addEventListener('keydown', function escHandler(ev){
        if(ev.key === 'Escape'){
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });

    // Outside click close
    overlay.addEventListener('click', function(ev){
        if(!modal.contains(ev.target)){
            closeModal();
        }
    });

    // Append
    modal.appendChild(closeBtn);
    modal.appendChild(video);
    modal.appendChild(fullscreenBtn);

    overlay.appendChild(modal);

    document.body.appendChild(overlay);
}

// image modal code start here
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('view-image')) {
    showImageModal(e.target.src);
  }
});

function showImageModal(imageUrl) {
    // Remove existing modal if open
    const existing = document.querySelector('.image-modal-overlay');
    if (existing) {		existing.remove();	}
    // Inject styles only once
    if (!document.getElementById('image-modal-style')) {
            const style = document.createElement('style');
            style.id = 'image-modal-style';
            style.textContent = `
   .image-modal-overlay {
     position: fixed;
     top: 0; left: 0;
     width: 100%; height: 100%;
     background: rgba(0,0,0,0.8);
     display: flex;
     justify-content: center;
     align-items: center;
     z-index: 99999;
     animation: fadeInOverlay 0.3s ease-in-out;
   }

   .image-modal-content {
     position: relative;
     background: #fff;
     padding: 8px;
     border-radius: 8px;
     max-width: 90%;
     max-height: 90%;
     box-shadow: 0 0 15px rgba(0,0,0,0.3);
     animation: fadeInModal 0.4s ease-in-out;
   }

   .image-modal-content img {
     max-width: 100%;
     max-height: 80vh;
     border-radius: 5px;
   }

   .image-modal-close {
     position: absolute;
     top: 5px;
     right: 10px;
     font-size: 24px;
     font-weight: bold;
     color: #333;
     cursor: pointer;
   }

   @keyframes fadeInOverlay {
     from { opacity: 0; }
     to { opacity: 1; }
   }

   @keyframes fadeInModal {
     from { transform: scale(0.9); opacity: 0; }
     to { transform: scale(1); opacity: 1; }
   }
 `;
    document.head.appendChild(style);
}

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'image-modal-overlay';

    // Create modal box
    const modal = document.createElement('div');
    modal.className = 'image-modal-content';

    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'image-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => overlay.remove();

    // Image
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Preview';

    // Append
    modal.appendChild(closeBtn);
    modal.appendChild(img);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close on outside click
    overlay.addEventListener('click', function (e) {
        if (!modal.contains(e.target)) {    overlay.remove();    }
    });
}
