

// toast lib code start here
(function (root, $, undefined) {
  const toastLib = {};

  toastLib.showToast = function (options) {
    const settings = Object.assign({
      message: "Message Content",
      status: "info", // success, error, warning, info
      duration: 4000,
      reload: false,
      url: null,
      position: "top-right"
    }, options);
	
	// If options has `msg`, assign it to `message` 
	if (options && options.msg) { settings.message = options.msg; }
	
    const toastId = "toast_" + Date.now();

    // ------------------------------
    // SVG icons (modern look)
    // ------------------------------
    const icons = {
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

        info: `
              <svg width="22" viewBox="0 0 24 24" fill="none" stroke="#2b6cb0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>`
      };


    const gradients = {
      success: "linear-gradient(135deg,#d4f7df,#b3f0c5)",
      error: "linear-gradient(135deg,#ffd4d4,#ffb3b3)",
      warning: "linear-gradient(135deg,#fff2d4,#ffe3b3)",
      info: "linear-gradient(135deg,#d4e7ff,#c2dbff)"
    };

    // POSITIONING
    let pos = settings.position.toLowerCase();
    const validPos = ["top-left", "top-right", "bottom-left", "bottom-right", "center"];
    if (!validPos.includes(pos)) pos = "top-right";

    let container = document.querySelector(`.toast-container.${pos}`);
    if (!container) {
      container = document.createElement("div");
      container.className = `toast-container ${pos}`;
      container.style.position = "fixed";
      container.style.zIndex = "9999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "12px";
      container.style.padding = "10px";

      if (pos === "center") {
        container.style.left = "50%";
        container.style.top = "50%";
        container.style.transform = "translate(-50%,-50%)";
        container.style.alignItems = "center";
      } else {
        container.style[pos.includes("bottom") ? "bottom" : "top"] = "20px";
        container.style[pos.includes("right") ? "right" : "left"] = "20px";
      }

      document.body.appendChild(container);
    }

    // ------------------------------
    // Toast Box UI
    // ------------------------------
    const toast = document.createElement("div");
    toast.id = toastId;
    toast.className = "toast-item";
    toast.style.minWidth = "300px";
    toast.style.maxWidth = "350px";
    toast.style.padding = "15px 20px";
    toast.style.borderRadius = "14px";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "14px";
    toast.style.background = gradients[settings.status];
    toast.style.backdropFilter = "blur(18px)";
    toast.style.boxShadow = "0px 4px 15px rgba(0,0,0,0.15)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "all .45s ease";

    toast.innerHTML = `
      <div class="toast-icon">${icons[settings.status]}</div>
      <div class="toast-message" style="flex:1;color:#333;font-size:15px;font-weight:500;">
        ${settings.message}
      </div>
      <div class="toast-close" style="cursor:pointer;font-size:18px;color:#555;">
        &times;
      </div>
    `;

    container.appendChild(toast);

    // fade + slide in animation
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 50);

    // close button action
    toast.querySelector(".toast-close").onclick = () => removeToast(toast, container);

    // auto remove
    setTimeout(() => removeToast(toast, container), settings.duration);

    // reload or redirect
    if (settings.reload) setTimeout(() => location.reload(), settings.duration + 500);
    if (settings.url) setTimeout(() => location.href = settings.url, settings.duration + 500);
  };

  function removeToast(toast, container) {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => {
      toast.remove();
      if (!container.hasChildNodes()) container.remove();
    }, 400);
  }

  if ($) {
    $.fn.toastAlert = function (options) {
      toastLib.showToast(options);
      return this;
    };
  }

  root.toastalert = toastLib;
})(window, window.jQuery);
//toastalert.showToast({message:'No Session. Redirecting to Login', status:'error'});
